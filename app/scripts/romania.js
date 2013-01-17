/*global define:false */
define(['d3', 'queue', 'topojson', 'jquery', 'handlebars'], function(d3, queue, topojson, $, Handlebars) {
  "use strict";
  var width = 960
    , height = 600;

  var projections = {
    mercator : d3.geo.mercator()
      .center([45.7909, 24.7731])
      .translate([2250, 2500])
      .scale(30000),
    albers : d3.geo.albers()
      .center([24.7731, 45.7909])
      .rotate([-10.4, 2.6, -9.6])
      .parallels([43, 49])
      .scale(7000)
  };


  var createConfig = function (config) {
    var result = $.extend({}, config)
      , checks = {
        scale: d3.scale[config.scale],
        projection: projections[config.projection],
        range: config.range,
        defaultFill: config.defaultFill,
        target: config.target
      }, defaults = {
        scale: d3.scale.linear,
        projection: projections.albers,
        range: ['brown', 'steelblue'],
        defaultFill: 'white',
        target: '#map'
      };
    
    // put in defaults
    $.each(checks, function (key, value) {
      if (value) {
        result[key] = value;
      } else {
        result[key] = defaults[key];
      }
    });

    // remember the datafile type
    result.datafileType = /\.([^.]+)$/.exec(config.datafile)[1];

    if (['csv','tsv'].indexOf(result.datafileType) === -1) {
      throw new Error("Unsupported datafile type: " + result.datafileType + "." +
        "Only csv and tsv are supported at the moment. Please use the appropriate extension.");
    }

    if (config.infoBox) {
      result.infoBox = $(config.infoBox);
      var $templateEl = $(config.infoBoxTemplate);

      if (!result.infoBox.length || !$templateEl.length) {
        throw new Error("The info box element or template is not present in the page.");
      }

      result.infoBoxTemplate = Handlebars.compile($(config.infoBoxTemplate).html());
    }

    return result;
  };

  var createFormulaFunction = function (formula) {
    var func = new Function('data', 'return ' + formula);
    return func;
  };

  var processData = function (data) {
    var result = {};
    data.forEach(function (val) {
      result[val.id] = val;
    });
    return result;
  };

  var Romania = function (config) {
    // enforce mandatory fields    
    ['title', 'datafile', 'formula', 'domain'].forEach(function (param) {
      if (!config[param]) {
        throw new Error (param + ' is not present in the configuration');
      }
    });
    
    this.config = createConfig(config);
    this.config.formula = createFormulaFunction(config.formula);

    // set the fill function depending on the configuration
    this.getFillColor = this.config.scale()
        .domain(this.config.domain)
        .range(this.config.range);

    this.path = d3.geo.path().projection(this.config.projection);

    queue()
      .defer(d3.json, "/data/romania-counties-topojson.json")
      .defer(d3[this.config.datafileType], config.datafile)
      .await($.proxy(dataLoaded, this));
  };

  var dataLoaded = function (error, topology, data) {
    if (error) {
      throw new Error("Datafiles could not be loaded correctly.", error);
    }
    var map = this;

    this.data = processData(data);
    var mapEl = d3.select(this.config.target).append('svg')
        .style('width', width)
        .style('height', height);

    var geojson = topojson.object(topology, topology.objects['romania-counties-geojson']);
    // draw the counties
    mapEl.append('g')
        .attr('class', 'counties')
        .selectAll('path').data(geojson.geometries)
        .enter().append('path').attr('d', this.path)
        .attr('class', function (d) { return d.id; })
        .style('fill', $.proxy(this.fill, this))
        .on('mouseover', function (d) { map.hilight(this, d); })
        .on('mouseout', function (d) { map.unhilight(this, d); });

    if (this.config.callback) {
      this.config.callback(this); 
    }
  };

  Romania.prototype.hilight = function (element, d) {
    if (this.config.infoBox && this.config.infoBox.length) {
      var $infobox = this.config.infoBox
        , data = this.data[d.id];
      data.name = d3.select(element).datum().properties.name;
      $infobox.html(this.config.infoBoxTemplate(data));
      $infobox.show();
    }
    d3.select(element).classed('hilight', true);
  };

  Romania.prototype.unhilight = function (element, d) {
    if (arguments.length === 1 && typeof arguments[0] === 'string') {
      this.highlight(this.getCountyElement(arguments[0]), d);
    }
    if (this.config.infoBox && this.config.infoBox.length) {
      this.config.infoBox.hide();
    }
    d3.select(element).classed('hilight', false);
  };

  Romania.prototype.fill = function (d) {
    var countyData = this.data[d.id];
    if (countyData) {
      return this.getFillColor(this.config.formula(this.data[d.id]));   
    } else {
      return this.config.defaultFill;
    }
  };

  Romania.prototype.getConfig = function () {
    return this.config;
  };

  Romania.prototype.getData = function () {
    return this.data;
  };

  Romania.prototype.getCountyElement = function (id) {
    return d3.selectAll('path').filter(function (d) {
      return d.id === id;
    });
  };

  return Romania;
});