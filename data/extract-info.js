var data = require('../app/data/romania-counties-geojson.json')
  , fs = require('fs');


var years = [1948, 1956, 1966, 1977, 1992, 2002, 2004];
var heading = "ID\tNAME";
years.forEach(function (val) {
  heading += "\tPOP " + val;
});

var ws = fs.createWriteStream('romania-counties-population.tsv');
data.features.forEach(function (val, idx) {
  var properties = val.properties
    , county = idx + "\t" + properties.NAME;
  years.forEach(function (val) { county += "\t" + properties["POP" + val]});
  ws.write(county + "\n");
});
