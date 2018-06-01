# This project is unmaintained and uses outdated technology.

## Overview

This project aims to provide an easy way to render a map of Romania and colorize it by county according to data. You can create a [choropleth map](http://en.wikipedia.org/wiki/Choropleth_map) of Romania just by referencing a csv or tsv data file and declaring a configuration object. Each county has its own element in the DOM and can be manipulated and styled via plain CSS and JavaScript.

#### See a live demo [here](https://cimi.io/romania-choropleth/) - population difference across counties.

You are not forced to have a dataset to build a map. Each county has a css class with its abbreviation ('B' for Bucharest, 'BV' for Brașov etc.). You can colorize the map and add any type of events to the counties without having a dataset available. See [this simple example](http://improve.ro/sandbox/romania/simple.html) that shows the Romanian provinces colored only through CSS. The unminified code for both demos is present in this repository.

The project is based on [D3.js](http://d3js.org/) and [TopoJSON](https://github.com/mbostock/topojson/). It also uses jQuery and Handlebars. Structurally, is built around [Yeoman](http://yeoman.io) and [RequireJS](http://requirejs.org).

## How to use it

You can download the library and all its dependencies via bower:

````
bower install romania-choropleth
````

The module offers conditional AMD support (RequireJS), which means you can use it with or without an AMD loader. I've only tested it with require.js, but other loaders should work as well.

[This example](http://bl.ocks.org/d/4486121/) shows how you can use it without AMD. An example of use with AMD is in [the demo](https://github.com/cimi/romania-choropleth/blob/master/app/scripts/demo.js) included in this repository.

## Creating a map

First, you need to create a configuration object for your map:

````javascript
var config = {
  title: 'Population variation between 1948 and 2004'
  data: {
    datafile: 'data/romania-counties-population.tsv',
    domain: [-200000, 200000],
    formula: 'data.pop2004 - data.pop1956',
    range: ['red', 'steelblue'],
    scale: 'linear'
  },
  projection: 'albers',
  defaultFill: 'white',
  infobox: {
    target: '#infobox',
    template: '#infoboxTemplate'
  }  
}
````

Once you create your configuration object, rendering a map is as simple as:

````javascript
var map = new Romania(config);
````

Currently, the map's dimensions are fixed (960x600 px), but I plan to add support for variable dimensions in the future.

## The Configuration Object

* __title__ - the title of the map; it will be displayed in the legend.

* __target__ - the selector of the element in which the map will be drawn in. If not specified, defaults to `#map`.

* __projection__ - which projection to use when drawing the map. To better understand projections read the [d3 documentation](https://github.com/mbostock/d3/wiki/Geo-Projections). The two supported projections are Albers and Mercator. The default and preferred one is Albers, because it is an area preserving projection.

* __defaultFill__ - the fill color for the counties that do not have data specified in the datafile, in case you do not want to represent data for all of them. If not specified defaults to white.

* __data__ - if associated data is present, this defines how to load and interpret it.
    * __datafile (mandatory)__ - the data source, it will be loaded asynchronously; the current supported formats are csv and tsv. The format is determined from the file extension.
    
    * __formula (mandatory)__ - which parts of the data are used to compute the fill of the counties. The data is made available in the formula through the `data` object. The property names are read from the datafile and are the same as those in the objects returned from `map.getData()`. You can use any type of mathematical operator in the formula or any native JavaScript functions.

    Examples:
    ````javascript
    // using a function from the math library
    config.formula = 'Math.sqrt(data.area)';
    // using a more complicated mathematical formula
    config.formula = '(data.gdp / data.population) + (data.gdb / data.area)';
    ````
    
    * __domain (mandatory)__ - the upper and lower bounds for the color representations on the map, i.e. if the corresponding value for a county is equal to a bound or outside the bounds, it will be colorized with the edge color from the range.

    * __scale__ - the scale for the data representation. Read more in the [d3 documentation](https://github.com/mbostock/d3/wiki/Quantitative-Scales). Currently only linear and logarithmic are supported. If none specified or invalid, defaults to linear.
    
    * __range__ - the colors to transition between. Defaults to `['brown', 'steelblue']`.

* __callback__ - a function that gets executed when all the data is loaded. It receives one argument, the Romania object created.

    Example:
    ````javascript
    config.callback = function (map) {
      // do stuff with map, the data is loaded and the map is drawn
    }
    ````
    
* __interaction__ - provides a way to configure the way in which the user interacts with the map. There are two operations currently supported, `hilight` and `unhilight`. Implicitly, these operations are enabled, if you want to turn them off, you need to set their corresponding `event` property to `false`.
    - __hilight__ - adds a `.hilight` CSS class to the event on the map that the user is currently interacting with.
        + __event__ - the event that triggers a hilight behavior. Defaults to `mouseover`. If set to `false`, no event will trigger the hilight.
        + __callback__ - a function that will execute when the hilight event is triggered, via API or UI event.
    - __unhilight__ - removes the `.hilight` CSS class from the event.
        + __event__ - same as for `hilight`
        + __callback__ - same as for `hilight`

    Example:

    ````javascript
    config.interaction = {
      hilight: {
        event: 'mousedown',
        callback: function (element, d) {
          console.log(element + ' was clicked, it had data ' + d);
        }
      }, unhilight: {
        event: 'mouseup'
      }
    };
    ````

* __infobox__ - if specified, on hilight there will be an infobox displayed with the data for the hilighted county.
    + __target__ - selector that identifies the element inside which the information will be displayed. If a selector that matches multiple elements is used (e.g. `div`, `.info`), the first match found will be used.
    + __template__ - selector for an element containing a handlebars template that controls what gets displayed in the infobox.

    Example:
    ````javascript
    config.infobox = {
      target: '#myInfobox',
      template: '.infoboxTemplate'
    };
    ````

## API Reference

* __map.getData()__ - returns the dataset associated with the map (what was read from the datafile). It is mapped by county ID to the data read from the file.
    
    Example:

    ````javascript
    var map = new Romania(config),
      , data = map.getData();

    console.log(data['B']); // { a: 1000, b:2000, c:3000 }
    ````
    
    The datafile would look like:
    ````
    id,a,b,c
    B,1000,2000,3000
    BV,1001,2001,3001,
    [...]
    ```
* __map.getCountyElement(id)__ - returns a d3 wrapped object of the SVG `path` representing the desired county.
* __map.hilight(id)__ - hilights the desired county.
* __map.unhilight(id)__ - unhilights the desired county.

## Browser support

The project was built and tested in Chrome. Internet Explorer is not supported and most likely doesn't work.

## Where the data comes from

The TopoJSON file used to draw the map in D3 comes was converted by me from a shapefile downloaded from [this site hosted on the domain of the University of Bucharest](http://earth.unibuc.ro/download/romania-seturi-vectoriale). The author of the shapefile is Vasile Crăciunescu.

I converted the shapefile with GDAL (`ogr2ogr`) into GeoJSON. I cleaned up the data (incorrectly encoded Romanian characters for the county names), added to each county an ID - I used the two letter abbreviation used in our vehicle system - and separated the population information in an external datafile.

I used [TopoJSON](https://github.com/mbostock/topojson/) to further compress the GeoJSON obtained in the previous step. This brought it down from 14 MB to **68 KB**! However, it's worth mentioning that I didn't look into GDAL to see how the conversion to GeoJSON could be optimized, since I was targeting TopoJSON from the start.

<div style="text-align:center">
<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported License</a></div>
