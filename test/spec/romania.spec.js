(function () {
  "use strict";
  var testSuite = function (Romania, $) {
    describe('Choropleth Map Generator For Romania', function() {
      
      var initialConfig, $target, map;

      beforeEach(function () {
        initialConfig = {
          title: 'test configuration',
          data: {
            datafile: 'data/population.tsv',
            domain: [-200000, 200000],
            formula: 'data.pop2004 - data.pop1956',
            scale: 'linear'
          },
          target: '#myMap'
        };
        $target = $(initialConfig.target);
        $target.hide();
      });

      afterEach(function () {
        initialConfig.callback = undefined;
        $target.empty();
      });

      var createEvent = function (eventType) {
        var e = document.createEvent('UIEvents');
        e.initUIEvent(eventType, true, true);
        return e;
      }

      var DEFAULT_HILIGHT_EVENT = createEvent('mouseover')
        , DEFAULT_UNHILIGHT_EVENT = createEvent('mouseout');

      describe('Configure the map', function () {
        beforeEach(function () {
          map = new Romania(initialConfig);
        });

        it('should return a fully populated configuration after instantiation without altering the original object', function () {
          var config = map.getConfig();
          expect(config).to.not.equal(initialConfig);
          ['title', 'datafile', 'domain'].forEach(function (field) {
            expect(config[field]).to.equal(initialConfig[field]);
          });
        });

        it('should enforce mandatory parameters in the configuration', function () {
          var incompleteConfig = {
            title: 'test configuration',
            data: {
              range: ['white', 'black']
            }
          };
          
          (function () {
            new Romania(incompleteConfig);
          }).should.throw(Error);
        });

        it('should generate a function from the formula', function (done) {
          initialConfig.callback = function (map) {        
            var formulaFunc = map.getConfig().formula;
            expect(formulaFunc).to.be.an.instanceOf(Function);
            expect(formulaFunc({id: 'BV', pop2004: '596140', pop1956: '373941'})).to.equal(222199);
            done();
          }
          var map = new Romania(initialConfig);
        });

        it('should set the correct scale for the map coloring', function () {
          var config = map.getConfig();
          expect(config.data.scale, 'the default scale').to.equal(d3.scale.linear);

          initialConfig.scale = 'log';
          map = new Romania(initialConfig);
          config = map.getConfig();
          expect(config.data.scale, 'different scale').to.equal(d3.scale.log);
        });

        it('should have the default color range set to brown - steel blue', function () {
          var config = map.getConfig();
          expect(config.data.range, 'the default range').to.deep.equal(['brown', 'steelblue']);

          initialConfig.data.range = ['orange', 'purple'];
          map = new Romania(initialConfig);
          config = map.getConfig();
          expect(config.data.range, 'custom color range').to.deep.equal(['orange', 'purple']);
        });
      });

      describe('Read the data and make it available', function () {
        var checkData = function (data) {
          expect(data['BV'].pop2004).to.equal('596140');
          expect(data['B'].pop2004).to.equal('1927559');
          expect(data['BV'].name).to.equal('Brașov');
        };

        it('should throw an error if the file extension is not supported', function () {
          initialConfig.data.datafile = 'data/chec.xls';
          (function () {
            new Romania(config);
          }).should.throw(Error);
        })

        it('should support tsv', function (done) {  
          initialConfig.callback = function (map) {
            var data = map.getData();
            expect(Object.keys(data)).to.have.length(42);
            checkData(data);
            done();
          };

          var map = new Romania(initialConfig);
        });

        it('should support csv and should support datafiles without all counties specified', function (done) {
          initialConfig.callback = function (map) {
            var data = map.getData();
            expect(Object.keys(data)).to.have.length(2);
            checkData(data);
            var ct = map.getCountyElement('CT');
            expect(ct.style('fill')).to.equal(initialConfig.defaultFill);
            done();
          };
          initialConfig.data.datafile = 'data/fixture.csv';
          initialConfig.defaultFill = '#bada55';
          var map = new Romania(initialConfig);
        });
      });

      describe('Render the map and color it', function () {
        it('should draw the map and render it on the screen', function (done) {
          initialConfig.callback = function () {
            expect($target.children()).to.have.length(1);
            expect($target.find('path')).to.have.length(42);
            done();
          };
          
          var map = new Romania(initialConfig);
        });

        it('should allow you to select a county element based on its ID', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV');
            expect(bv).to.exist;
            expect(bv.datum().properties.name).to.equal('Brașov');
            done();
          }
          var map = new Romania(initialConfig);
        });

        it('should attach the county ID as a class name to the corresponding path element', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV');
            expect(bv.classed('BV')).to.be.true;
            expect(bv.classed('CT')).to.be.false;
            done();
          }
          var map = new Romania(initialConfig);
        });

        it('should color the map according to the data', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV');
            expect(bv.style('fill')).to.equal(initialConfig.data.range[1]);
            done();
          };
          // setting the exact difference so we can test the upper bound
          initialConfig.data.domain = [-200 * 1000, 222199];
          initialConfig.data.range = ['red', '#800080'];
          initialConfig.data.scale = 'linear';
          var map = new Romania(initialConfig);
        });

        it('should redraw the map when the configuration is changed without reloading the data');
      });

      describe('Allow the behavior of hilight/unhilight to be configurable', function () {
        it('should add the "hilight" css class to a path element that is hilighted (API or mouseover)', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV')
              , bvNode = bv.node();
            bvNode.dispatchEvent(DEFAULT_HILIGHT_EVENT);
            expect(bv.classed('hilight')).to.be.true;
            bvNode.dispatchEvent(DEFAULT_UNHILIGHT_EVENT);
            expect(bv.classed('hilight')).to.be.false;
            map.hilight(bvNode);
            expect(bv.classed('hilight')).to.be.true;
            map.unhilight(bvNode);
            expect(bv.classed('hilight')).to.be.false;
            done();
          };
          var map = new Romania(initialConfig);
        });

        it('should support custom definitions of hilight and unhilight events', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV')
              , bvNode = bv.node();
            expect(bv.classed('hilight')).to.be.false;
            bvNode.dispatchEvent(DEFAULT_HILIGHT_EVENT);
            expect(bv.classed('hilight')).to.be.false;
            bvNode.dispatchEvent(createEvent('mousedown'));
            expect(bv.classed('hilight')).to.be.true;
            bvNode.dispatchEvent(createEvent('mouseup'));
            expect(bv.classed('hilight')).to.be.false;
            done();
          };
          initialConfig.interaction = {
            hilight: { event: 'mousedown' },
            unhilight: { event: 'mouseup' }
          };

          var map = new Romania(initialConfig);
        });

        it('should support hilight and unhilight event code injection', function (done) {
          window.counters = [0, 0];
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV')
              , bvNode = bv.node();
            bvNode.dispatchEvent(DEFAULT_HILIGHT_EVENT);
            bvNode.dispatchEvent(DEFAULT_UNHILIGHT_EVENT);
            setTimeout(function () {
              expect(counters).to.deep.equal([1,1]);
              delete window.counters;
              done();  
            }, 100);
          };
          var hilightCallback = function (element, d) { 
            expect(d3.select(element).classed('BV')).to.be.true;
            expect(d.id).to.equal('BV');
            counters[0] += 1;
          };
          var unhilightCallback = function (element, d) {
            expect(d3.select(element).classed('BV')).to.be.true;
            expect(d.id).to.equal('BV');
            counters[1] += 1;
          };

          initialConfig.interaction = {
            hilight: { callback: hilightCallback }, 
            unhilight: { callback: unhilightCallback }
          };
          var map = new Romania(initialConfig);
        });

        it('should not trigger any hilight if the event is set to false in the config', function (done) {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV')
              , bvNode = bv.node();
            expect(bv.classed('hilight')).to.be.false;
            bvNode.dispatchEvent(DEFAULT_HILIGHT_EVENT);
            expect(bv.classed('hilight')).to.be.false;
            done();
          }
          initialConfig.interaction = {
            hilight: {
              event: false,
              callback: function (element, d) { throw new Error('shouldn\'t execute'); }
            }
          };
          var map = new Romania(initialConfig);
        });
      });

      describe('Allow an infobox to toggle on hilight/unhilight with data from the target node available in the template', function () {
        it('the default event should not throw errors even if the infobox is not defined', function () {
          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV')
              , bvNode = bv.node();
            // TODO: find a way to catch errors thrown inside of event handlers
            bvNode.dispatchEvent(DEFAULT_HILIGHT_EVENT);          
          };

          var map = new Romania(initialConfig);
        });

        it('should throw errors if the infobox or the template selectors are invalid', function () {
          initialConfig.infobox = { target: '#myInfoBox' };
          // missing template
          (function () {
            var map = new Romania(initialConfig); 
          }).should.throw(Error);

          initialConfig.infobox = { target: '#missingElement', template: '#infoboxTemplate' };
          (function () {
            var map = new Romania(initialConfig); 
          }).should.throw(Error);

          initialConfig.infobox = { target: '#myInfobox', template: '#wrongTemplate' };
          (function () {
            var map = new Romania(initialConfig); 
          }).should.throw(Error);
        });

        it('should show a box with relevant information when hovering over a county and hide it when the cursor leaves it', function (done) {
          initialConfig.infobox = {
            target: '#myInfobox',
            template: '#infoboxTemplate'
          };
          initialConfig.callback = function (map) {
            expect($('#myInfobox').is(':visible'), 'initially hidden').to.be.false;
            var bv = map.getCountyElement('BV');
            bv.node().dispatchEvent(DEFAULT_HILIGHT_EVENT);
            expect($('#myInfobox').is(':visible'), 'does not show on mouseover').to.be.true;
            bv.node().dispatchEvent(DEFAULT_UNHILIGHT_EVENT);
            done();
          }
          var map = new Romania(initialConfig);
        });

        it('should have a template for data that gets rendered using the county\'s data', function (done) {
          initialConfig.infobox = {
            target: '#myInfobox',
            template: '#infoboxTemplate'
          };

          initialConfig.callback = function (map) {
            var bv = map.getCountyElement('BV');
            bv.node().dispatchEvent(DEFAULT_HILIGHT_EVENT);
            
            var $box = $(initialConfig.infobox.target);
            expect($box.find('h2').text()).to.equal('Brașov');
            expect($box.find('p').text()).to.contain('596140');
            expect($box.find('p.formulaResult').text()).to.contain('222199');
            bv.node().dispatchEvent(DEFAULT_UNHILIGHT_EVENT);
            done();
          };
          var map = new Romania(initialConfig);
        });
      })
    });
  };
  if (typeof require === 'function') {
    require(['romania', 'jquery'], function (Romania, $) {
      testSuite(Romania, $);
    });
  } else {
    // if AMD is not available, assume globals
    testSuite(Romania, $);
  }
})();