## Overview

#### See a demo [here](http://improve.ro/sandbox/romania/).

## Creating your map

First, you need to create a configuration object for your map:

````
var config = {
	title: 'Population variation between 1948 and 2004'
  datafile: 'data/romania-counties-population.tsv',
  formula: 'data[0] - data[1]',
  infobox: true,
  scale: 'linear',
  projection: 'albers',
  domain: [-200000, 200000],
  range: ['red', 'steelblue']
}
````

The supported properties are:

* __title__ - the title of the map; it will be displayed in the legend
* __datafile__ - the data source, it will be loaded asynchronously; the current supported formats are csv, tsv and json. The format is determined from the file extension. 
* __formula__ - which parts of the data are used to compute the fill of the counties.
* __infobox__ - if specified, on mouseover there will be an infobox displayed with all the data for the selected county. You should fill in the ID of the element.
* __scale__ - the scale for the data representation. Read more in the [d3 documentation](https://github.com/mbostock/d3/wiki/Quantitative-Scales). Currently only linear and logarithmic are supported. If none specified or invalid, defaults to linear.
* __projection__ - which projection to use when drawing the map. To better understand projections read the [d3 documentation](https://github.com/mbostock/d3/wiki/Geo-Projections). The two supported projections are Albers and Mercator. The default and preferred one is Albers, because it is an area preserving projection.
* __domain__ - the upper and lower bounds for the color representations on the map, i.e. if the corresponding value for a county is equal to a bound or outside the bounds, it will be colorized with the edge color from the range.
* __range__ - the colors to transition between.

Once you create your configuration object, rendering a map is as simple as:

````
var map = new Romania(config);
map.render();
````
