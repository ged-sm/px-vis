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
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '../px-vis-axis.js';
import '../px-vis-scale.js';
import '../px-vis-highlight-point-canvas.js';
import '../px-vis-line-canvas.js';
import '../px-vis-svg-canvas.js';
import '../px-vis-behavior-colors.js';
import '../px-vis-behavior-renderer.js';
import 'px-buttons-design/css/px-buttons-design-demo-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style include="px-buttons-design-demo-styles" is="custom-style"></style>
    <px-vis-scale x-axis-type="time" y-axis-type="linear" complete-series-config="[[completeSeriesConfig]]" data-extents="{}" chart-extents="[[chartExtents]]" width="[[width]]" height="[[height]]" margin="[[margin]]" chart-data="[[chartData]]" x="{{x}}" y="{{y}}" domain-changed="{{domainChanged}}" selected-domain="[[selectedDomain]]">
    </px-vis-scale>
    <px-vis-line-canvas series-id="y" complete-series-config="[[completeSeriesConfig]]" chart-data="[[chartData]]" x="[[x]]" y="[[y]]" width="[[width]]" height="[[height]]" margin="[[margin]]" canvas-context="[[canvasContext]]" domain-changed="[[domainChanged]]">
    </px-vis-line-canvas>
    <px-vis-line-canvas series-id="y1" complete-series-config="[[completeSeriesConfig]]" chart-data="[[chartData]]" x="[[x]]" y="[[y]]" width="[[width]]" height="[[height]]" margin="[[margin]]" canvas-context="[[canvasContext]]" domain-changed="[[domainChanged]]">
    </px-vis-line-canvas>
    <px-vis-line-canvas series-id="y2" complete-series-config="[[completeSeriesConfig]]" chart-data="[[chartData]]" x="[[x]]" y="[[y]]" width="[[width]]" height="[[height]]" margin="[[margin]]" canvas-context="[[canvasContext]]" domain-changed="[[domainChanged]]">
    </px-vis-line-canvas>

    <px-vis-axis svg="[[svg]]" axis="[[x]]" margin="[[margin]]" width="[[width]]" height="[[height]]" orientation="bottom" label-position="center" complete-series-config="[[completeSeriesConfig]]" domain-changed="[[domainChanged]]" prevent-series-bar="" ticks="[[ticks]]">
    </px-vis-axis>

    <px-vis-axis svg="[[svg]]" axis="[[y]]" margin="[[margin]]" width="[[width]]" height="[[height]]" orientation="left" label-position="center" complete-series-config="[[completeSeriesConfig]]" muted-series="[[mutedSeries]]" domain-changed="[[domainChanged]]">
    </px-vis-axis>

    <px-vis-svg-canvas id="svg" width="[[width]]" height="[[height]]" svg="{{svg}}" canvas-context="{{canvasContext}}" canvas-layers="{{canvasLayers}}" canvas-layers-config="[[canvasLayersConfig]]" margin="[[margin]]">
    </px-vis-svg-canvas>

    <px-vis-highlight-point-canvas id="pointhighlight" canvas-context="[[canvasLayers.highlighter]]" canvas-layers-config="{{canvasLayersConfig}}" layers-to-mask="[[canvasContext]]" width="[[width]]" height="[[height]]" margin="[[margin]]" x="[[x]]" y="[[y]]" dimensions="[[dimensions]]" domain-changed="[[domainChanged]]" time-data="x" complete-series-config="[[completeSeriesConfig]]" series-keys="[&quot;y&quot;,&quot;y1&quot;,&quot;y2&quot;]" crosshair-data="[[crosshairData]]" chart-data="[[chartData]]">
    </px-vis-highlight-point-canvas>

    <div style="margin-top:15px;">
      <button on-click="highlightData" class="btn">Toggle Highlight Data</button>
    </div>
`,

  is: 'px-vis-highlight-point-canvas-demo-component',

  behaviors: [
    PxColorsBehavior.getSeriesColors,
    PxColorsBehavior.dataVisColorTheming,
    PxVisBehaviorRenderer.base],

  properties: {
    description: {
      type: String,
      value: "d3 element which highlights data"
    },
    chartData: {
      type: Array,
      value: function() {
        return [{
          "x": 1397102460000,
          "y": 1,
          "y1": 1,
          "y2": 1
        },{
          "x": 1397131620000,
          "y": 6,
          "y1": 15,
          "y2": 21
        },{
          "x": 1397160780000,
          "y": 10,
          "y1": 8,
          "y2": 3
        },{
          "x": 1397189940000,
          "y": 4,
          "y1": 10,
          "y2": 10
        },{
          "x": 1397219100000,
          "y": 6,
          "y1": 20,
          "y2": 27
        }]
      }
    },
    completeSeriesConfig: {
      type: Object
    },
    width: {
      type: Number,
      value: 500
    },
    height: {
      type: Number,
      value: 250
    },
    chartExtents: {
      type: Object,
      value: function() {
        return {
          'x': [1397102460000,1397219100000],
          'y':[1,27]
        }
      }
    },
    margin: {
      type: Object,
      value: function() {
        return {
          "top": 10,
          "right": 10,
          "bottom": 50,
          "left": 50
        }
      }
    },

    crosshairData: {
      type: Object,
      value: function() {
        return {
          "rawData":[],
          "timeStamps":[]
        }
      }
    },

     _crosshairData: {
      type: Object,
      value: function() {
        return {
          "rawData": [{
            "x": 1397131620000,
            "y": 6,
            "y1": 15,
            "y2": 21
          }, {
            "x": 1397160780000,
            "y": 10,
            "y1": 8,
            "y2": 3
          }],
          "timeStamps": [1397131620000, 1397160780000]
        }
      }
    },

    ticks:{
      type: Object,
      value: function() {return {}}
    },

    canvasLayers: {
      type: Object,
      value: function() { return {}; }
    },

    canvasLayersConfig: {
      type: Object,
      value: function() { return {}; }
    }
  },

  listeners:{
    'px-data-vis-colors-applied': '_genCSC'
  },

  observers: [
    '_renderChartData(domainChanged, canvasContext, chartData.*, completeSeriesConfig.*)',
    '_renderHighlight(domainChanged, canvasLayers.highlighter, completeSeriesConfig.*, crosshairData.timeStamps.*)',
    ],

  highlightData: function() {
    if(this.crosshairData && this.crosshairData.timeStamps.length) {
      this.set('crosshairData', {rawData: [], timeStamps: []});
    } else {
      this.set('crosshairData', this._crosshairData);
    }
  },

  _genCSC: function() {
   this.set('completeSeriesConfig', {
     "y": {
       "type":"line",
       "name":"mySeries1",
       "x":'x',
       "y":'y',
       "color": this._getColor(0)
     },
     "y1": {
       "type":"line",
       "name":"mySeries2",
       "x":'x',
       "y":'y1',
       "color": this._getColor(1)
     },
     "y2": {
       "type":"line",
       "name":"mySeries3",
       "x":'x',
       "y":'y2',
       "color": this._getColor(2)
     }
   });
 }
});
