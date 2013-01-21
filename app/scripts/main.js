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


if ($('#demo').length) {
  require(['romania'], function (Romania) {
    var topThree = function (map) {
      var data = map.getData()
        , tmp = []
        , three = { top: [], bottom: [] };

      $.each(data, function (key, value) {
        tmp.push({id: key, diff: value.formulaResult});
      });

      tmp.sort(function (a, b) { return a.diff - b.diff });
      var tableRowTemplate = Handlebars.compile('<tr><td>{{id}}<td>{{diff}}');
      three.top = tmp.slice(0, 3);
      three.bottom = tmp.slice(tmp.length - 3).reverse();
      ['top', 'bottom'].forEach(function (set) {
        three[set].forEach(function (county) {
          $('#' + set + 'Three').append(tableRowTemplate(county));
        });
      });
    };
    var config = {
        data: {
          datafile: '/data/population.tsv',
          domain: [-100 * 1000, 100 * 1000],
          formula: 'data.pop2004 - data.pop1956',
          range: ['red', 'steelblue']
        },
        target: '#map',
        infobox: {
          target: '#infobox',
          template: '#template'
        },
        interaction: {
          hilight: {
            callback: function (element, d) {
              $('#infobox').css('background-color', d3.select(element).style('fill'));
            }
          }
        },
        callback : topThree
      };
    var map = new Romania(config);
  });  
}

