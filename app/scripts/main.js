/*global require:false */
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
    romania: 'romania',
    jquery: 'vendor/jquery.min'
  }
});

require(['romania'], function (Romania) {
  var config = {
    title: 'Sample map',
    domain: [-1, 2],
    range: ['brown', 'steelblue'],
    defaultFill: 'black',
    formula: 'data.members',
    datafile: '/data/hp-team.csv',
    target: '#map'
  };
  var map = new Romania(config);
});