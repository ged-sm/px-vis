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

@element px-vis-svg
@blurb Element which creates an SVG element and sets up d3
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
import './css/px-vis-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <style include="px-vis-styles"></style>

      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="px-vis-svg" id="chartSVG" overflow="hidden">
      </svg>
`,

  is: 'px-vis-svg',

  /****** EVENTS ******/
  /**
   * Fired once the d3 svg drawing element has been configured.
   *
   * Uses the px-vis-behavior-chart behavior, for listening and setting properties locally or globally.
   * Detail includes:
   *
   * ```
   * { 'data': d3.select('g') }
   * ```
   *
   * @event px-vis-svg-updated
   */
  /**
  * Fired once the svg is configured. Passes the svg element inside px-vis-svg.
  *
  * Uses the px-vis-behavior-chart behavior, for listening and setting property, locally or globally.
  * ```
  * {'data': this.$.chartSVG}
  * ```
  * @event px-vis-svg-element-updated
  */

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehavior.sizing,
    PxVisBehavior.commonMethods,
    PxVisBehaviorD3.svg
  ],

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
    //redefine svg prop so it can notify
    /**
    * Holder for the d3 instantiated svg container.
    * Must be set in ready and passed to all components so they know where to draw.
    *
    * FUTURE: when Polymer supports SVG, this only needs to be set on the SVG element.
    *
    * @property svg
    * @type Object
    */
    svg: {
      type: Object,
      notify: true
    }
  },

  observers: [
    '_setSVG(width,height,margin,offset.*)'
  ],

  /**
  * When attached, re-fire set properties for precipitation pattern,
  * as well as the svg element that's inside px-svg.
  *
  * @method attached
  */
  attached: function(){
    if(this._doesObjHaveValues(this.svg)){
      this.fire('px-vis-svg-updated',{ 'data': this.svg, 'dataVar': 'svg', 'method': 'set' });
      this.fire('px-vis-svg-element-updated', {'data': this.$.chartSVG, 'dataVar': 'pxSvgElem', 'method': 'set'});
    }
  },

  /**
   * Configures the SVG and d3 drawing element.
   *
   * @method _setSVG
   */
  _setSVG: function(){
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(this.width && this.height && this._doesObjHaveValues(this.margin)){
      var svg = Px.d3.select(this.$$("svg"))
        .attr('width',this.width)
        .attr('height',this.height),
      newSvg;

      newSvg = (this._isVarUndefined(this.svg)) ? svg.append('g') : this.svg;
      newSvg.attr('width',this.width)
        .attr('height',this.height)
        .attr('transform', 'translate(' + (Number(this.margin.left) + Number(this.offset[0])) + ',' + (Number(this.margin.top) + Number(this.offset[1])) + ')');

      this.set('svg',newSvg);
      this.fire('px-vis-svg-updated',{ 'data': this.svg, 'dataVar': 'svg', 'method': 'set' });
      this.set('pxSvgElem', this.$.chartSVG);
      this.fire('px-vis-svg-element-updated', {'data': this.$.chartSVG, 'dataVar': 'pxSvgElem', 'method': 'set'});
    }
  }
});
