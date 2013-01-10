require(['romania'], function (Romania) {
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

    describe('Render the map and colorize it', function () {

      it('should read the specified datafile and make the data available by id', function (done) {
        
        validConfig.callback = function (map) {
          var data = map.getData();
          expect(Object.keys(data)).to.have.length(42);
          expect(data['BV'].name).to.equal('Brasov');
          expect(data['B'].name).to.equal('Municipiul Bucuresti');
          done();
        };

        var map = new Romania(validConfig);
      });

      it('should draw the map and render it on the screen', function (done) {
        
        validConfig.callback = function () {
          expect($target.children()).to.have.length(1);
          expect($target.find('path')).to.have.length(42);
          done();
        };
        
        var map = new Romania(validConfig);
      });

      it('should colorize the map according to the data', function (done) {
        validConfig.callback = function (map) {
          var bv = d3.selectAll('path').filter(function (d, i) {
            return d.id == 'BV';
          });
          expect(bv.style('fill')).to.equal('#800080');

          done();
        };
        // setting the exact difference so we can test the upper bound
        validConfig.domain = [-200 * 1000, 222199];
        validConfig.range = ['red', '#800080'];
        validConfig.scale = 'linear';
        var map = new Romania(validConfig);
      });
    });
  });
});