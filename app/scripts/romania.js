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

  var TOPOJSON_FILE = 'data/romania-topo.json';

  var createConfig = function (config) {
    // enforce mandatory fields 
    if (config.data) {
      ['datafile', 'formula', 'domain'].forEach(function (param) {
        if (!config.data[param]) {
          throw new Error (param + ' is not present in the data configuration.');
        }
      });      
    }
    
    var result = $.extend(true, {}, config)
      , checks = {
        projection: projections[config.projection],
        defaultFill: config.defaultFill,
        target: config.target,
        interaction: config.interaction
      }, defaults = {
        data: {
          scale: d3.scale.linear,
          range: ['brown', 'steelblue']
        },
        projection: projections.albers,
        defaultFill: 'white',
        target: '#map',
        interaction: {
          hilight: { event: 'mouseover' },
          unhilight: { event: 'mouseout' }
        }
      };
    
    // put in defaults
    $.each(checks, function (key, value) {
      if (value) {
        result[key] = value;
      } else {
        result[key] = defaults[key];
      }
    });

    if (!d3.scale[config.scale]) {
      result.data.scale = defaults.data.scale;
    } else {
      result.data.scale = d3.scale[config.scale];
    }

    if (!config.data.range) {
      result.data.range = defaults.data.range;
    } else {
      result.data.range = config.data.range;
    }

    // if the interaction object was incomplete, copy the default events
    ['hilight', 'unhilight'].forEach(function (val) {
      if (!result.interaction[val]) {
        result.interaction[val] = {};
      }
      if (typeof result.interaction[val].event === 'undefined') {
        result.interaction[val].event = defaults.interaction[val].event;
      }

      if (result.interaction[val].event === false) {
        delete result.interaction[val];
      }
    });

    // remember the datafile type
    if (config.data) {
      result.data.datafileType = /\.([^.]+)$/.exec(config.data.datafile)[1];

      if (['csv','tsv'].indexOf(result.data.datafileType) === -1) {
        throw new Error("Unsupported datafile type: " + result.data.datafileType + "." +
          "Only csv and tsv are supported at the moment. Please use the appropriate extension.");
      }
    }

    if (config.infobox) {
      result.infobox = {};
      result.infobox.target = $(config.infobox.target);
      var $templateEl = $(config.infobox.template);

      if (!result.infobox.target.length || !$templateEl.length) {
        throw new Error("The info box element or template are not present in the page.");
      }

      result.infobox.template = Handlebars.compile($templateEl.html());
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
    this.config = createConfig(config);
    this.config.formula = createFormulaFunction(config.data.formula);

    var loader = queue().defer(d3.json, TOPOJSON_FILE);
    if (this.config.data) {
      // set the fill function depending on the configuration
      this.getFillColor = this.config.data.scale()
          .domain(this.config.data.domain)
          .range(this.config.data.range);
      loader.defer(d3[this.config.data.datafileType], config.data.datafile);
    }
    this.path = d3.geo.path().projection(this.config.projection);
    loader.await($.proxy(dataLoaded, this));
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
    var countyEls = mapEl.append('g')
        .attr('class', 'counties')
        .selectAll('path').data(geojson.geometries)
        .enter().append('path').attr('d', this.path)
        .attr('class', function (d) { return d.id; })
        .style('fill', $.proxy(this.fill, this));

    ['hilight', 'unhilight'].forEach(function (action) {
      if (map.config.interaction[action]) {
        countyEls.on(map.config.interaction[action].event, function (d) { map[action](this, d); });
      }
    });

    if (this.config.callback) {
      this.config.callback(this); 
    }
  };

  Romania.prototype.hilight = function (element, d) {
    if (arguments.length === 1 && typeof arguments[0] === 'string') {
      return this.hilight(this.getCountyElement(arguments[0]), d);
    }
    if (this.config.infobox) {
      var $infobox = this.config.infobox.target
        , data = this.data[d.id];
      data.name = d3.select(element).datum().properties.name;
      $infobox.html(this.config.infobox.template(data));
      $infobox.show();
    }
    d3.select(element).classed('hilight', true);
    if (this.config.interaction && this.config.interaction.hilight.callback) {
      this.config.interaction.hilight.callback(element, d);
    }
  };

  Romania.prototype.unhilight = function (element, d) {
    if (arguments.length === 1 && typeof arguments[0] === 'string') {
      return this.unhilight(this.getCountyElement(arguments[0]), d);
    }
    d3.select(element).classed('hilight', false);
    if (this.config.interaction && this.config.interaction.unhilight.callback) {
      this.config.interaction.unhilight.callback(element, d);
    }
  };

  Romania.prototype.fill = function (d) {
    if (this.data && this.data[d.id]) {
      var countyData = this.data[d.id];
      countyData.formulaResult = this.config.formula(countyData); 
      return this.getFillColor(countyData.formulaResult);   
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