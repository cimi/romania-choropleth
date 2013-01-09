require(['romania'], function (Romania) {
  describe('Choropleth Map Generator For Romania', function() {
    
    var validConfig, $target, map;
    beforeEach(function () {
      validConfig = {
        title: 'test configuration',
        datafile: '/data/romania-counties-population.tsv',
        domain: [100, 1000],
        formula: 'data[0] - data[1]',
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

      it('should keep and return the initial configuration after instantiation', function () {
        expect(map.getConfig()).to.equal(validConfig);
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

      it('should generate a function from the formula', function () {        
        var formulaFunc = map.getConfig().formula;
        expect(formulaFunc).to.be.an.instanceOf(Function);
        expect(formulaFunc([0, 1, 2, 3, 4])).to.equal(-1);
      });

      it('should set the correct scale for the map coloring', function () {
        var config = map.getConfig();
        expect(config.scale, 'the default scale').to.equal(d3.scale.linear);

        validConfig.scale = 'log';
        map = new Romania(validConfig);
        expect(config.scale, 'different scale').to.equal(d3.scale.log);
      });

      it('should have the default color range set to brown - steel blue', function () {
        var config = map.getConfig();
        expect(config.range, 'the default range').to.deep.equal(['brown', 'steelblue']);

        validConfig.range = ['orange', 'purple'];
        map = new Romania(validConfig);
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

          // console.log(map.getConfig().formula);
          // var bv = d3.selectAll('path').filter(function (d, i) {
          //   return d.id == 'Brasov';
          // });
          // console.log(bv.style('fill'));
          done();
        };
        
        var map = new Romania(validConfig);
      });
    });
  });
});