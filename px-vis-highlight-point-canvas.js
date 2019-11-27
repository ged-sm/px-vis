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
    <px-vis-interaction-space
        ...
        generating-crosshair-data="{{generatingCrosshairData}}"
        crosshair-data="{{crosshairData}}">
    </px-vis-interaction-space>

    <px-vis-highlight-point-canvas
        svg="[[svg]]"
        x="[[x]]"
        y="[[y]]"
        domain-changed="[[domainChanged]]"
        time-data="[[key]]"
        complete-series-config="[[completeSeriesConfig]]"
        chart-data="[[chartData]]"
        generating-crosshair-data="[[generatingCrosshairData]]"
        crosshair-data="[[crosshairData]]">
    </px-vis-highlight-point-canvas>

@element px-vis-highlight-point-canvas
@blurb Element which highlight specific points on the dataset
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
import './px-vis-scatter-canvas.js';
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <style include="px-vis-styles"></style>

      <template is="dom-repeat" items="[[_nonMutedSeriesKeys]]">
        <px-vis-scatter-canvas radial="[[radial]]" renderer-type="highlightData" canvas-context="[[canvasContext]]" series-id="[[item]]" chart-data="[[_highlightData]]" complete-series-config="[[completeSeriesConfig]]" use-degrees="[[useDegrees]]" stroke-width="2" width="[[width]]" height="[[height]]" margin="[[margin]]" clip-path="[[clipPath]]" x="[[x]]" y="[[_returnYScale(item, completeSeriesConfig, domainChanged)]]" domain-changed="[[domainChanged]]">
        </px-vis-scatter-canvas>
      </template>
`,

  is: 'px-vis-highlight-point-canvas',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehavior.sizing,
    PxVisBehaviorD3.canvasContext,
    PxVisBehaviorD3.axes,
    PxVisBehavior.dataset,
    PxVisBehavior.commonMethods,
    PxVisBehavior.crosshairData,
    PxVisBehaviorD3.clipPathBoolean,
    PxVisBehavior.mutedCompleteSeriesConfig,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehavior.highlightCanvasShared,
    PxVisBehavior.interactionSpaceShared,
    PxVisBehavior.tooltipData,
    PxVisBehavior.seriesKeys
  ],

  /**
   *
   * @property properties
   * @type Object
   */
  //properties
  properties: {
    _highlightData: {
      type:Object,
      notify: true
    },

    seriesKeys: {
      type: Object
    },

    /**
     * Whether the scatter plot is using radial coordinates (x=phase, y=amplitude)
     */
    radial: {
      type: Boolean,
      value: false
    }

  },

  observers: [
    '_computeChartData(crosshairData.timeStamps.*, completeSeriesConfig, drawWithLocalCrosshairData, y, x, differentDataset, fuzz)',
    '_updateTooltipData(domainChanged)',
  ],

  _computeChartData: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.generatingCrosshairData && !this.drawWithLocalCrosshairData && this.crosshairData.rawData.length > 0) {
      return [];
    }

    this.debounce('_calcDataset', function() {

      var dataset = this.differentDataset ? this._calcDataset() : this.crosshairData.rawData;

      if(this.showTooltipData) {
        this._setTooltipData(dataset);
        this._resetTooltipData();
      }

      this.set('_highlightData', dataset);
      this.fire('px-vis-highlight-data-changed');
    }.bind(this), 10);
  },

  _updateTooltipData: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.defaultEmptyData) {
      this._setTooltipData(this._highlightData);
    }
  },

  _returnYScale: function(seriesId, config) {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.domainChanged) {
      if(typeof this.y === 'object') {
        var d = config[seriesId]['axis']['id'];
        if(this.y && this.y[d]) {
          return this.y[d];
        }
      } else if(typeof this.y === 'function') {
        return this.y;
      }
    }
    return;
  }
});
