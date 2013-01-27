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
    PopulationDemo: 'PopulationDemo',
    SimpleDemo: 'SimpleDemo',
    jquery: 'vendor/jquery.min'
  }
});

require(['jquery'], function ($) {
  ['PopulationDemo', 'SimpleDemo'].forEach(function (demo) {
    if ($('#' + demo).length) {
      require([demo]);
    }
  });
});