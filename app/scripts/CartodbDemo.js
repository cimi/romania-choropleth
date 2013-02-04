(function (exports) {
  $(document).ready(function () {
    $('#map').height('500px').width('500px');
      var vis = cartodb.createVis('map', 'http://cimi.cartodb.com/api/v1/viz/18713/viz.json')
          .done(function (vis, layers) {
            var sql = new cartodb.SQL({ user: 'cimi' });
            sql.getBounds('select * from senat_2008_2012 where cartodb_id = 27')
                .done(function(bounds) {
                  var bounds = new google.maps.LatLngBounds(
                      new google.maps.LatLng(bounds[1][0], bounds[1][1]),
                      new google.maps.LatLng(bounds[0][0], bounds[0][1]));
                  var gmap = vis.getNativeMap();
                  // console.log(bounds.getCenter());
                  gmap.fitBounds(bounds);
            });
      });
    });
})(this);