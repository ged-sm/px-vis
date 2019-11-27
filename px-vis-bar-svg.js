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

Unlike most other drawing elements that can use chartData directly, bar requires that data first be passed through d3.stack: https://github.com/d3/d3-shape/blob/master/README.md#stack

### Usage

    <px-vis-svg
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      svg="{{svg}}">
    </px-vis-svg>
    <px-vis-scale
      x-axis-type="scaleBand"
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

    <px-vis-bar-svg
      svg="[[svg]]"
      complete-series-config="[[seriesConfig]]"
      chart-data="[[stackedChartData]]"
      x="[[x]]"
      y="[[y]]"
      domain-changed="[[domainChanged]]">
    </px-vis-bar-svg>

@element px-vis-bar-svg
@blurb Element which draws bar series onto the chart
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

  is: 'px-vis-bar-svg',

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
   * Event fired when an svg bar has finished drawing
   * @event px-vis-bar-svg-rendering-ended
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
    barRects:{
      type:Object
    },
    /**
     * A holder object for the series builder
     *
     * @property linePath
     * @type String
     */
    barBuilder:{
      type:Object
    },
    /**
     * A holder object for the series group
     *
     */
    barGroup:{
      type:Object
    },

    /**
     * Debounce time to use for drawing
     */
    drawDebounceTime: {
      type: Number,
      value: 10
    },

    _iKey: String,

    _keySeriesDict: {
      type: Object,
      computed: '_computekeySeriesDict(completeSeriesConfig.*, _funcsWereSet)'
    },
    _iAxis: String,
    _dAxis: String,
    _funcsWereSet: {
      type: Number,
      value: 0
    },
    type: {
      type: String,
      value: 'column'
    },

    _returnX: {
      type: Function
    },
    _returnY: {
      type: Function
    },
    _returnWidth: {
      type: Function
    },
    _returnHeight: {
      type: Function
    },
    seriesKey: {
      type: String
    },

    highlightBar: {
      type: String,
      value: ''
    },

    barOpacity: {
      type: Number,
      value: 1
    }
  },

  observers: [
    'drawElement(svg, y, domainChanged, chartData.*, completeSeriesConfig.*, _keySeriesDict, preventInitialDrawing, _funcsWereSet)',
    '_addClipPath(clipPath)',
    '_muteBars(highlightBar)',
    '_setFuncs(type)'
  ],

  detached: function() {
    if(this._debouncers.draw) {
      this._debouncers.draw.cancel()
    }

    if(this._doesD3HaveValues(this.barRects)) {
      this.barRects.remove();
    }
    if(this._doesD3HaveValues(this.barGroup)) {
      this.barGroup.remove();
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
          this._drawElementDebounced();
        }.bind(this), this.drawDebounceTime);
      } else {
        this._drawElementDebounced();
      }
    }
  },

  _drawElementDebounced: function() {
    if(!this._funcsWereSet ||
          !this.domainChanged ||
          this._isD3Empty(this.svg) ||
          !this.y ||
          this.chartData.length === 0 ||
          this._isObjEmpty(this.completeSeriesConfig) ||
          !this._keySeriesDict[this.seriesKey]) {
      return;
    }
    // checks to see if the group already exists. If not, create; if so, update
    if(this._isObjEmpty(this.barGroup)) {
      // draw the path
      this.barGroup = this.svg.append('g')
        .attr('series-id', 'bars')
        .attr('class', 'series-bars');
    }

    // set our data
    var barBuilder = this.barGroup.selectAll('rect.series-bar')
      .data(this.chartData);

    // When datapoints disappear from our data, remove them
    barBuilder.exit().remove();

    // When datapoints are added to our data, add stuff
    barBuilder.enter()
      .append('rect')
      .attr('class', 'series-bar')
    // When datapoints are added OR this funtion is run, draw stuff
    .merge(barBuilder)
      .attr('series-id', function(d, i) {
        var series = this._keySeriesDict[this.seriesKey];
        return 'bar_' + series + '_' + i;
      }.bind(this))
      .attr('series-keys', function(d, i) { return this._keySeriesDict[this.seriesKey]; }.bind(this))
      .attr('x', this._returnX.bind(this))
      .attr('y', this._returnY.bind(this))
      .attr('width', this._returnWidth.bind(this))
      .attr('height', this._returnHeight.bind(this))
      .attr('fill', function(d,i) {
        var series = this._keySeriesDict[this.seriesKey],
            colorKey = d[0] < 0 || d[1] < 0 ? 'negativeColor': 'color';

        return this.completeSeriesConfig[series][colorKey] ? this.completeSeriesConfig[series][colorKey] : this.completeSeriesConfig[series]['color'];
      }.bind(this))
      .attr('opacity', this.barOpacity);

    // Make it easy to get our bars again
    this.barRects = this.barGroup.selectAll('rect.series-bar');

    this._addClipPath();

    this.fire('px-vis-bar-svg-rendering-ended');
  },

  _setFuncs: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.type === 'bar') {
      this._returnX = function(d) { return (this.x(d[1]) - this.x(d[0]) < 0) ? this.x(d[1]) : this.x(d[0]); };
      this._returnY = function(d) { return this.y(d.data[this._iKey]); };
      this._returnWidth = function(d) { return Math.abs(this.x(d[1]) - this.x(d[0])); };
      this._returnHeight = function(d) { return this.y.bandwidth(); };
      this._iAxis = 'y';
      this._dAxis = 'x';

    } else {
      this._returnX = function(d) { return this.x(d.data[this._iKey]); };
      this._returnY = function(d) { return (this.y(d[0]) - this.y(d[1]) < 0) ? this.y(d[0]) : this.y(d[1]); };
      this._returnWidth = function(d) { return this.x.bandwidth(); };
      this._returnHeight = function(d) { return Math.abs(this.y(d[0]) - this.y(d[1])); };
      this._iAxis = 'x';
      this._dAxis = 'y';
    }

    this.set('_funcsWereSet', this._funcsWereSet + 1);
  },

  _muteBars: function() {
    if(!this.barRects) {
      return;
    }

    if(this.highlightBar === '') {
      this.barRects.classed('muted', false);
      return;
    }

    var iKey = this._iKey,
        ordVal = this.highlightBar;

    this.barRects.classed('muted', function() {
      return Px.d3.select(this).data()[0].data[iKey] !== ordVal;
    });
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

    this.addClipPath(this.barGroup);
  },

  _computekeySeriesDict: function(completeSeriesConfig) {
    if(this._isObjEmpty(this.completeSeriesConfig) || !this._funcsWereSet) {
      return;
    }

    const dict = {};
    let key;

    Object.entries(this.completeSeriesConfig).forEach(([k,v]) => {
      if(v.type === 'bar') {
        const y = v[this._dAxis];
        dict[y] = k;
        key = k;
      }
    });

    if(key) {
      this._iKey = this.completeSeriesConfig[key][this._iAxis];
      return dict;
    }

    return undefined;
  }
});
