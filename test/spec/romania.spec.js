require(['romania', 'jquery'], function (Romania, $) {
  "use strict";
  describe('Choropleth Map Generator For Romania', function() {
    
    var validConfig, $target, map;
    beforeEach(function () {
      validConfig = {
        title: 'test configuration',
        datafile: '/data/romania-counties-population.tsv',
        domain: [-500000, 500000],
        formula: 'data.pop2004 - data.pop1956',
        target: '#myMap'
      };
      $target = $(validConfig.target);
      $target.hide();
    });

    afterEach(function () {
      validConfig.callback = undefined;
      $target.empty();
    });

    var createEvent = function (eventType) {
      var e = document.createEvent('UIEvents');
      e.initUIEvent(eventType, true, true);
      return e;
    }

    describe('Configure the map', function () {
      beforeEach(function () {
        map = new Romania(validConfig);
      });

      it('should return a fully populated configuration after instantiation without altering the original object', function () {
        var config = map.getConfig();
        expect(config).to.not.equal(validConfig);
        ['title', 'datafile', 'domain'].forEach(function (field) {
          expect(config[field]).to.equal(validConfig[field]);
        });
      });

      it('should enforce mandatory parameters in the configuration', function () {
        var config = {
          title: 'test configuration',
          range: ['white', 'black']
        };
        
        (function () {
          new Romania(config);
        }).should.throw(Error);
      });

      it('should generate a function from the formula', function (done) {
        validConfig.callback = function (map) {        
          var formulaFunc = map.getConfig().formula;
          expect(formulaFunc).to.be.an.instanceOf(Function);
          expect(formulaFunc({id: 'BV', pop2004: '596140', pop1956: '373941'})).to.equal(222199);
          done();
        }
        validConfig.formula = 'data.pop2004 - data.pop1956';
        var map = new Romania(validConfig);
      });

      it('should set the correct scale for the map coloring', function () {
        var config = map.getConfig();
        expect(config.scale, 'the default scale').to.equal(d3.scale.linear);

        validConfig.scale = 'log';
        map = new Romania(validConfig);
        config = map.getConfig();
        expect(config.scale, 'different scale').to.equal(d3.scale.log);
      });

      it('should have the default color range set to brown - steel blue', function () {
        var config = map.getConfig();
        expect(config.range, 'the default range').to.deep.equal(['brown', 'steelblue']);

        validConfig.range = ['orange', 'purple'];
        map = new Romania(validConfig);
        config = map.getConfig();
        expect(config.range, 'custom color range').to.deep.equal(['orange', 'purple']);
      });
    });

    describe('Read the data and make it available', function () {
      var checkData = function (data) {
        expect(data['BV'].name).to.equal('Brasov');
        expect(data['B'].name).to.equal('Municipiul Bucuresti');        
      };

      it('should throw an error if the file extension is not supported', function () {
        validConfig.datafile = 'data/chec.xls';
        (function () {
          new Romania(config);
        }).should.throw(Error);
      })

      it('should support tsv', function (done) {  
        validConfig.callback = function (map) {
          var data = map.getData();
          expect(Object.keys(data)).to.have.length(42);
          checkData(data);
          done();
        };

        var map = new Romania(validConfig);
      });

      it('should support csv and should support datafiles without all counties specified', function (done) {
        validConfig.callback = function (map) {
          var data = map.getData();
          expect(Object.keys(data)).to.have.length(2);
          checkData(data);
          var ct = map.getCountyElement('CT');
          expect(ct.style('fill')).to.equal(validConfig.defaultFill);
          done();
        };
        validConfig.datafile = 'data/fixture.csv';
        validConfig.defaultFill = '#bada55';
        var map = new Romania(validConfig);
      });
    });

    describe('Render the map and color it', function () {
      it('should draw the map and render it on the screen', function (done) {
        validConfig.callback = function () {
          expect($target.children()).to.have.length(1);
          expect($target.find('path')).to.have.length(42);
          done();
        };
        
        var map = new Romania(validConfig);
      });

      it('should allow you to select a county element based on its ID', function (done) {
        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV');
          expect(bv).to.exist;
          expect(bv.datum().properties.name).to.equal('Brașov');
          done();
        }
        var map = new Romania(validConfig);
      });

      it('should attach the county ID as a class name to the corresponding path element', function (done) {
        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV');
          expect(bv.classed('BV')).to.be.true;
          expect(bv.classed('CT')).to.be.false;
          done();
        }
        var map = new Romania(validConfig);
      });

      it('should add the "hilight" css class to a path element that is hilighted (API or mouseover)', function (done) {
        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV')
            , bvNode = bv.node();
          bvNode.dispatchEvent(createEvent('mouseover'));
          expect(bv.classed('hilight')).to.be.true;
          bvNode.dispatchEvent(createEvent('mouseout'));
          expect(bv.classed('hilight')).to.be.false;
          map.hilight(bvNode);
          expect(bv.classed('hilight')).to.be.true;
          map.unhilight(bvNode);
          expect(bv.classed('hilight')).to.be.false;
          done();
        };
        var map = new Romania(validConfig);
      });

      it('should color the map according to the data', function (done) {
        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV');
          expect(bv.style('fill')).to.equal(validConfig.range[1]);
          done();
        };
        // setting the exact difference so we can test the upper bound
        validConfig.domain = [-200 * 1000, 222199];
        validConfig.range = ['red', '#800080'];
        validConfig.scale = 'linear';
        var map = new Romania(validConfig);
      });

      it('should redraw the map when the configuration is changed without reloading the data');
    });


    describe('Create an infobox displaying requested data on mouseover', function () {
      it('mouseover should work even if the infobox is not defined', function () {
        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV')
            , bvNode = bv.node();
          // TODO: find a way to catch errors thrown inside of event handlers
          bvNode.dispatchEvent(createEvent('mouseover'));          
        };

        var map = new Romania(validConfig);
      });

      it('should throw errors if the infobox or the template selectors are invalid', function () {
        validConfig.infoBox = '#myInfoBox';
        // missing template
        (function () {
          var map = new Romania(validConfig); 
        }).should.throw(Error);

        validConfig.infoBox = '#missingElement';
        (function () {
          var map = new Romania(validConfig); 
        }).should.throw(Error);

        validConfig.infoBox = '#myInfobox';
        validConfig.infoBoxTemplate = '#wrongTemplate';
        (function () {
          var map = new Romania(validConfig); 
        }).should.throw(Error);
      });

      it('should show a box with relevant information when hovering over a county and hide it when the cursor leaves it', function (done) {
        validConfig.infoBox = '#myInfobox';
        validConfig.infoBoxTemplate = '#infoboxTemplate';
        validConfig.callback = function (map) {
          expect($('#myInfobox').is(':visible'), 'initially hidden').to.be.false;
          var bv = map.getCountyElement('BV');
          bv.node().dispatchEvent(createEvent('mouseover'));
          expect($('#myInfobox').is(':visible'), 'shown on mouseover').to.be.true;
          bv.node().dispatchEvent(createEvent('mouseout'));
          expect($('#myInfobox').is(':visible'), 'hidden on mouseout').to.be.false;
          done();
        }
        var map = new Romania(validConfig);
      });

      it('should have a template for data that gets rendered using the county\'s data', function (done) {
        validConfig.infoBox = '#myInfobox';
        validConfig.infoBoxTemplate = '#infoboxTemplate';

        validConfig.callback = function (map) {
          var bv = map.getCountyElement('BV');
          bv.node().dispatchEvent(createEvent('mouseover'));
          
          var $box = $(validConfig.infoBox);
          expect($box.find('h2').text()).to.equal('Brașov');
          expect($box.find('p').text()).to.contain('596140');
          bv.node().dispatchEvent(createEvent('mouseout'));

          done();
        };
        var map = new Romania(validConfig);
      });
    })
  });
});