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

  // require(['romania'], function (Romania) {
  //   var config = {
  //       title: 'Penis size',
  //       datafile: '/data/test.csv',
  //       domain: [0, 50],
  //       formula: 'data.size',
  //       target: '#map',
  //       infoBox: '#infobox',
  //       infoBoxTemplate: '#infoboxTemplate',
  //       range: ['red', 'green'],
  //       defaultFill: 'black'
  //     };
  //   var map = new Romania(config);
  // });
