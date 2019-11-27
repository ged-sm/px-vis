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

import '../px-vis-scale.js';
import '../px-vis-svg.js';
import '../px-vis-axis.js';
import '../px-vis-behavior-common.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <div class="outline">
      <px-vis-svg width="[[width]]" height="[[height]]" margin="[[margin]]" svg="{{svg}}">
      </px-vis-svg>
      <px-vis-scale x-axis-type="linear" y-axis-type="linear" complete-series-config="[[completeSeriesConfig]]" data-extents="[[dataExtents]]" width="[[width]]" height="[[height]]" margin="[[margin]]" chart-data="{{chartData}}" x="{{x}}" y="{{y}}" domain-changed="{{domainChanged}}">
      </px-vis-scale>
      <template is="dom-if" if="[[_checkOrientation(orientation)]]" restamp="">
        <px-vis-axis svg="[[svg]]" axis="[[y]]" margin="[[margin]]" width="[[width]]" height="[[height]]" title="myYTitle" orientation="[[orientation]]" label-position="center" complete-series-config="[[completeSeriesConfig]]" muted-series="[[mutedSeries]]" domain-changed="[[domainChanged]]">
        </px-vis-axis>
      </template>
      <template is="dom-if" if="[[!_checkOrientation(orientation)]]" restamp="">
        <px-vis-axis svg="[[svg]]" axis="[[x]]" margin="[[margin]]" width="[[width]]" height="[[height]]" title="myXTitle" orientation="[[orientation]]" label-position="center" complete-series-config="[[completeSeriesConfig]]" muted-series="[[mutedSeries]]" domain-changed="[[domainChanged]]" prevent-series-bar="">
        </px-vis-axis>
      </template>

      </div>
`,

  is: "px-vis-axis-demo-component",

  behaviors: [
    PxColorsBehavior.dataVisColors,
    PxColorsBehavior.dataVisColorTheming,
    PxColorsBehavior.getSeriesColors
  ],

  properties:{
    demoType: {
      type: String
    },
    svg: {
      type: Object
    },
    width: {
      type : Number,
      value : 800
    },
    height:{
      type : Number,
      value : 500
    },
    y: {
      type: Object,
      notify: true
    },
    margin:{
      type : Object,
      value : function() {
        return {
          "top": 0,
          "right": 20,
          "bottom": 50,
          "left": 70
        }
      }
    },
    chartData:{
      type : Array,
      value : function() {
        return [{
          'x': 1,
          'y': 0.56
        },{
          'x': 2,
          'y': 0.4
        },{
          'x': 3,
          'y': 0.43
        },{
          'x': 4,
          'y': 0.33
        },{
          'x': 5,
          'y': 0.47
        },{
          'x': 6,
          'y': 0.41
        },{
          'x': 7,
          'y': 0.26
        },{
          'x': 8,
          'y': 0.42
        },{
          'x': 9,
          'y': 0.27
        },{
          'x': 10,
          'y': 0.38
        },{
          'x': 2,
          'y': 0.36
        },{
          'x': 1,
          'y': 0.32
        }]
      }
    },
    completeSeriesConfig:{
      type : Object
    },
    dataExtents:{
      type : Object,
      value: function() {
        return {
          "x": [0,10],
          "y": [0,-Infinity]
        }
      }
    },

    orientation: {
      type: String
    }
  },

  listeners: {
    "px-data-vis-colors-applied" : '_returnCompleteSeriesConfig'
  },

  _checkOrientation: function(orientation) {
    return orientation === 'left';
  },

  _returnCompleteSeriesConfig: function() {
    this.set('completeSeriesConfig', {
      'mySeries': {
        "name":"My-Series",
        "type": "line",
        "x": 'x',
        "y": 'y',
        'color': this._getColor(0)
      }
    });
  }
});
