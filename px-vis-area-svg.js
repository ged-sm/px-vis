/*
Copyright (c) 2018, General Electric

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
Unlike most other drawing elements that can use chartData directly, area requires that data first be passed through d3.stack: https://github.com/d3/d3-shape/blob/master/README.md#stack

### Usage

    <px-vis-svg
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      svg="{{svg}}">
    </px-vis-svg>
    <px-vis-scale
      x-axis-type="time"
      y-axis-type="linear"
      complete-series-config="[[seriesConfig]]"
      data-extents="[[dataExtents]]"
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      chart-data={{chartData}}
      x="{{x}}"
      y="{{y}}"
      selected-domain="[[selectedDomain]]">
    </px-vis-scale>

    <px-vis-area-svg
      svg="[[svg]]"
      complete-series-config="[[seriesConfig]]"
      chart-data="[[stackedChartData]]"
      x="[[x]]"
      y="[[y]]"
      domain-changed="[[domainChanged]]">
    </px-vis-area-svg>

@element px-vis-area-svg
@blurb Element which draws area series onto the chart
@homepage index.html
@demo demo.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './px-vis-behavior-d3.js';
import './px-vis-behavior-common.js';
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <style include="px-vis-styles"></style>
`,

  is: 'px-vis-area-svg',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehaviorD3.svg,
    PxVisBehaviorD3.axes,
    PxVisBehavior.dataset,
    PxVisBehavior.commonMethods,
    PxVisBehaviorD3.clipPath,
    PxVisBehavior.completeSeriesConfig,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehaviorD3.domainUpdate,
    PxVisBehavior.preventInitialDrawing
  ],

  /**
   * Event fired when an svg area has finished drawing
   * @event px-vis-area-svg-rendering-ended
   */

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
    /**
     * A holder object for the series object
     *
     */
    areaPath:{
      type:Object
    },
    /**
     * A holder object for the series builder
     *
     * @property linePath
     * @type String
     */
    areaBuilder:{
      type:Object
    },
    /**
     * A holder object for the series group
     *
     */
    areaGroup:{
      type:Object
    },

    /**
     * Debounce time to use for drawing
     */
    drawDebounceTime: {
      type: Number,
      value: 10
    },

    _xKey: {
      type: String
    },

    _keySeriesDict: {
      type: Object,
      computed: '_computekeySeriesDict(completeSeriesConfig.*)'
    }
  },

  observers: [
    'drawElement(svg, y, domainChanged, chartData.*, completeSeriesConfig.*, _keySeriesDict,  preventInitialDrawing)',
    '_addClipPath(clipPath)'
  ],

  detached: function() {
    if(this._doesD3HaveValues(this.areaPath)) {
      this.areaPath.remove();
    }
    if(this._doesD3HaveValues(this.areaGroup)) {
      this.areaGroup.remove();
    }
  },

  /**
   * Draws or updates the line element.
   * Called from an observer watching for data and the necessary d3 objects
   *
   * @method drawElement
   */
  drawElement: function() {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }


    if(!this.preventInitialDrawing) {
      //if 0 don't debounce at all
      if(this.drawDebounceTime > 0) {
        this.debounce('draw',function() {
          if(this.domainChanged &&
              this._doesD3HaveValues(this.svg) &&
              this.y &&
              this.chartData.length > 0 &&
              this._doesObjHaveValues(this.completeSeriesConfig)) {

            this._drawElementDebounced();
          }
        }.bind(this), this.drawDebounceTime);
      } else {
        this._drawElementDebounced();
      }
    }
  },

  _drawElementDebounced: function() {
    this._defineArea();

    // checks to see if the group already exists. If not, create; if so, update
    if(this._isObjEmpty(this.areaGroup)) {
      // draw the path
      this.areaGroup = this.svg.append('g')
        .attr('series-id', 'areas')
        .attr('class', 'series-area');
    }

    // set our data
    var areaBuilder = this.areaGroup.selectAll('path.series-area')
      .data(this.chartData);

    // When datapoints disappear from our data, remove them
    areaBuilder.exit().remove();

    // When datapoints are added to our data, add stuff
    areaBuilder.enter()
      .append('path')
      .attr('class', 'series-area')
    // When datapoints are added OR this funtion is run, draw stuff
    .merge(areaBuilder)
      .attr('series-id', function(d, i) {
        var series = this._keySeriesDict[d.key];
        return 'area_' + series;
      }.bind(this))
      .attr('series-keys', function(d, i) {
        return this._keySeriesDict[d.key];
      }.bind(this))
      .attr('d', function(d) {
        return this.area(d);
      }.bind(this))
      .attr('fill', function(d,i) {
        var series = this._keySeriesDict[d.key];
        return this.completeSeriesConfig[series]['color'];
      }.bind(this))
    // Make it easy to get our areas again
    this.areaPath = this.areaGroup.selectAll('path.series-area');

    this._addClipPath();

    this.fire('px-vis-area-svg-rendering-ended');
  },

  _defineArea: function() {
    this.area = Px.d3.area()
      .x(function(d, i) {
        return this.x(d.data[this._xKey]);
      }.bind(this))
      .y0(function(d) { return Math.floor(this.y(d[0])); }.bind(this))
      .y1(function(d) { return Math.floor(this.y(d[1])); }.bind(this));
  },

  /**
   * Helper to call addClipPath with the element
   *
   * @method _addClipPath
   */
  _addClipPath: function() {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    this.addClipPath(this.areaGroup);
  },

  _computekeySeriesDict: function(completeSeriesConfig) {
    if(this.hasUndefinedArguments(arguments) || this._isObjEmpty(this.completeSeriesConfig)) {
      return;
    }

    var keys = Object.keys(this.completeSeriesConfig),
        dict = {};

    for(var i = 0; i < keys.length; i++) {
      var k = keys[i],
          y = this.completeSeriesConfig[k]['y'];
      dict[y] = k;
    }

    this._xKey = this.completeSeriesConfig[keys[0]]['x'];

    return dict;
  }
});
