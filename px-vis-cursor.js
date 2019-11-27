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
    domain-changed="{{domainChanged}}"
    selected-domain="[[selectedDomain]]">
  </px-vis-scale>
  <px-vis-interaction-space
    x-axis-type="time"
    svg="[[svg]]"
    width="[[width]]"
    height="[[height]]"
    margin="[[margin]]"
    complete-series-config="[[seriesConfig]]"
    chart-data="[[chartData]]"
    tooltip-data={{tooltipData}}
    series-keys="[[seriesKeys]]"
    extents-data={{extentsData}}
    x="[[x]]"
    y="[[y]]"
    domain-changed="[[domainChanged]]">
  </px-vis-interaction-space>
  <px-vis-cursor
    svg="[[svg]]"
    width="[[width]]"
    height="[[height]]"
    margin="[[margin]]"
    complete-series-config="[[seriesConfig]]"
    chart-data="[[chartData]]"
    tooltip-data="[[tooltipData]]"
    selection-type=[[selectionType]]>
  </px-vis-cursor>

### Styling
The following custom properties are available for styling:

Custom property | Description
:----------------|:-------------
  `--px-vis-cursor-line-color` | The color for the lines which track the cursor/data


@element px-vis-cursor
@blurb Element which draws crosshairs around mouse pointer / data points and highlight adjacent datapoints.
@homepage index.html
@demo demo/index.html

//TODO implement a dev setting to choose between only showing data at that x, snapping to nearest data, or interpolating value at x

*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './px-vis-behavior-common.js';
import './px-vis-behavior-d3.js';
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <style include="px-vis-styles"></style>
`,

  is: 'px-vis-cursor',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehavior.sizing,
    PxVisBehaviorD3.svg,
    PxVisBehaviorD3.axes,
    PxVisBehavior.dataset,
    PxVisBehavior.commonMethods,
    PxVisBehavior.tooltipData,
    PxVisBehaviorD3.clipPath,
    PxVisBehavior.mutedCompleteSeriesConfig,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehavior.polarData,
    PxVisBehavior.updateStylesOverride
  ],

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  //properties
  properties: {
    /**
     * Holder for the cursor drawing objects
     *
     * @property _cursor
     * @type Object
     */
    _cursor:{
      type:Object
    },
    /**
     * Holder for the vertical line drawing object
     *
     */
    _vLines:{
      type:Object
    },
    /**
     * Holder for the horizontal line drawing objects
     *
     * @property _hLines
     * @type Object
     */
    _hLines:{
      type:Object
    },
    /**
     * Holder for the tooltip circle drawing objects
     *
     * @property _circles
     * @type Object
     */
    _circles:{
      type:Object
    },
    /**
     * Object used to build the horizontal lines
     */
    _hLinesBuilder: {
      type: Object
    },
    /**
     * Object used to build the vertical lines
     */
    _vLinesBuilder: {
      type: Object
    },
    /**
     * Draws a horizontal line through the point. Valid values:
     * - full
     * - none
     * - left
     * - right
     *
     * @property horizontalLine
     * @type String
     * @default full
     */
    horizontalLine:{
      type:String,
      value:'full'
    },
    /**
     * Draws a vertical line through the point. Valid values:
     * - full
     * - none
     * - bottom
     * - top
     *
     * @property verticalLine
     * @type String
     * @default bottom
     */
    verticalLine:{
      type:String,
      value:'full'
    },
    /**
     * Draws a circle at the point. Valid values:
     * - yes
     * - no
     *
     * @property circlePoint
     * @type String
     * @default yes
     */
    circlePoint:{
      type:String,
      value:'yes'
    },
    /**
     * The opacity value of the fill to be used when muting a series (stroke is not drawn on mute).
     * This property will be read from the completeSeriesConfig.
     */
    mutedOpacity: {
      type: Number
    },
    /**
     * Whether the scatter plot is using radial coordinates (x=phase, y=amplitude).
     */
    radial: {
      type: Boolean,
      value: false
    },

    _radiusCursor: {
      type: Object
    },

    radialAreaCursor: {
      type: Boolean,
      value: false
    },
  },

  observers: [
    'drawElement(svg,chartData.*,_mutedCompleteSeriesConfig, width, height)',
    '_cursorChange(tooltipData.*, _cursor)',
    '_addClipPath(clipPath)',
    '_processOpacity(mutedSeries.*, completeSeriesConfig)',
    '_updateColors(_stylesUpdated)'
  ],

  ready: function() {
    this._watchConfigProperty('mutedOpacity', 0.3);
  },

  /**
   * Draws the tooltip elements and sets up listeners and callbacks on chart hover.
   * Sets the tooltipData property, which gets passed to the register.
   *
   * @method drawElement
   */
  //drawElement
  drawElement: function() {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    // add circle to the line and hide it
    if(!this._cursor) {
      this._cursor = this.svg.append('g')
          .attr('display', 'none');
    }

    if(this.horizontalLine !== 'none') {
      this._drawHorizontalLines();
    }

    if(this.verticalLine !== 'none') {
      this._drawVerticalLines();
    }
    // FIXME: WTF is this?
    if(this.radialAreaCursor) {
      this._drawRadiusCursor();
    }

    if(this.circlePoint === 'yes') {
      this._drawPointCircles();
    }

    this._addClipPath();
    this._processOpacity();

  },

  _drawHorizontalLines: function() {
    // append the x line
    this._hLinesBuilder = this._cursor.selectAll('.xline')
      .data(Object.keys(this._mutedCompleteSeriesConfig));

    this._hLinesBuilder.exit().remove();

    if(!this.radial) {
      this._hLines = this._hLinesBuilder
        .enter()
          .append('line')
          .attr('class', 'xline')
          .attr('stroke', this._checkThemeVariable("--px-vis-cursor-line-color", 'rgb(0,0,0)'))
          .attr('opacity', 1)
          .attr('x1', 0)
        .merge(this._hLinesBuilder)
          .attr('x2', this.width);
    } else {
      this._hLines = this._hLinesBuilder
        .enter()
          .append('circle')
          .attr('class', 'xline')
          .attr('stroke', this._checkThemeVariable("--px-vis-cursor-line-color", 'rgb(0,0,0)'))
          .attr('fill', 'none')
          .attr('opacity', 1)
          .attr('cx', 0)
          .attr('cy', 0)
        .merge(this._hLinesBuilder)
          .attr('r', 0);
    }
  },

  _drawVerticalLines: function() {

    // append the y line
    this._vLinesBuilder = this._cursor.selectAll('line.yline')
      .data(Object.keys(this._mutedCompleteSeriesConfig));

    this._vLinesBuilder.exit().remove();

    this._vLines = this._vLinesBuilder
      .enter()
        .append('line')
        .attr('class', 'yline')
        .attr('stroke', this._checkThemeVariable("--px-vis-cursor-line-color", 'rgb(0,0,0)'))
        .attr('opacity', 1)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
      .merge(this._vLinesBuilder)
        .attr('y2', this.radial ? this.height + 20 : this.height);

  },

  _drawPointCircles: function() {
    // append the circle
    this._circles = this._cursor.selectAll('circle.tooltipPoint')
      .data(Object.keys(this._mutedCompleteSeriesConfig));

    this._circles.exit().remove();

    this._circles
      .enter()
        .append('circle')
        .attr('class', 'tooltipPoint')
        .attr('r', 3)
        .attr('stroke-width', 12)
        .attr('stroke-opacity', 0.3)
      .merge(this._circles)
        .attr('fill', (function(d) {
          return this._mutedCompleteSeriesConfig[d]['color']
        }).bind(this))
        .attr('stroke', (function(d) {
          return this._mutedCompleteSeriesConfig[d]['color']
        }).bind(this));

    this._circles = this._cursor.selectAll('circle.tooltipPoint');
  },

  /**
   * Function called by observer.
   * Determines if the cursor should be shown or hidden.
   *
   * @method _cursorChange
   */
  _cursorChange: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(!this._isD3Empty(this._cursor)) {
      if(this.tooltipData.mouse === null || this.tooltipData.series.length === 0) {
        this._hideCursor();

      } else {
        //update number of circles if needed
        if(this._circles && this._nonMutedSeriesKeys.length !== this._circles.nodes().length) {
          this.drawElement();
        }

        this._showCursor();
        this._moveCursor();
      }
    }
  },

  /**
   * Helper function called on mouseover,
   * shows the cursor elements.
   *
   * @method _showCursor
   */
  _showCursor:function() {
    this._cursor.attr('display', null);
  },

  /**
   * Helper function called on mouseout,
   * hides the cursor elements.
   *
   * @method _hideCursor
   */
  _hideCursor: function() {
    this._cursor.attr('display', 'none');
  },

  /**
   * Helper function called on mousemove,
   * moves the cursor elements to their proper location.
   *
   * @method _moveCursor
   */
  //mousemove
  _moveCursor:function() {

    this._moveCircles();

    // move the horizontal lines into position
    this._moveHorizontalLines();

    this._moveVerticalLines();
  },

  _setVisibility: function(d, i) {
    if(this.tooltipData.seriesObj[d] &&
        this.tooltipData.seriesObj[d]['coord'] &&
        this._isValidData(this.tooltipData.seriesObj[d]['coord'][0]) &&
        this._isValidData(this.tooltipData.seriesObj[d]['coord'][1])) {
      return 'visible';
    }

    return 'hidden';
  },

  _setXCoord: function(d, i) {
    if(this.tooltipData.seriesObj[d] &&
        this.tooltipData.seriesObj[d]['coord'] &&
        this._isValidData(this.tooltipData.seriesObj[d]['coord'][0])) {
      return this.tooltipData.seriesObj[d]['coord'][0];
    }

    return null;
  },

  _setYCoord: function(d, i) {
    if(this._hasYCoord(d)) {
      return this.tooltipData.seriesObj[d]['coord'][1];
    }

    return null;
  },

  _setDisplayYCoord: function(d, i) {
    return this._hasYCoord(d) ? null : 'none';
  },

  _hasYCoord: function(d) {
    if(this.tooltipData.seriesObj[d] &&
        this.tooltipData.seriesObj[d]['coord'] &&
        this._isValidData(this.tooltipData.seriesObj[d]['coord'][1])) {
      return true;
    }

    return false;
  },

  _moveCircles: function() {
     // move the circles into position
    if(this.circlePoint === 'yes' && this._circles) {
      this._circles
        .style("visibility", this._setVisibility.bind(this))
        .attr('cx', this._setXCoord.bind(this))
        .attr('cy', this._setYCoord.bind(this));
    }
  },

  _moveHorizontalLines: function() {
    if(this.radial) {
      this._moveHorizontalLinesRadial();
    } else {
      this._moveHorizontalLinesCartesian();
    }
  },

  _moveHorizontalLinesRadial: function() {
    if(this.horizontalLine !== 'none' && this._hLines) {
      this._hLines
        .style("visibility", this._setVisibility.bind(this))
        .attr('r', function(d,i) {
          if(this.tooltipData.seriesObj[d] && this.tooltipData.seriesObj[d]['coord']) {
            var x = this.tooltipData.seriesObj[d]['coord'][0],
                y = this.tooltipData.seriesObj[d]['coord'][1];
            if(this._isValidData(x) && this._isValidData(y)) {
              //thank you pythagore
              return Math.sqrt(x*x + y*y);
            }
          }
          return null;
        }.bind(this))
    }
  },

  _moveHorizontalLinesCartesian: function() {
    if(!this._hLines) {
      return;
    }

    if(this.horizontalLine !== 'none') {
      this._hLines
        .attr('y1', this._setYCoord.bind(this))
        .attr('y2', this._setYCoord.bind(this))
        .attr('display', this._setDisplayYCoord.bind(this));
    }

    if(this.horizontalLine === 'left') {
      this._hLines
        .attr('x2', this._setXCoord.bind(this))

    } else if(this.horizontalLine === 'right') {
      this._hLines
        .attr('x1', this._setXCoord.bind(this));

    }
  },

  _moveVerticalLines: function() {
    if(this.radial) {
      this._moveVerticalLinesRadial();
    } else {
      this._moveVerticalLinesCartesian();
    }
  },

  _moveVerticalLinesRadial: function() {
    if(this.verticalLine !== 'none' && this._vLines) {
      this._vLines
       .style("visibility", this._setVisibility.bind(this))
      .attr('transform', function(d, i) {

        if(this.tooltipData.seriesObj[d] && this.tooltipData.seriesObj[d]['value']) {
          var xKey = this._mutedCompleteSeriesConfig[d]['x'],
              yKey = this._mutedCompleteSeriesConfig[d]['y'],
              angle = this.tooltipData.seriesObj[d]['value'][xKey];

          if(this._isValidData(angle)) {
            if(this.tooltipData.seriesObj[d]['value'][yKey] < 0 && !this.allowNegativeValues) {
              angle = this.useDegrees ? angle - 180 : angle - Math.PI;
            }

            angle = this._adjustAngleForPolarChart(angle, this.useDegrees);

          } else {
            angle = 0;
          }

          return 'rotate(' + angle + ')';
        } else {
          return null;
        }
      }.bind(this));
    }
  },

  _moveVerticalLinesCartesian: function() {
    /*
      Move the vertical line into position;
      If bottom, just take the lowest datapoint
      If top, take the highest
    */
    if(!this._vLines) {
      return;
    }

    if(this.verticalLine !== 'none') {
      this._vLines
        .attr('x1', this._setXCoord.bind(this))
        .attr('x2',this._setXCoord.bind(this));
    }

    if(this.verticalLine === 'bottom') {
      this._vLines
        .attr('y1',Math.max.apply(null, this.tooltipData.yArr));

    } else if(this.verticalLine === 'top') {
      this._vLines
        .attr('y1', Math.min.apply(null, this.tooltipData.yArr))
        .attr('y2', -this.height);
    }
  },

  _addClipPath: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.clipPath) {
      if(this.verticalLine !== 'none' && this._vLines) {
        this.addClipPath(this._vLines);
      }

      if(this.horizontalLine !== 'none' && this._hLines) {
        var hl = this._hLines.nodes();
        for(var i = 0; i < hl.length; i++){
          this.addClipPath(Px.d3.select(hl[i]));
        }
      }

      if(this.circlePoint !== 'no' && this._circles) {
        this.addClipPath(this._circles);
      }

      if(this.radialAreaCursor && this._radiusCursor) {
        this.addClipPath(this._radiusCursor);
      }
    }
  },

  _processOpacity: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    var allMuted = true,
        keys = Object.keys(this._mutedCompleteSeriesConfig),
        vLineOpacity,
        _this = this,
        isMultiSerie = keys.length > 1;

    for(var i=0; i<keys.length; i++) {
      if(!this.mutedSeries[keys[i]]) {
        allMuted = false;
        break;
      }
    }

    if(this._vLines) {
      //should we average all muted opacities for all series?
      this._vLines.attr('opacity', allMuted ? this._defaultmutedOpacity : 1);
    }

    if(this._hLines) {
      this._hLines.each(function(d) {
        var muted = _this.mutedSeries && _this.mutedSeries[d] === true,
            opacity;

        if(muted) {
          opacity = _this._mutedCompleteSeriesConfig[d] && _this._mutedCompleteSeriesConfig[d].mutedOpacity ? _this._mutedCompleteSeriesConfig[d].mutedOpacity : _this._defaultmutedOpacity;
        } else {
          opacity = 1;
        }

        this.setAttribute('opacity', opacity);
      });
    }

    if(this._circles) {
      this._circles.each(function(d) {
        var muted = _this.mutedSeries && _this.mutedSeries[d] === true,
            mutedOpacity,
            opacity,
            strokeOpacity;

        if(muted) {
          mutedOpacity = _this._mutedCompleteSeriesConfig[d] && _this._mutedCompleteSeriesConfig[d].mutedOpacity ? _this._mutedCompleteSeriesConfig[d].mutedOpacity : _this._defaultmutedOpacity;
        } else {
          mutedOpacity = 1;
        }

        opacity = muted ? mutedOpacity * 1 : 1,
        strokeOpacity = muted ? mutedOpacity * 0.3 : 0.3;

        this.setAttribute('opacity', opacity);
        this.setAttribute('stroke-opacity', strokeOpacity);
      });
    }
  },

  _updateColors: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this._doesD3HaveValues(this._hLines)) {
      this._hLines.attr('stroke', this._checkThemeVariable("--px-vis-cursor-line-color", 'rgb(0,0,0)'));
    }

    if(this._doesD3HaveValues(this._vLines)) {
      this._vLines.attr('stroke', this._checkThemeVariable("--px-vis-cursor-line-color", 'rgb(0,0,0)'));
    }
  }
});
