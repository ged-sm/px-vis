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

### Minimal instantiation

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
        domain-changed="{{domainChanged}}">
    </px-vis-scale>
    <px-vis-axis
        svg="[[svg]]"
        axis="[[y]]"
        margin="[[margin]]"
        width="[[width]]"
        height="[[height]]"
        title="myTitle"
        orientation="left"
        label-position="center"
        complete-series-config="[[seriesConfig]]"
        muted-series=[[mutedSeries]]
        domain-changed="[[domainChanged]]">
    </px-vis-axis>

### d3 reference
https://github.com/mbostock/d3/wiki/SVG-Axes

### Styling
The following custom properties are available for styling:

Custom property | Description
:----------------|:-------------
  `--px-vis-font-family` | The font family for all labels and text
  `--px-vis-axis-color` | The color for the axis lines, axis ticks, and axis tick labels
  `--px-vis-axis-title-color` | The color for the axis title
  `--px-vis-axis-inline-title-color` | The color for the axis title
  `--px-vis-axis-inline-type-color` | The color for the axis lines, axis ticks, and axis tick labels when using 'inline' labelPosition
  `--px-vis-axis-inline-box-color` | The color for the tick boxes when using 'inline' labelPosition

@element px-vis-axis
@blurb d3 element which creates an axis for the chart
@homepage index.html
@demo demo.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './px-vis-behavior-common.js';
import './px-vis-behavior-d3.js';
import 'px-tooltip/px-tooltip.js';
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style include="px-vis-styles"></style>
`,

  is: 'px-vis-axis',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehaviorD3.svg,
    PxVisBehavior.sizing,
    PxVisBehaviorD3.axis,
    PxVisBehavior.completeSeriesConfig,
    PxVisBehavior.commonMethods,
    PxVisBehaviorD3.axisConfig,
    PxVisBehavior.truncating,
    PxVisBehaviorD3.domainUpdate,
    PxVisBehavior.preventInitialDrawing,
    PxVisBehavior.isAttached,
    PxVisBehavior.updateStylesOverride,
    PxVisBehavior.titleTruncation,
    PxVisBehavior.scaleTypeCheck
  ],

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
    /**
     * Holder for the instantiated d3 axis
     *
     */
    _axis: {
      type: Object,
      value: function() { return {}; }
    },
    /**
     * Holder for the axis drawing
     *
     */
    _axisGroup: {
      type: Object
    },
    /**
     * A unique ID for the axis
     *
     * @default random string
     */
    axisId: {
      type:String,
      value: '',
      reflectToAttribute: true
    },
    /**
     * The truncated title
     */
    displayedTitle: {
      type: String,
      notify: true
    },
    /**
     * Whether to append a unit (if existing in config) in the title
     */
    appendUnitInTitle: {
      type: Boolean,
      value: false
    },
    /**
     * Boolean which specifies not to draw the series bars
     */
    preventSeriesBar: {
      type: Boolean,
      value: false
    },
    /**
     * A boolean specifying if the axis title has been drawn
     *
     */
    titleDrawn: {
      type: Number,
      value: 0
    },
    /**
     * The series ID this axis refers to, used to look in the config
     */
    seriesId: {
      type: String
    },
    /**
     * The text representing the units of the axis
     */
    _currentUnits: {
      type: String,
      value: '',
      computed: '_computeUnits(appendUnitInTitle, title, unit)'
    },
    /**
     * Whether the title has been truncated
     */
    _titleTruncated: {
      type: Boolean,
      value: false
    },
    /**
    * A string specifying the type of axis. Used only for tick formating. Valid entries are:
    * - `time`
    * - `linear`
    * - `ordinal`
    */
    axisType: {
      type: String,
      value: 'linear'
    },
    /**
     * Rotation to apply to the axis, in degrees
     */
    rotation: {
      type: Number
    },
    /**
     * Translation offset to apply to the axis
     */
    offset: {
      type: Array,
      value: [0,0]
    },
    /**
     * A boolean specifying whether the axis should have ticks or not
     *
     */
    disableTicks: {
      type: Boolean,
      value: false
    },
    /**
     * Holder for the title group
     *
     */
    _titleGroup: {
      type: Object
    },

    _animationFrameDone: {
      type: Boolean,
      value: false
    },

    seriesOnAxis: {
      type: Array,
      value: function() {
        return [];
      }
    },
    rebuildOnDraw: {
      type: Boolean,
      value: false
    },
    _removingAxis: {
      type: Boolean,
      value:false
    },
    _tooltipElem: {
      type: HTMLElement
    },
    _axisDrawn: {
      type: Number,
      value: 0
    },
    /**
     * Unit to be used if appended to the title
     */
    unit: {
      type: String,
      value: ''
    },

    /**
     * Allows you to shift just the title from it's default location. Array,[x,y]
     */
    titleOffset: {
      type: Array,
      value: function() {
        return [0,0];
      }
    },

    _builtAxisType: String,
    _tooltipTimer: Number,
    _tooltipRequested: {
      type: Boolean,
      value: false
    },
    _titleText: Object
  },

  observers: [
    'drawElement(domainChanged, svg, axis, margin, width, height, disableTicks, _animationFrameDone, preventInitialDrawing, _isAttached, _stylesUpdated)',
    '_calcDrawnTicks(domainChanged)',
    'drawSeriesBars(completeSeriesConfig.*, titleDrawn)',
    '_muteSeriesBars(mutedSeries.*)',
    '_updateTicks(ticks)',
    '_updateTicks(tickFormat)',
    '_updateTicks(tickValues)',
    '_titleChanged(displayedTitle, _axisDrawn, titleLocation.*)',
    '_truncateTitle(title, truncationLength, appendUnitInTitle, completeSeriesConfig, _currentUnits)',
    '_orientationChanged(orientation)'
  ],

  detached: function() {
    this.removeAll();

    if(this.drawnTickValues && this.drawnTickValues.length > 0) {
      this.set('drawnTickValues', []);
      this.fire('px-vis-axis-drawn-tick-values-changed', { drawnTickValues: [] });
    }
  },

  ready: function() {
    window.requestAnimationFrame(function(){
      this.set('_animationFrameDone', true);
    }.bind(this));

    // if there is no dev set unique ID, generate one
    if(!this.axisId) {
      this.set('axisId', this.generateRandomID('axis_'));
    }
  },

  attached: function() {
    if(this._axisGroup) {
      // alert parents that we are done drawing the axis
      this.fire('px-axis-done');
    }
  },

  /**
   * Sets up this._axis as a d3 axis object.
   *
   */
  defineAxis: function() {

    switch(this.orientation) {
      case 'bottom':
        this._axis = Px.d3.axisBottom(this.axis);

        var h = Math.max(this.height - this.margin.bottom - this.margin.top,0);
        this.translateAmt = [this.offset[0],this.offset[1] + h];
        break;

      case 'top':
        this._axis = Px.d3.axisTop(this.axis);

        this.translateAmt = [this.offset[0],this.offset[1]];
        break;

      case 'right':
        this._axis = Px.d3.axisRight(this.axis);

        var w = Math.max(this.width - this.margin.left - this.margin.right,0);
        this.translateAmt = [this.offset[0] + w ,this.offset[1] ];
        break;

      default: //case 'left':
        this._axis = Px.d3.axisLeft(this.axis);
        this.translateAmt = [this.offset[0],this.offset[1]];
        break;
    }

    this._builtAxisType = this.axisType;

    this._processTicks();
  },

  /**
   * Examines the tick configs and applies them if relevant
   *
   */
  _processTicks: function() {

    //support for general ticks setting
    // https://github.com/d3/d3-axis#axis_ticks
    if(this.ticks && !this._isOrdinalType(this.axisType)) {
      if(typeof(this.ticks) === 'number' || !isNaN(parseInt(this.ticks))) {

        this._axis.ticks(this.ticks);

      } else if(typeof(this.ticks) === 'function') {
        this._axis.ticks(this.ticks);

      } else if(typeof(this.ticks) === 'object' && this.ticks.interval && this.ticks.format) {
          this._axis.ticks(this.ticks.interval, this.ticks.format);

      } else if(typeof(this.ticks) === 'object' && this.ticks.interval && (this.axisType !== 'time') || (this.axisType !== 'timeLocal')) {
        this._axis.ticks(this.ticks.interval);

      } else if(typeof(this.ticks) === 'object' && this.ticks.format && (this.axisType !== 'time') || (this.axisType !== 'timeLocal')) {
        this._axis.ticks(10, this.ticks.format);

      } else {
        console.error('Cannot interpret axis ticks')
      }
    }

    //support for tick format
    // https://github.com/mbostock/d3/wiki/Formatting#d3_format
    if(this.tickFormat && !this._isOrdinalType(this.axisType)) {
      if(typeof this.tickFormat === 'function') {
        this._axis.tickFormat(this.tickFormat);
      } else if(this.axisType === 'time') {
        this._axis.tickFormat(Px.d3.utcFormat(this.tickFormat));
      } else if(this.axisType === 'timeLocal') {
        this._axis.tickFormat(Px.d3.timeFormat(this.tickFormat));
      } else if(this.axisType === 'linear') {
        this._axis.tickFormat(Px.d3.format(this.tickFormat));
      }
    }

    //support for tick values
    // https://github.com/d3/d3-axis/blob/master/README.md#axis_tickValues
    if(this.tickValues && this.tickValues.length > 0 && !this._isOrdinalType(this.axisType)) {
      //dont run if our domain is NaN. Otherwise raises errors
      if(!isNaN(this.axis.domain()[0]) && !isNaN(this.axis.domain()[1])) {
        this._axis.tickValues(this.tickValues);
      }
    }

    //if we want our labels to be in a specific position
    if(this.labelPosition === 'inline') {
      this._axis.tickSizeInner(0);
    } else if(this.labelPosition !== 'center') {
      this._axis.tickSizeInner(this.labelTypeSize);
    }

    // controls the tick mark size for ticks with numbers
    if(this.tickSizeInner || this.tickSizeInner === 0) {
      this._axis.tickSizeInner(this.tickSizeInner);
    }

    if(this.tickPadding || this.tickPadding === 0) {
      this._axis.tickPadding(this.tickPadding);
    }

    // controls the first and last ticks
    this._axis.tickSizeOuter(this.tickSizeOuter);

    //if we want to turn off ticks and labels
    if(this.disableTicks) {
      this._axis.ticks(0);
      // this._axis.tickValues([]);
    }
  },

  removeAll: function() {
    this.removeTitle();
    this.removeAxis();
  },

  removeAxis: function() {
    this._removingAxis = true;
    this._axisDrawn = 0;
    // remove the axis
    if(this._axisGroup) {
      this._axisGroup.remove();
      this._axisGroup = null;
    }
    this._removingAxis = false;
  },

  removeTitle: function() {
    if(this._titleGroup) {
      this._titleGroup.remove();
      this._titleGroup = null;
    }
  },

  /**
   * Draws the axis
   *
   * @method drawElement
   */
  drawElement: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(typeof this.preventInitialDrawing !== undefined && this.preventInitialDrawing === false) {
      this.debounce('drawaxis', function() {

        // Should be inside debounce to ensure that nothing changed after the debounce timer started
        if(this._isAttached && this._animationFrameDone && this._doesD3HaveValues(this.svg) && this.domainChanged && this.orientation && this.axis) {

          if(this.rebuildOnDraw) {
            this.removeAxis();
          }

          this.defineAxis();
          if(!this._axisGroup) {
            this._buildAxis();
          } else {
            this._updateAxis();
          }

          this._axisDrawn += 1;

          // alert parents that we are done drawing the axis
          this.fire('px-axis-done');
        }
      }, 10);
    }
  },

  /**
   * Updates the axis
   *
   */
  _updateAxis: function() {

    this._axisGroup
    .attr('transform', function() {
      if(this.rotation) {
        return 'rotate(' + (Number(this.rotation)) + ') translate(' + this.translateAmt.join(',') + ')';
      } else {
        return 'translate(' + this.translateAmt.join(',') + ')';
      }
    }.bind(this))
    .call(this._axis);

    this._setLineStyles(this._axisGroup);
    this._setLabelStyles(this._axisGroup);

    this._calcDrawnTicks();
  },

  /**
   * Builds the axis
   *
   */
  _buildAxis: function() {
    var g = this.svg.append('g')
      .attr('class', 'axis')
      .attr('axis-id',this.axisId)
    //   .attr('debug-id',this.title)
      .attr('transform', function() {
        if(this.rotation) {
          return 'rotate(' + (Number(this.rotation)) + ') translate(' + this.translateAmt.join(',') + ')';
        } else {
          return 'translate(' + this.translateAmt.join(',') + ')';
        }
      }.bind(this))
      .call(this._axis);

    g.select('path.domain').attr('stroke', this._findAxisSubColor(this.axisLineColor, '--px-vis-axis-color', 'black'))
    this.set('_axisGroup',g);

    this._setLineStyles(this._axisGroup);
    this._setLabelStyles(this._axisGroup);

    this._calcDrawnTicks();
  },

  /**
   * Updates the ticks
   *
   */
  _updateTicks: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this._doesObjHaveValues(this._axis) && this.axis && this.margin && this.height && typeof this.disableTicks !== 'undefined') {

      this.drawElement();
    }
  },

  /**
   * Returns the drawn tick values
   *
   */
  _calcDrawnTicks: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    //apparently we need to give ourselves a bit of time to ensure the axis draws and it can clac this
    this.debounce("drawnTicks", function() {
      if(!this.domainChanged ||
        this._isOrdinalType(this.axisType) ||
        !this._axis ||
        !this._axis.scale ||
        this._builtAxisType !== this.axisType) {
        return;
      }
      // FIXME Only works if ticks is a Number; need to support other formats for ticks
      if(this.ticks && typeof this.ticks === 'number') {
        this.set('drawnTickValues', this._axis.scale().ticks(this.ticks));
      } else {
        this.set('drawnTickValues', this._axis.scale().ticks());
      }
      this.fire('px-vis-axis-drawn-tick-values-changed', { drawnTickValues: this.drawnTickValues});
    }, 1);
  },

  /**
   * Calculates the dimensions for the label.
   *
   * @method setLabelDims
   */
  setLabelDims: function() {
    var label = {};

    //for radial charts. TODO make it work with other charts?
    if(this.labelPosition === 'inline') {
      if(this.orientation === 'left' || this.orientation === 'right') {
        label.x = 0;
        label.y = 0;
        label.anchor = 'middle';
      } else {
        label.x = 0;
        label.y = -this.labelTypeSize / 3;
        label.anchor = 'middle';
      }

      return label;
    }

    switch(this.orientation) {
      case 'bottom':
        label.x = 5;
        label.y = this.labelTypeSize / 4;
        label.anchor = (this.labelPosition === 'after') ? 'start' : 'end';
        break;

      case 'top':
        label.x = 5;
        label.y = this.labelTypeSize / -4;
        label.anchor = (this.labelPosition === 'after') ? 'start' : 'end';
        break;

      case 'left':
        label.x = this.labelTypeSize * -2/3;
        label.y = (this.labelPosition === 'after') ? this.labelTypeSize * -2/3 : this.labelTypeSize * 2/3;
        label.anchor = 'end';
        break;

      case 'right':
        label.x = this.labelTypeSize * 2/3;
        label.y = (this.labelPosition === 'after') ? this.labelTypeSize * -2/3 : this.labelTypeSize * 2/3;
        label.anchor = 'start';
        break;
    }

    return label;
  },

  /**
   * Sets the d3 attributes for the labels
   *
   */
  _setLabelStyles:function(elem) {
    elem.selectAll('text')
      .attr('font-size', this.labelTypeSize + 'px')
      .style('font-family',this._checkThemeVariable("--px-vis-font-family", 'Comic Sans MS'))
      .attr('font-style', this._checkThemeVariable("--px-vis-font-family", 'Comic Sans MS'));

    // if we are not inline, apply default colors
    if(this.labelPosition !== 'inline') {
      elem.selectAll('text')
        .attr('fill', this._findAxisSubColor(this.axisLabelColor, '--px-vis-axis-color', 'black'));

      elem.selectAll('g.tick').selectAll("line")
        .attr('stroke', this._findAxisSubColor(this.axisTickColor, '--px-vis-axis-color', 'black'));
      }

    // if we are not default centering our label, then do calcs to figure out where to put it
    // TODO Right now, you cannot have a label center and apply a custom offset. Possible enhancement?
    if(this.labelPosition !== 'center') {
      var label = this.setLabelDims();

      elem.selectAll('text')
        .attr('y', label.y)
        .attr('x', label.x)
        .attr('text-anchor', label.anchor)
        .style('text-anchor', label.anchor)
        .attr('transform','rotate(' + this.labelRotation + ') translate(' + this.labelTranslation.join(',') + ')');
    }

    // If wer are inlining our label, apply the boxes behind the label
    if(this.labelPosition === 'inline') {
      var gTick = elem.selectAll('g.tick'),
          tickText = gTick.select('text');

      gTick.selectAll('rect').remove();

      gTick.insert('rect','text')
        .attr('x',function(d,i) {
          return tickText.nodes()[i].getBoundingClientRect().width / -2 - 3
        })
        .attr('y', this.labelTypeSize * -0.5 - 2)
        .attr('width',function(d,i) {
          return tickText.nodes()[i].getBoundingClientRect().width + 6
        })
        .attr('height', this.labelTypeSize + 4)
        .attr('fill',this._findAxisSubColor(this.axisLineColor, '--px-vis-axis-inline-box-color', 'black'))
        .attr('transform','rotate(' + this.labelRotation + ')');

        tickText.attr('fill', this._checkThemeVariable("--px-vis-axis-inline-type-color", 'rbg(255,255,255)'));
    }
  },

  /**
   * Sets the axis line styles
   *
   */
  _setLineStyles:function(elem) {
    var theme = this.labelPosition === 'inline' ? "--px-vis-axis-inline-box-color" : "--px-vis-axis-color";

    elem.selectAll('path')
      .attr('fill','none')
      .attr('stroke', this._findAxisSubColor(this.axisLineColor, theme, 'black'))
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke-width', this.strokeWidth);

    elem.selectAll('line')
      .attr('fill','none')
      .attr('stroke', this._findAxisSubColor(this.axisTickColor, theme, 'black'))
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke-width', this.strokeWidth);
  },

  /**
   * /!\ Forces layout reflow, call carefully
   */
  _getAxisGroupSize: function() {
    var ext;
    /*
      Regarding this longstanding Firefox only bug: https://bugzilla.mozilla.org/show_bug.cgi?id=612118
      getBBox fails when chart is hidden
      getBoundingClientRect also doesnt return the same exact values as getBBox in Firefox, which may cause title to overlay on the next axis in multi axis cases
      So try getBBox, fallback on getBoundingClientRect which should never actually be used.

      remove the try if mozilla ever fixes this bug
    */
    try {
      ext = this._axisGroup.node().getBBox();
    } catch(e) {
      ext = this._axisGroup.node().getBoundingClientRect();
    }
    return ext;
  },

  _calcTopBottomLabelSize: function() {
    return this.labelPosition === 'center' ? this.labelTypeSize : 0;
  },

  _calcLeftRightLabelSize: function() {
    var size = 0;

    // if we are dealing with longer names, just measure
    if(this._isTimeType(this.axisType) || this._isOrdinalType(this.axisType)) {
      size = parseFloat(this._getAxisGroupSize()['width']);
    } else {
      // NOTE: If this is not exact enough, we can use PxVisBehavior.measureText to measure
      // Cheat and assume text chars are all the same width.

        // ticks = null is default for d3
        var ticks = null;

        // check if dev specified a number of ticks; dont care about functions
        if(this.ticks && typeof this.ticks === 'number') {
          ticks = this.ticks;
        } else if(this.ticks && typeof this.ticks === 'object' && this.ticks.interval) {
          ticks = this.ticks.interval;
        }

        // need to figure out our ticks and how they are formatted
        var chars = 0,
            ticksVals = this.tickValues ? this.tickValues : this.axis.ticks(ticks),
            formatter = this.tickFormat ? this._axis.tickFormat() : this.axis.tickFormat(),
            // Could iterate through all ticks, but min and max are probably going to have the most chars...
            // formatted = ticksVals.map(formatter);
            formattedMin = formatter(ticksVals[0]),
            formattedMax = formatter(ticksVals[ ticksVals.length-1 ]);

        // now figure out which is longest
        // for(var i = 0; i < formatted.length; i++) {
        //   chars = Math.max(formatted[i].length, chars);
        // }

        chars = Math.max(formattedMin.length, chars);
        chars = Math.max(formattedMax.length, chars);

        //give us a full typesize + half each additional
        size = chars * this.labelTypeSize * 0.5 + this.labelTypeSize * 0.5;
    }

    return size;
  },

  /**
   * Draws the axis title
   *
   */
  drawTitle: function() {

    this.removeTitle();

    var ext = {},
        location = this._doesObjHaveValues(this.titleLocation) ? 'custom' : this.orientation,
        x,y,r,anchor;

    switch(location) {
      case 'bottom':
        //range of axis = length of axis
        ext["width"] = (this.axis.range()[1] - this.axis.range()[0])/2;

        //if we have a label rotation, calcs are complicated; just take the perf hit and measure
        //if normal, then size is: tick length + label size + label offset + title size + designed margin
        ext["height"] = this.labelRotation ? parseFloat(this._getAxisGroupSize()["height"]) :
            this._axis.tickSizeInner() + this._calcTopBottomLabelSize() + this.labelTranslation[1] + this.titleTypeSize + 5;

        x = ext['width'] + this.translateAmt[0] + this.titleOffset[0];
        y = ext['height'] + this.translateAmt[1]  + this.titleOffset[1];
        r = 0;
        anchor = 'middle';
        break;

      case 'top':
        //range of axis = length of axis
        ext["width"] = (this.axis.range()[1] - this.axis.range()[0])/2;

        //if we have a label rotation, calcs are complicated; just take the perf hit and measure
        //if normal, then size is: tick length + label size + label offset + title size + designed margin
        ext["height"] = this.labelRotation ? parseFloat(this._getAxisGroupSize()["height"]) :
            this._axis.tickSizeInner() + this._calcTopBottomLabelSize() + this.labelTranslation[1] + 5;

        x = ext['width'] + this.translateAmt[0] + this.titleOffset[0];
        y = -ext["height"] + this.translateAmt[1] + this.titleOffset[1];
        r = 0;
        anchor = 'middle';
        break;

      case 'left':
        //if we have a label rotation, calcs are complicated; just take the perf hit and measure
        //if normal, then size is: tick length + label size + label offset + designed margin
        ext["width"] = this.labelRotation ? parseFloat(this._getAxisGroupSize()["width"]) * -1 :
            (this._axis.tickSizeInner() + this._calcLeftRightLabelSize() + this.labelTranslation[0] + 5);
        //range of axis = length of axis
        ext["height"] = (this.axis.range()[1] - this.axis.range()[0]) / 2;

        x = -ext["width"] + this.translateAmt[0] + this.titleOffset[0];
        y = -ext['height'] + this.translateAmt[1] + this.titleOffset[1];
        r = -90;
        anchor = 'middle';
        break;

      case 'right':
        //if we have a label rotation, calcs are complicated; just take the perf hit and measure
        //if normal, then size is: tick length + label size + label offset + title size + offset to get to designed margin
        ext["width"] = this.labelRotation ? parseFloat(this._getAxisGroupSize()["width"]) :
            this._axis.tickSizeInner() + this._calcLeftRightLabelSize() + this.labelTranslation[0] + this.titleTypeSize;
        //range of axis = length of axis
        ext["height"] = (this.axis.range()[1] - this.axis.range()[0]) / 2;

        x = ext["width"] + this.translateAmt[0] + this.titleOffset[0];
        y = -ext['height'] + this.translateAmt[1] + this.titleOffset[1];
        r = -90;
        anchor = 'middle';
        break;

      case 'custom':
        x = this.titleLocation.x;
        y = this.titleLocation.y;
        r = this.titleLocation.r;
        anchor = this.titleLocation.anchor;
        break;
    }

      this._titleGroup = this.svg.append('g')
        .attr('class','title-group')
        .attr('for', this.axisId)
        .attr('transform','translate(' + x + ',' + y + ')');

      var themeVar = (this.labelPosition === 'inline') ? "--px-vis-axis-inline-title-color" : "--px-vis-axis-title-color";

      this._titleText = this._titleGroup.append('text')
        .attr('class','axis-title')
        .attr('fill', this._findAxisSubColor(this.axisTitleColor, themeVar, 'black'))
        .attr('font-size', this.titleTypeSize + 'px')
        .style('font-family',this._checkThemeVariable("--px-vis-font-family", 'Comic Sans MS'))
        .attr('font-style', this._checkThemeVariable("--px-vis-font-family", 'Comic Sans MS'))
        .text(this.displayedTitle)
        .attr('text-anchor', anchor)
        .style('text-anchor', anchor)
        .attr('transform','rotate(' + r + ')')
        .attr('pointer-events', 'none')
        .on('mouseenter', null)
        .on('mouseleave', null);

    if(this._titleTruncated) {
      this._titleText
        .attr('pointer-events', 'all')
        .on('mouseenter', this._onTitleHover.bind(this))
        .on('mouseleave', this._onTitleLeave.bind(this));
    }

    this.set('titleDrawn', this.titleDrawn + 1);
  },

  /**
   * Draws the color bars for each series
   *
   */
  drawSeriesBars: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(!this.preventSeriesBar && this._doesObjHaveValues(this.completeSeriesConfig) && this._axisGroup && this._titleGroup) {

      // TODO do we need to move the title group based on how many series we have
      var keys = this.seriesOnAxis.length > 0 ? this.seriesOnAxis : Object.keys(this.completeSeriesConfig),
          kLen = keys.length,
          i;

      for(i = 0; i < kLen; i++) {
        if(this.completeSeriesConfig[keys[i]]) {
          this._drawBar(this._titleGroup,keys[i], this.completeSeriesConfig[keys[i]]['color'], i, this.completeSeriesConfig[keys[i]]['dashPattern']);
        }
      }
    }
  },

  /**
   * Mutes and unmutes the color bars for each series
   *
   */
  _muteSeriesBars: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this._doesD3HaveValues(this._titleGroup) && !this.preventSeriesBar) {
      var keys = Object.keys(this.mutedSeries);
      for(var i = 0; i < keys.length; i++) {
        var series = this._titleGroup.select('[series-bar-id=bar_' + this._escapeCssSelector(keys[i]) + ']');
        // if we want to mute it
        if(this.mutedSeries[keys[i]]) {
          series.attr('opacity',0.5);
        } else {
          series.attr('opacity',1);
        }
      }
    }
  },

  /**
   * Helper function to draw the series color bar
   *
   */
  _drawBar:function(elem,sid,color,index,dashPattern) {
    // FIXME change with measuring on canvas!!
    var w = elem.select('.axis-title').node().getComputedTextLength();
//        var translate = 'translate(-12,' + (-3 -w - 5 * index) + ')';
    var translate = 'translate(-12,' + ( -w/2 - 10 - 8 * index) + ')';
    var mutedSeriesValue = (this.mutedSeries && this.mutedSeries[sid]) ? 0.5 : 1;
    // TODO make configurable?
      elem.append('line')
          .attr('x1',0)
          .attr('x2',15)
          .attr('y1',0)
          .attr('y2',0)
          .attr('stroke', color)
          .attr('stroke-width', 3)
          .attr('stroke-dasharray',dashPattern)
          .attr('series-bar-id','bar_' + sid)
          .attr('transform', translate)
          .attr('opacity', mutedSeriesValue);

  },

  /**
   * Helper function to append units to the title
   *
   */
  _computeUnits: function(appendUnitInTitle) {
    if(appendUnitInTitle === undefined) {
      return;
    }

    var result = '';
    if(appendUnitInTitle && this.unit) {
      result = ' [' + this.unit + ']';
    }

    return result;
  },

  /**
   * Truncates the title label appropriately
   */
  _truncateTitle: function(title, truncationLength, appendUnitInTitle) {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    this.debounce('_truncateTitle', function() {

        var oldTitle = this.displayedTitle,
            newTitle;
        if(this.titleTruncation &&
            title.length > 2 && title.length > this.truncationLength) {

          newTitle = this._truncateName(title, truncationLength) + this._currentUnits;
          this.set('_titleTruncated', true);
        } else {
          newTitle = title + this._currentUnits;
          this.set('_titleTruncated', false);
        }
        if(newTitle !== oldTitle) {
          this.fire('px-vis-axis-displayed-title-changed', {displayedTitle: newTitle, title: this.title, id: this.seriesId});
          this.set('displayedTitle', newTitle);
        }
      }, 5);
  },

  /**
   * Redraws the title on change
   */
  _titleChanged: function(displayedTitle) {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    // No debounce. Even though it fires a lot, debounce causes a noticable lag in the title.
    if(!this._removingAxis && this._axisDrawn) {
      this.drawTitle();
    }
  },

  _orientationChanged: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    this.removeAxis();
    this.drawElement();
  },

  _findAxisSubColor: function(subProperty, cssVarName, cssVarDefault) {

    if(subProperty) {
      return subProperty;
    } else {
      return this.axisColor ? this.axisColor : this._checkThemeVariable(cssVarName, cssVarDefault);
    }
  },

  _onTitleHover: function() {
    if(!this._titleTruncated) {
      return;
    }

    this._tooltipRequested = true;
    this._tooltipTimer = setTimeout(() => {

      const detail = {
        origin: this,
        is: this.is,
        element: this._titleText.node(),
        data: [{
          text: `${this.title} ${this._currentUnits}`
        }]
      }

      this.dispatchEvent(new CustomEvent('central-tooltip-display-request', { bubbles: true, composed: true, detail: detail }));

      this._tooltipRequested = false;

    }, 500);
  },

  _onTitleLeave: function() {
    if(!this._titleTruncated) {
      return;
    }

    if(this._tooltipRequested) {
      clearTimeout(this._tooltipTimer);

    } else {
      this.dispatchEvent(new CustomEvent('central-tooltip-cancel-request', { bubbles: true, composed: true, detail: {origin: this } }));

    }
  }
});
