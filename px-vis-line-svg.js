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
      selected-domain="[[selectedDomain]]">
    </px-vis-scale>
    <px-vis-line-svg
      svg="[[svg]]"
      series-id="mySeries"
      complete-series-config="[[seriesConfig]]"
      chart-data="[[chartData]]"
      x="[[x]]"
      y="[[y]]"
      domain-changed="[[domainChanged]]">
    </px-vis-line-svg>

@element px-vis-line-svg
@blurb Element which draws lines series onto the chart
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

  is: 'px-vis-line-svg',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehaviorD3.svg,
    PxVisBehaviorD3.lineShared,
    PxVisBehaviorD3.axes,
    PxVisBehavior.dataset,
    PxVisBehavior.mutedSeries,
    PxVisBehavior.commonMethods,
    PxVisBehaviorD3.clipPath,
    PxVisBehavior.completeSeriesConfig,
    PxVisBehavior.categories,
    PxVisBehaviorD3.selectedDomain, //needed for multiline
    PxVisBehavior.polarData,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehavior.serieToRedrawOnTop,
    PxVisBehaviorD3.serieToRedrawOnTopSVG,
    PxVisBehaviorD3.domainUpdate,
    PxVisBehavior.preventInitialDrawing,
    PxVisBehavior.isAttached
  ],

  /**
   * Event fired when an svg line has finished drawing
   * @event px-vis-line-svg-rendering-ended
   */

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
    /**
     * A holder object for the series object.
     */
    linePath:{
      type:Object
    },
    /**
     * A holder object for the series builder.
     *
     * @property linePath
     * @type String
     */
    lineBuilder:{
      type:Object
    },
    /**
     * A holder object for the series group.
     *
     */
    lineGroup:{
      type:Object
    },

    strokeWidth: {
      type: Number,
      value: 1
    },
    /**
     * The opacity value of the fill to be used when muting a series (stroke is not drawn on mute).
     * This property will be read from the completeSeriesConfig.
     */
    mutedOpacity: {
      type: Number
    },
    /**
     * Debounce time to use for drawing.
     */
    drawDebounceTime: {
      type: Number,
      value: 10
    },
    disablePointerEvents: {
      type: Boolean,
      value: false
    },

    idPrefix: {
      type: String,
      value: 'line_'
    }
  },

  observers: [
    'drawElement(svg, y, domainChanged, chartData.*, completeSeriesConfig.*, counterClockwise, preventInitialDrawing)',
    'isIdInMuted(mutedSeries.*, completeSeriesConfig)',
    '_addClipPath(clipPath)',
    '_drawOnTop(serieToRedrawOnTop)',
    '_disablePointerEvents(disablePointerEvents)'
  ],

  ready: function() {
    this._watchConfigProperty('mutedOpacity', 0.3);
    this._watchConfigProperty('strokeWidth', 1);
  },

  attached: function() {

    //if we've been detached and reattached make sure we redraw
    if(this._isDirty) {
      this.drawElement();
    }

    this._isDirty = false;
  },

  detached: function() {

    this._isDirty = true;

    this.linePath = null;
    if(this._doesD3HaveValues(this.lineGroup)) {
      this.lineGroup.remove();
      this.lineGroup = null;
    }
  },

  /**
   * Draws or updates the line element.
   * Called from an observer watching for data and the necessary d3 objects.
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
    if(this.domainChanged &&
          this._doesD3HaveValues(this.svg) &&
          this.y &&
          this._doesObjHaveValues(this.completeSeriesConfig) &&
          this._isAttached &&
          this.chartData
        ) {
        this._resetRenderingContext();

        // we need to wrap the data differently depending on if we are drawing many lines or just one line
        if(this.parallelCoordinates) {
          var data = this.chartData;
          this._defineMultiLine(false);
        }  else if(this.radialLine) {
          this._defineRadialLine(false, this.multiPath, this.counterClockwise, this.useDegrees);
          data = this.multiPath ? this.chartData : [this.chartData];
        } else {
          var data = [this.chartData];
          this._defineSingleLine(false);
        }

        // checks to see if the group already exists. If not, create; if so, update
        if(this._isObjEmpty(this.lineGroup)) {
          // draw the path
          this.lineGroup = this.svg.append('g')
            .attr('series-id', this.idPrefix + this.seriesId)
            .attr('class', 'series-line');

          if(this.disablePointerEvents) {
            this.lineGroup.style("pointer-events", "none");
          }
        } else {
          this.lineGroup.attr('series-id', this.idPrefix + this.seriesId)
        }

        // set our data
        var lineBuilder = this.lineGroup.selectAll('path.series-line')
          .data(data);

        // When datapoints disappear from our data, remove them
        lineBuilder.exit().remove();

        // When datapoints are added to our data, add stuff
        lineBuilder.enter()
          .append('path')
          .attr('class', 'series-line')
          .attr('fill','none')
        // When datapoints are added OR this funtion is run, draw stuff
        .merge(lineBuilder)
          .attr('d', function(d) {
            return this.line(d);
          }.bind(this))
          .attr('series-id', function(d,i) {
            return this.multiPath ? this.idPrefix + d[this.seriesId] : this.idPrefix + this.seriesId
          }.bind(this))
          .attr('id', function(d,i) {
            return this.multiPath ? this.idPrefix + d[this.seriesId] : this.idPrefix + this.seriesId
          }.bind(this))
          .attr('stroke-width',this.strokeWidth)
          .attr('stroke',function(d,i) {
            return this._getLineColor(d);
          }.bind(this))
          .attr('stroke-opacity',this._svgLineOpacity.bind(this))
          .attr('stroke-dasharray', this.completeSeriesConfig[this.seriesId]['dashPattern']);

        // Make it easy to get our lines again
        this.linePath = this.lineGroup.selectAll('path.series-line');

        this._addClipPath();

        this.isIdInMuted();

        this.fire('px-vis-line-svg-rendering-ended');
      }
  },

  /**
   * Helper to call addClipPath with the element.
   *
   * @method _addClipPath
   */
  _addClipPath: function() {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    this.addClipPath(this.lineGroup);
  },

  /**
   * Checks mutedSeries to see if this ID is in there.
   * Called from an observer watching mutedSeries.
   *
   * @method isIdInMuted
   */
  isIdInMuted: function() {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    if(this.multiPath && this._doesObjHaveValues(this.linePath)) {
      this.linePath.style('display', function(d) {
        // if we have multiPaths, then just hide them; might want to changes this but need to check with design
        return this.mutedSeries[d[this.seriesId]] ? 'none' : null;
      }.bind(this));
      this._colorLine();
    } else if(this.mutedSeries.hasOwnProperty(this.seriesId)) {

      this._colorLine();
    }
  },

  /**
   * Adds full color to the SVG line.
   *
   * @method _colorLine
   */
  _colorLine:function() {
    if(this.linePath) {
      this.linePath.attr('stroke',function(d,i) {
        return this._getLineColor(d);
      }.bind(this))
      .attr('stroke-opacity',this._svgLineOpacity.bind(this));
    }
  },

  /**
   * Returns the opacity for the SVG line.
   *
   * @method _svgLineOpacity
   */
  _svgLineOpacity: function(d) {
    if(this.mutedSeries[this.seriesId]) {
      return this.mutedOpacity;
    }

    return 1;
  },

  /**
   * Redraw this series on top if needed.
   *
   * @method _drawOnTop
   */
  _drawOnTop: function(serieToRedrawOnTop) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    if(this.lineGroup && this.seriesId) {
      this._drawSVGOnTop(serieToRedrawOnTop, this.seriesId, this.lineGroup);
    }
  },

  _disablePointerEvents: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this._doesD3HaveValues(this.lineGroup)) {
      this.lineGroup.style("pointer-events", "none");
    }
  }
});
