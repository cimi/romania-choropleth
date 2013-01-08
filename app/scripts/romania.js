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
      .scale(7000),
    'default' : 'albers'
  };

  var scales = {};

  var fill = d3.scale.linear()
    .domain([-200000, 200000])
    .range(["brown", "steelblue"]);
  var path = d3.geo.path().projection(projections.albers);

  var Romania = function (config) {
    var mandatory = ['title', 'datafile', 'formula', 'domain'];
    
    mandatory.forEach(function (param) {
      if (!config[param]) throw new Error (param + ' is not present in the configuration');
    });
    
    this.config = config;

    var q = queue()
      .defer(d3.json, "/data/romania-counties-topojson.json")
      .defer(d3.tsv, config.datafile)
      .await($.proxy(dataLoaded, this));
  };

  var dataLoaded = function (error, topology, data) {
    this.data = data;

    var map = d3.select('#map').append('svg')
        .style('width', width)
        .style('height', height);
    var geojson = topojson.object(topology, topology.objects['romania-counties-geojson']);
    var counties = map.append('g')
        .attr('class', 'counties')
        .selectAll('path').data(geojson.geometries)
        .enter().append('path').attr('d', path)
        .style("fill", function (d) { return fill(d.properties.POP2004 - d.properties.POP1956); })

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