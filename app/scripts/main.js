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
    var mapLoaded = function (map) {
      var data = map.getData()
        , tmp = []
        , three = { top: [], bottom: [] };

      $.each(data, function (key, value) {
        tmp.push({id: key, name: value.name, diff: value.formulaResult, pop2004: parseInt(value.pop2004)});
      });

      var setIndex = function (idxName) {
        return function (val, idx) {
          console.log(val.id, idx, val.diff, val.pop2004)
          data[val.id][idxName] = 42 - idx;
        }
      }

      tmp.sort(function (a, b) { return a.diff - b.diff });
      tmp.forEach(setIndex('diffIdx'));
      three.bottom = tmp.slice(0, 3);
      three.top = tmp.slice(tmp.length - 3).reverse();

      tmp.sort(function (a, b) { return a.pop2004 - b.pop2004 });
      tmp.forEach(setIndex('popIdx'));

      var tableRowTemplate = Handlebars.compile('<tr><td>{{name}}<td>{{diff}}');
      ['top', 'bottom'].forEach(function (set) {
        three[set].forEach(function (county) {
          $('#' + set + 'Three').append(tableRowTemplate(county));
        });
      });
    };

    var defaultInfoboxContents = $('#infobox').html();
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
          }, unhilight: {
            callback: function (element, d) {
              $('#infobox').html(defaultInfoboxContents);
            }
          }
        },
        callback : mapLoaded
      };
    var map = new Romania(config);
  });  
}