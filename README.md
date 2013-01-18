## Overview

#### See a demo [here](http://improve.ro/sandbox/romania/).

## Creating your map

First, you need to create a configuration object for your map:

````javascript
var config = {
  title: 'Population variation between 1948 and 2004'
  datafile: 'data/romania-counties-population.tsv',
  formula: 'data.pop2004 - data.pop1956',
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
* __formula (mandatory)__ - which parts of the data are used to compute the fill of the counties. The data is made available in the formula through the `data` object. The property names are read from the datafile and are the same as those in the objects returned from `map.getData()`. You can use any type of mathematical operator in the formula or any native JavaScript functions.

    Examples:
    ````javascript
    // using a function from the math library
    config.formula = 'Math.sqrt(data.area)';
    // using a more complicated mathematical formula
    config.formula = '(data.gdp / data.population) + (data.gdb / data.area)';
    ````

* __domain (mandatory)__ - the upper and lower bounds for the color representations on the map, i.e. if the corresponding value for a county is equal to a bound or outside the bounds, it will be colorized with the edge color from the range.
* __target__ - the selector of the element in which the map will be drawn in. If not specified, defaults to `#map`.
* __scale__ - the scale for the data representation. Read more in the [d3 documentation](https://github.com/mbostock/d3/wiki/Quantitative-Scales). Currently only linear and logarithmic are supported. If none specified or invalid, defaults to linear.
* __projection__ - which projection to use when drawing the map. To better understand projections read the [d3 documentation](https://github.com/mbostock/d3/wiki/Geo-Projections). The two supported projections are Albers and Mercator. The default and preferred one is Albers, because it is an area preserving projection.
* __range__ - the colors to transition between. Defaults to `['brown', 'steelblue']`.
* __defaultFill__ - the fill color for the counties that do not have data specified in the datafile, in case you do not want to represent data for all of them. If not specified defaults to white.
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

Once you create your configuration object, rendering a map is as simple as:

````
var map = new Romania(config);
map.render();
````

## API Reference

* __map.getConfig()__ - returns the current configuration of the map.
* __map.getData()__ - returns the dataset associated with the map (what was read from the datafile).
* __map.getCountyElement(id)__ - returns a d3 wrapped object of the specified county
* __map.hilight(id)__ - highlights the country with `id`.
* __map.unhilight(id)__ - unhighlights the country with `id`.
