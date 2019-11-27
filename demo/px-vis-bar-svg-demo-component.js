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
import '../px-vis-bar-svg.js';
import '../px-vis-behavior-common.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <div class="outline">

      <template is="dom-if" if="[[!_returnType(type)]]">
        <px-vis-svg width="[[width]]" height="[[height]]" margin="[[margin]]" svg="{{svgBar}}">
        </px-vis-svg>
        <px-vis-scale x-axis-type="scaleBand" y-axis-type="linear" complete-series-config="[[completeSeriesConfig]]" chart-extents="[[_returnColumnChartExtents(dataset)]]" data-extents="[[dataExtents]]" width="[[width]]" height="[[height]]" margin="[[margin]]" chart-data="{{_returnChartData(dataset)}}" x="{{xCol}}" y="{{yCol}}" domain-changed="{{domainChangedCol}}">
        </px-vis-scale>
        <template is="dom-repeat" items="[[_returnStackData(dataset)]]">
          <px-vis-bar-svg svg="[[svgBar]]" complete-series-config="[[completeSeriesConfig]]" chart-data="[[item]]" series-key="[[item.key]]" x="[[xCol]]" y="[[yCol]]" type="column" domain-changed="[[domainChangedCol]]">
          </px-vis-bar-svg>
        </template>
      </template>

      <template is="dom-if" if="[[_returnType(type)]]">
        <px-vis-svg width="[[width]]" height="[[height]]" margin="[[margin]]" svg="{{svg}}">
        </px-vis-svg>
        <px-vis-scale x-axis-type="linear" y-axis-type="scaleBand" complete-series-config="[[completeSeriesConfig]]" chart-extents="[[_returnBarChartExtents(dataset)]]" data-extents="[[dataExtents]]" width="[[width]]" height="[[height]]" margin="[[margin]]" chart-data="{{_returnChartData(dataset)}}" x="{{xBar}}" y="{{yBar}}" domain-changed="{{domainChangedBar}}">
        </px-vis-scale>
        <template is="dom-repeat" items="[[_returnStackData(dataset)]]">
          <px-vis-bar-svg svg="[[svg]]" complete-series-config="[[completeSeriesConfig]]" chart-data="[[item]]" series-key="[[item.key]]" x="[[xBar]]" y="[[yBar]]" type="bar" domain-changed="[[domainChangedBar]]">
          </px-vis-bar-svg>
        </template>
      </template>

    </div>
`,

  is: "px-vis-bar-svg-demo-component",

  behaviors: [
    PxColorsBehavior.dataVisColors,
    PxColorsBehavior.dataVisColorTheming,
    PxColorsBehavior.getSeriesColors
  ],

  properties:{
    width: {
      type : Number,
      value : 500
    },
    height:{
      type : Number,
      value : 200
    },
    margin:{
      type : Object,
      value : function() {
        return {
          "top": 10,
          "right": 10,
          "bottom": 10,
          "left": 10
        }
      }
    },
    domainChangedCol:{
      type: Number,
      value: 0
    },
    domainChangedBar:{
      type: Number,
      value: 0
    },
    singleChartData:{
      type : Array,
      value : function() {
        return [{
          'x': "A",
          'y': 0.56
        },{
          'x': "B",
          'y': 0.4
        },{
          'x': "C",
          'y': 0.43
        },{
          'x': "D",
          'y': 0.33
        },{
          'x': "E",
          'y': 0.47
        },{
          'x': "F",
          'y': 0.41
        }]
      }
    },
    multiChartData:{
      type : Array,
      value : function() {
        return [{
          'x': "A",
          'y': 0.56,
          'y1': 0.3,
          'y2': 0.1
        },{
          'x': "B",
          'y': 0.4,
          'y1': 0.4,
          'y2': 0.2
        },{
          'x': "C",
          'y': 0.43,
          'y1': 0.3,
          'y2': 0.3
        },{
          'x': "D",
          'y': 0.33,
          'y1': 0.4,
          'y2': 0.5
        },{
          'x': "E",
          'y': 0.47,
          'y1': 0.4,
          'y2': 0.6
        },{
          'x': "F",
          'y': 0.41,
          'y1': 0.2,
          'y2': 0.5
        }]
      }
    },
    completeSeriesConfig: {
      type : Object
    },
    dataExtents:{
      type : Object,
      value:{}
    },
    type: {
      type: String,
      value: "column"
    },
    dataset: {
      type: String,
      value: "single"
    },
    _colorsAreSet: {
      type: Boolean,
      value: false
    }
  },

  observers: [
    '_returnCompleteSeriesConfig(_colorsAreSet, dataset, type)'
  ],

  listeners: {
    "px-data-vis-colors-applied" : '_colorsSet'
  },

  _colorsSet: function() {
    this.set('_colorsAreSet', true);
  },

  _returnType() {
    return this.type === 'bar';
  },

  _returnBarChartExtents: function() {
    var linear = (this.dataset === 'multi') ? [0,1.6] : [0,0.6],
        ordinal = ["A", "B","C","D","E","F"];

    return {
        "x": linear,
        "y": ordinal
      }
  },

  _returnColumnChartExtents: function() {
    var linear = (this.dataset === 'multi') ? [0,1.6] : [0,0.6],
        ordinal = ["A", "B","C","D","E","F"];

    return {
        "x": ordinal,
        "y": linear,
      }
  },

  _returnChartData: function() {
    return (this.dataset === 'multi') ? this.multiChartData : this.singleChartData;
  },

  _returnStackData: function() {
    var cd = this._returnChartData();
    return this._returnStack(cd);
  },

  _returnStack: function(chartData) {
    var stack = Px.d3.stack(),
        keys = (this.dataset === 'multi') ? ["y", "y1", "y2"] : ["y"];

    stack.keys(keys);
    return stack(chartData);
  },

  _returnCompleteSeriesConfig: function() {
    this.debounce("_returnCompleteSeriesConfig", function() {
      if(this._colorsAreSet) {
        if(this.dataset === 'multi') {
          this.set('completeSeriesConfig', {
            'mySeries': {
              "name":"My-Series",
              "type": "bar",
              "x": 'x',
              "y": 'y',
              'color': this._getColor(0)
            },
            'mySeries2': {
              "name":"My-Series2",
              "type": "bar",
              "x": 'x',
              "y": 'y1',
              'color': this._getColor(1)
            },
            'mySeries3': {
              "name":"My-Series3",
              "type": "bar",
              "x": 'x',
              "y": 'y2',
              'color': this._getColor(2)
            },
          });
        } else {
          this.set('completeSeriesConfig', {
            'mySeries': {
              "name":"My-Series",
              "type": "bar",
              "x": 'x',
              "y": 'y',
              'color': this._getColor(0)
            }
          });
        }
      }
    }, 10);
  }
});
