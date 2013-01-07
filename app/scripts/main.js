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
    },
    handlebars: {
      exports: 'Handlebars'
    }
  },

  paths: {
    d3: '../components/d3/d3',
    queue: '../components/queue/index',
    topojson: '../components/topojson/index',
    handlebars: '../components/handlebars/handlebars-1.0.0-rc.1',
    jquery: 'vendor/jquery.min'
  }
});
 
require(['d3', 'queue', 'topojson', 'handlebars'], function(d3, queue, topojson, Handlebars) {
  "use strict"
  var width = 960
    , height = 600
    , map;

  var q = queue()
      .defer(d3.json, "/data/romania-counties-topojson.json")
      .defer(d3.tsv, "/data/romania-counties-population.tsv")
      .await(ready);

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

  var fill = d3.scale.linear()
    .domain([-200000, 200000])
    .range(["brown", "steelblue"]);


  var template = Handlebars.compile($('#infoboxTemplate').html());

  function ready(error, topology, population) {
    map = d3.select('#map').append('svg')
        .style('width', width)
        .style('height', height);
    var data = topojson.object(topology, topology.objects['romania-counties-geojson']);
    
    var counties = map.append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(data.geometries)
        .enter().append('path')
        .attr('d', path)
        .style("fill", function (d) { return fill(d.properties.POP2004 - d.properties.POP1956); })
        .on("mouseover", function (d, i) { hilight(this, d); })
        .on("mouseout", function (d, i) { unhilight(this, d); });

    var hilight = function (element, datum, population) {
      d3.select(element).transition().duration(500).style('fill-opacity', 1);
      console.log(datum)
      $('#infobox').html(template(datum));
    };

    var unhilight = function (element, datum, population) {
      d3.select(element).transition().duration(500).style('fill-opacity', 0.8);
    };
  };
});