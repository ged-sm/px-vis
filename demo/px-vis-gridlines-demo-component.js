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
import '../px-vis-gridlines.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <div class="outline">
      <px-vis-svg width="[[width]]" height="[[height]]" margin="[[margin]]" svg="{{svg}}">
      </px-vis-svg>
      <px-vis-scale x-axis-type="time" y-axis-type="linear" complete-series-config="[[completeSeriesConfig]]" data-extents="[[dataExtents]]" width="[[width]]" height="[[height]]" margin="[[margin]]" chart-data="{{chartData}}" x="{{x}}" y="{{y}}" domain-changed="{{domainChanged}}">
      </px-vis-scale>
      <px-vis-gridlines svg="[[svg]]" axis="[[_returnXOrY(orientation)]]" margin="[[margin]]" length="[[width]]" orientation="[[orientation]]" domain-changed="[[domainChanged]]">
      </px-vis-gridlines>
    </div>
`,

  is: "px-vis-gridlines-demo-component",

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
    chartData: {
      type : Array,
      value : function() {
        return [{
          'x': 1397102460000,
          'y': 0.56
        },{
          'x': 1397139660000,
          'y': 0.4
        },{
          'x': 1397177400000,
          'y': 0.43
        },{
          'x': 1397228040000,
          'y': 0.33
        },{
          'x': 1397248260000,
          'y': 0.47
        },{
          'x': 1397291280000,
          'y': 0.41
        },{
          'x': 1397318100000,
          'y': 0.26
        },{
          'x': 1397342100000,
          'y': 0.42
        },{
          'x': 1397390820000,
          'y': 0.27
        },{
          'x': 1397408100000,
          'y': 0.38
        },{
          'x': 1397458800000,
          'y': 0.36
        },{
          'x': 1397522940000,
          'y': 0.32
        }]
      }
    },
    completeSeriesConfig:{
      type : Object,
      value: function() {
        return {
          'mySeries': {
            "name":"My-Series",
            "type": "line",
            "x": 'x',
            "y": 'y',
            'color': "rgb(93,165,218)"
          }
        }
      }
    },
    dataExtents:{
      type : Object,
      value: function() {
        return {
          "x": [Infinity,-Infinity],
          "y": [0,-Infinity]
        }
      }
    },
    orientation: {
      type: String
      },
    xOrY : {
      type: Object,
      computed: "_returnXOrY(orientation, x, y)"
    }
  },

  _returnXOrY: function() {
    return (this.orientation === "bottom") ? this.x : this.y;
  },

  attached: function() {
    setTimeout(function() {
      this.set('orientation', 'left');
      this.set('orientation', 'bottom');
    }.bind(this), 100);
  }
});
