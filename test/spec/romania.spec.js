require(['romania'], function (Romania) {
  describe('Choropleth Map Generator For Romania', function() {

    var validConfig = {
      title: 'test configuration',
      datafile: '/data/romania-counties-population.tsv',
      domain: [100, 1000],
      formula: 'data[0] - data[1]'
    };

    describe('Configure the map', function () {

      it('should keep and return the initial configuration after instantiation', function () {
        var map = new Romania(validConfig);
        expect(map.getConfig()).to.equal(validConfig);
      });

      it('should enforce mandatory parameters in the configuration', function () {
        var config = {
          title: 'test configuration',
          range: ['white', 'black']
        };
        
        (function () {
          var map = new Romania(config);
        }).should.throw(Error);
      });

    });

    describe('Render the map and colorize it', function () {
      beforeEach(function () {
        $('#map').empty();
      });

      afterEach(function () {
        validConfig.callback = undefined;
      });

      it('should read the specified datafile and make the data available', function () {
        
        validConfig.callback = function (map) {
          var data = map.getData();
          expect(data).to.have.length(41);
        };

        var map = new Romania(validConfig);
      });

      it('should draw the map and render it on the screen', function () {

        validConfig.callback = function () {
          expect($('#map').children()).to.have.length(1);
        };
        var map = new Romania(validConfig);
      });

    });


  });
});