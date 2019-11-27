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
        ...
        svg="{{svg}}">
    </px-vis-svg>
    <px-vis-scale
        ...
        x="{{x}}"
        y="{{y}}"
        domain-changed="{{domainChanged}}">
    </px-vis-scale>
    <px-vis-cursor-line
        svg="[[layer.2]]"
        svg-data-layer="[[layer.0]]"
        svg-overlay-layer="[[layer.1]]"
        canvas-data-layer="[[canvasContext]]"
        canvas-overlay-layer="[[canvasLayers.highlighter]]"
        x="[[x]]"
        y="[[y]]"
        parallel-coordinates
        dimensions="[[dimensions]]"
        domain-changed="[[domainChanged]]"
        complete-series-config="[[completeSeriesConfig]]"
        series-id="[[seriesKey]]"
        category-key="[[categoryKey]]"
        categories="[[categories]]"
        tooltip-data="[[tooltipData.dataset]]">
    </px-vis-cursor-line>


@element px-vis-cursor
@blurb Element which draws crosshairs around mouse pointer / data points and highlight adjacent datapoints.
@homepage index.html
@demo demo/index.html


*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './px-vis-behavior-common.js';
import './px-vis-behavior-d3.js';
import './px-vis-line-svg.js';
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <style include="px-vis-styles"></style>

      <px-vis-line-svg id="myHighlighter" svg="[[svg]]" parallel-coordinates="[[parallelCoordinates]]" radial-line="[[radialLine]]" multi-path="" disable-pointer-events="" line-radius-limit="[[lineRadiusLimit]]" clip-path="[[clipPath]]" series-id="[[seriesId]]" time-domain="[[timeDomain]]" category-key="[[categoryKey]]" categories="[[categories]]" chart-data="[[_returnData(tooltipData.*)]]" complete-series-config="[[completeSeriesConfig]]" stroke-width="2" muted-series="[[mutedSeries]]" x="[[x]]" y="[[y]]" domain-changed="[[domainChanged]]" interpolation-function="[[interpolationFunction]]">
      </px-vis-line-svg>
`,

  is: 'px-vis-cursor-line',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehaviorD3.svg,
    PxVisBehaviorD3.axes,
    PxVisBehavior.dataset,
    PxVisBehavior.commonMethods,
    PxVisBehavior.tooltipData,
    PxVisBehavior.completeSeriesConfig,
    PxVisBehavior.seriesId,
    PxVisBehavior.categories,
    PxVisBehaviorD3.clipPath,
    PxVisBehavior.mutedSeries,
    PxVisBehavior.dimensions,
    PxVisBehaviorD3.domainUpdate,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehaviorD3.interpolationFunction,
    PxVisBehaviorD3.lineRadiusLimit,
    PxVisBehavior.timeDomain
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
    * Boolean specifying if the chart is a parallel coordinates chart
    *
    */
    parallelCoordinates: {
      type: Boolean,
      value: false
    },
    /**
    * Boolean specifying if the line is using radial (polar) data
    *
    */
    radialLine: {
      type: Boolean,
      value: false
    },

    svgDataLayer: {
      type: Object,
      observer: '_applyTransition'
    },

    svgOverlayLayer: {
      type: Object,
      observer: '_applyTransition'
    },

    canvasDataLayer: {
      type: Object,
      observer: '_applyTransitionCanvas'
    },
    canvasOverlayLayer: {
      type: Object,
      observer: '_applyTransitionCanvas'
    }
  },

  observers: [
    '_updateLayers(tooltipData.*)'
  ],

  _applyTransition: function(layer) {
    if(layer === undefined) {
      return;
    }

    layer.node().style.transition = 'opacity 0.2s';
  },

  _applyTransitionCanvas: function(layer) {
    if(layer === undefined) {
      return;
    }

    layer.canvas.style.transition = 'opacity 0.2s';
  },

  /**
   * Mutes and unmutes the other chart layers
   *
   */
  _updateLayers: function() {
    if(this.svgDataLayer) {
      this.toggleClass('primaryDataMask', this.tooltipData, this.svgDataLayer.node());
    }

    if(this.svgOverlayLayer) {
      this.toggleClass('primaryOverlayMask', this.tooltipData, this.svgOverlayLayer.node());
    }

    if(this.canvasDataLayer) {
      this.toggleClass('primaryDataMask', this.tooltipData, this.canvasDataLayer.canvas);
    }

    if(this.canvasOverlayLayer) {
      this.toggleClass('primaryOverlayMask', this.tooltipData, this.canvasOverlayLayer.canvas);
    }
  },

  /**
   * Passes the data to the line generator if it exists
   *
   */
  _returnData: function() {
    return this.tooltipData ? [this.tooltipData] : [];
  },

  reDrawElement: function() {
    this.$.myHighlighter.drawElement();
  }
});
