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

    <px-vis-register-item-pie
        item="[[item]]"
        item-index="[[index]]"
        complete-series-config="[[completeSeriesConfig]]"
        chart-data="[[chartData]]"
        type="[[type]]"
        x-axis-type="[[xAxisType]]"
        y-axis-type="[[yAxisType]]"
        use-percentage="[[usePercentage]]">
    </px-vis-register-item-pie>

### Styling
The following custom properties are available for styling:

Custom property | Description
:----------------|:-------------
  `--px-vis-register-series-name` | The color of the data series name
  `--px-vis-register-data-value` | The color of the data series value
  `--px-vis-register-box` | The color of the box around the register when a scrollbar is present

@element px-vis-register-item-pie
@blurb Element providing a series of line items on the register for pie charts
@homepage index.html
@demo demo.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './px-vis-behavior-register.js';
import './px-vis-behavior-colors.js';
import './css/px-vis-register-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style include="px-vis-register-styles"></style>
    <style>
      :host {
        /*  Fix for Safari flex bug:
            https://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/
            Demo of bug: http://jsbin.com/xetinivozo/1/edit?html,js,output
        */
        flex-shrink: 0;
      }
    </style>

      <span id="pieItem" class\$="[[_baseClasses]] register-item--min-width">
        <span class\$="flex [[_itemMutedToStart]]" id="regWithoutMenu">
          <span class="seriesMarker" style\$="background-color:[[_getPieBackColor(item, itemIndex, completeSeriesConfig)]]">&nbsp;</span>
          <span class\$="[[_wrapperClass]]">
            <div class="seriesName flex__item--msfix">
              [[_truncatedName]]&nbsp;
            </div>
            <!-- Display serie data differently depending on x and y axis types -->
            <div class="seriesData flex__item--msfix">
              <span>[[_returnPieVal(item, 'x', usePercentage, completeSeriesConfig)]]</span>
              <template is="dom-if" if="[[_returnPieVal(item, 'x', usePercentage, completeSeriesConfig)]]">[[_getPieUnit(usePercentage)]]</template>
            </div>
          </span>
        </span>
        <template id="menuTemplate" is="dom-if" if="[[_hasDynamicMenu]]">
          <px-vis-dynamic-menu id="menu" class\$="[[_getDynamicMenuClass(type)]]" style="display: none" additional-detail="[[item]]" dynamic-menu-config="[[dynamicMenuConfig]]">
          </px-vis-dynamic-menu>
        </template>
      </span>
`,

  is: 'px-vis-register-item-pie',

  behaviors: [
    PxVisBehavior.dataset,
    PxVisBehavior.formatting,
    PxVisBehavior.completeSeriesConfig,
    PxVisBehavior.truncating,
    PxVisBehavior.axisTypes,
    PxVisBehavior.commonMethods,
    PxVisBehaviorRegister.register,
    PxVisBehaviorRegister.pie,
    PxVisBehaviorRegister.itemShared,
    PxColorsBehavior.getSeriesColors,
    PxVisBehavior.dynamicMenuConfig
  ],

  properties: {
    /**
     * The index passed in from the dom repeat.
     *
     */
    itemIndex: {
      type: Number
    }
  },

  /**
   * Returns the value of the pie slice.
   *
   * @method _returnPieVal
   */
  _returnPieVal: function(item, axis, usePercentage) {
    //pie should have only one config bit.
    var key = Object.keys(this.completeSeriesConfig)[0],
        axisKey = axis === 'x' ? this.completeSeriesConfig[key]['x'] : this.completeSeriesConfig[key]['y'],
        axisKey = usePercentage ? 'percentage' : axisKey;
    if(item && item[axisKey]) {
      return item[axisKey];
    }
    return null;
  },

  /**
   * Returns the units for the pie slice.
   *
   * @method _getPieUnit
   */
  _getPieUnit: function(usePercentage) {
    //pie should have only one config bit.
    var key = Object.keys(this.completeSeriesConfig)[0];
    var unit = this.completeSeriesConfig[key].xAxisUnit;
    return usePercentage ? '%' : unit;
  },

  /**
   * Returns the background color for the pie slice.
   *
   * @method _getPieBackColor
   */
  _getPieBackColor: function(item, index) {
    return item.backgroundColor ? item.backgroundColor : this._getColor(index);
  }
});
