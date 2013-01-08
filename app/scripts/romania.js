define(['d3', 'queue', 'topojson', 'handlebars'], function(d3, queue, topojson, Handlebars) {
  "use strict"
  var width = 960
    , height = 600
    , map;

  var q = queue()
      .defer(d3.json, "/data/romania-counties-topojson.json")
      .defer(d3.tsv, "/data/romania-counties-population.tsv")
      .await(ready);

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
    default : 'albers'
  };

  var scales = {};  

  var Romania = function (config) {};

  return Romania;
});