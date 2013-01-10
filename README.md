## Overview

#### See a demo [here](http://improve.ro/sandbox/romania/).

## Creating your map

First, you need to create a configuration object for your map:

````javascript
var config = {
  title: 'Population variation between 1948 and 2004'
  datafile: 'data/romania-counties-population.tsv',
  formula: 'data[0] - data[1]',
  infobox: '#infobox',
  infoboxTemplate: '#infoboxTemplate',
  scale: 'linear',
  projection: 'albers',
  domain: [-200000, 200000],
  defaultFill: 'white',
  range: ['red', 'steelblue']
}
````

The supported properties are:

* __title (mandatory)__ - the title of the map; it will be displayed in the legend. 
* __datafile (mandatory)__ - the data source, it will be loaded asynchronously; the current supported formats are csv and tsv. The format is determined from the file extension.
* __formula (mandatory)__ - which parts of the data are used to compute the fill of the counties. 
* __domain (mandatory)__ - the upper and lower bounds for the color representations on the map, i.e. if the corresponding value for a county is equal to a bound or outside the bounds, it will be colorized with the edge color from the range.
* __target__ - the selector of the element in which the map will be drawn in. If not specified, defaults to `#map`.
* __infobox__ - if specified, on mouseover there will be an infobox displayed with the data for the selected county. You should fill in a selector that identifies the element. If a selector that matches multiple elements is used (e.g. `div`, `.info`), the first match found will be used.
* __infoboxTemplate__ - id of a handlebars template that controls what gets displayed in the infobox.
* __scale__ - the scale for the data representation. Read more in the [d3 documentation](https://github.com/mbostock/d3/wiki/Quantitative-Scales). Currently only linear and logarithmic are supported. If none specified or invalid, defaults to linear.
* __projection__ - which projection to use when drawing the map. To better understand projections read the [d3 documentation](https://github.com/mbostock/d3/wiki/Geo-Projections). The two supported projections are Albers and Mercator. The default and preferred one is Albers, because it is an area preserving projection.
* __range__ - the colors to transition between. Defaults to `['brown', 'steelblue']`.
* __defaultFill__ - the fill color for the counties that do not have data specified in the datafile, in case you do not want to represent data for all of them. If not specified defaults to white.

Once you create your configuration object, rendering a map is as simple as:

````
var map = new Romania(config);
map.render();
````

## API Reference

* __map.getConfig()__ - returns the current configuration of the map.
* __map.getData()__ - returns the dataset associated with the map (what was read from the datafile).