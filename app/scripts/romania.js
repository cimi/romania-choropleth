define(['d3', 'queue', 'topojson', 'handlebars', 'jquery'], function(d3, queue, topojson, Handlebars, $) {
  "use strict";
  var width = 960
    , height = 600
    , map;

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
    var result = {};
    $.extend(result, config);
    console.log(result);
    if (!config.target) {
      result.target = '#map';
    }

    // set the correct scale from d3 if available, if not default to linear
    if (!d3.scale[config.scale]) {
      result.scale = d3.scale.linear;
    } else {
      result.scale = d3.scale[config.scale];
    }

    if (!projections[config.projection]) {
      result.projection = projections.albers;
    } else {
      result.projection = projections[config.projection];
    }

    if (!config.range || !config.range instanceof Array) {
      result.range = ['brown', 'steelblue'];
    }

    return result;
  }

  var createFormulaFunction = function (formula) {
    var func = new Function('data', 'return ' + formula);
    return func;
  }

  var processData = function (data) {
    var result = {};
    data.forEach(function (val) {
      result[val.id] = val;
    });
    return result;
  }

  var Romania = function (config) {
    // enforce mandatory fields    
    ['title', 'datafile', 'formula', 'domain'].forEach(function (param) {
      if (!config[param]) throw new Error (param + ' is not present in the configuration');
    });
    
    this.config = createConfig(config);
    this.config.formula = createFormulaFunction(config.formula);

    // set the fill function depending on the configuration
    this.fill = this.config.scale()
        .domain(this.config.domain)
        .range(this.config.range);

    this.path = d3.geo.path().projection(this.config.projection);

    var q = queue()
      .defer(d3.json, "/data/romania-counties-topojson.json")
      .defer(d3.tsv, config.datafile)
      .await($.proxy(dataLoaded, this));
  };

  var dataLoaded = function (error, topology, data) {
    this.data = processData(data);

    var mapEl = d3.select(this.config.target).append('svg')
        .style('width', width)
        .style('height', height);

    var geojson = topojson.object(topology, topology.objects['romania-counties-geojson']);
    var counties = mapEl.append('g')
        .attr('class', 'counties')
        .selectAll('path').data(geojson.geometries)
        .enter().append('path').attr('d', this.path)
        .style("fill", $.proxy(function (d) {
          return this.fill(this.config.formula(this.data[d.id])); 
        }, this));

    if (this.config.callback) {
      this.config.callback(this); 
    }
  }

  Romania.prototype.getConfig = function () {
    return this.config;
  };

  Romania.prototype.getData = function () {
    return this.data;
  };

  return Romania;
});