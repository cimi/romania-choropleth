require.config({
  shim: {
    d3: {
      exports: 'd3'
    },
    queue: {
      exports: 'queue'
    },
    topojson: {
      exports: 'topojson'
    }
  },

  paths: {
    d3: '../components/d3/d3',
    queue: '../components/queue/queue',
    topojson: '../components/topojson/index',
    jquery: 'vendor/jquery.min'
  }
});
 
require(['d3', 'queue', 'topojson'], function(d3, queue, topojson) {
  var width = 960
    , height = 600
    , map;

  var q = queue()
      .defer(d3.json, "/data/romania-counties-geojson.json")
      .await(ready);

//create geo.path object, set the projection to mercator bring it to the svg-viewport
  var mercator = d3.geo.mercator()
      .center([45.7909, 24.7731])
      .translate([2250, 2500])
      .scale(30000);

  var albers = d3.geo.albers()
      .center([24.7731, 45.7909])
      .rotate([-10.4, 2.6, -9.6])
      .parallels([43, 49])
      .scale(7000);

  var path = d3.geo.path().projection(albers);
  var projection = albers;

  function ready(error, countylines) {
    map = d3.select('#map').append('svg')
        .style('width', width)
        .style('height', height);
  
    var counties = map.append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(countylines[0].features)
        .enter().append('path')
        .attr('d', path);
  };
});