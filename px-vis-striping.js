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

    <px-vis-scale
      x-axis-type="time"
      y-axis-type="linear"
      complete-series-config="[[seriesConfig]]"
      data-extents="[[dataExtents]]"
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      chart-data="{{chartData}}"
      x="{{x}}"
      y="{{y}}"
      domain-changed="{{domainChanged}}"
      selected-domain="[[selectedDomain]]">
    </px-vis-scale>
    <px-vis-svg
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      svg="{{svg}}">
    </px-vis-svg>
    <px-vis-striping
      svg="[[svg]]"
      series-id="mySeries"
      complete-series-config="[[seriesConfig]]"
      chart-data="[[chartData]]"
      width="[[width]]"
      height="[[height]]"
      margin="[[margin]]"
      x="[[x]]"
      y="[[y]]"
      domain-changed="[[domainChanged]]">
    </px-vis-striping>

@element px-vis-striping
@blurb Element which draws a striping series onto the chart
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
`,

  is: 'px-vis-striping',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehaviorD3.canvasContext,
    PxVisBehaviorD3.axes,
    PxVisBehavior.commonMethods,
    PxVisBehaviorD3.domainUpdate,
    PxVisBehavior.dynamicConfigProperties,
    PxVisBehavior.serieToRedrawOnTop,
    PxVisBehavior.stripProperties,
    PxVisBehaviorD3.clipPathBoolean
  ],

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {

    /**
     * Debounce time to use for drawing.
     */
    drawDebounceTime: {
      type: Number,
      value: 10
    }
  },

  observers: [
    '_requestCanvasCreation(stripeConfig)',
    '_redraw(canvasContext, domainChanged, stripeData.*, stripeConfig.*)',
    '_drawOnTop(serieToRedrawOnTop)'
   ],

  attached: function() {

   //if we've been detached and reattached make sure we redraw (canvas clears on detached)
   if(this._isDirty) {
     this._redraw();
     this._isDirty = false;
   }
 },

  detached: function() {

    this._isDirty = true;
  },

  _redraw: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    if(!this.preventInitialDrawing) {
      this.drawCanvas(true);
    }
  },

  /**
   * Draws or updates the line element.
   * Called from an observer that watches for data and the necessary d3 objects.
   *
   * @method drawElement
   */
  drawCanvas: function(allowCanvasClearing) {
    if(this.drawDebounceTime > 0) {
      this.debounce('drawCanvasStriping',function() {
        this._drawCanvasDebounced(allowCanvasClearing);
      }.bind(this), this.drawDebounceTime);
    } else {
      this._drawCanvasDebounced(allowCanvasClearing);
    }
  },

  _drawCanvasDebounced: function(allowCanvasClearing) {
    if(!this.x ||
      !this.domainChanged ||
      this._isObjEmpty(this.stripeData)) {
        return;
      }

    this.canvasContext.pxClearCanvas();
    this._initiateRendering();
  },

  _initiateRendering: function() {
    var keys = Object.keys(this.stripeConfig),
        dash;

    if(this.clipPath) {
      this.drawClipPath();
    }

    for(var i = 0; i < keys.length; i++) {
      this.canvasContext.fillStyle = this.stripeConfig[keys[i]]['fillColor'];
      this.canvasContext.strokeStyle = this.stripeConfig[keys[i]]['fillColor'];
      dash = this.stripeConfig[keys[i]]['dash'] ? this.stripeConfig[keys[i]]['dash'] : [5,2];
      this.canvasContext.setLineDash(dash);

      this.canvasContext.globalAlpha = this.stripeConfig[keys[i]]['fillOpacity'];

      if(this.stripeData[keys[i]] && this.stripeData[keys[i]].length) {
        this._renderStripes(this.stripeData[keys[i]]);
      }
    }
  },

  _renderStripes: function(data) {
    var x, w;
    for(var i = 0; i < data.length; i++) {
      x = this.x(data[i][0]),
      w = data[i][1] || data[i][1] === 0 ? this.x(data[i][1]) - x : 0;

      if(w === 0) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x,0);
        this.canvasContext.lineTo(x, this.height);
        this.canvasContext.stroke();
      } else {
        this.canvasContext.fillRect(x, 0, w, this.height);
      }
    }
  },

  /**
   * Draws a clip path for the canvas.
   *
   */
  drawClipPath: function() {
    this.canvasContext.beginPath();

    var w = Math.max(this.width - this.margin.left - this.margin.right, 0),
        h = Math.max(this.height - this.margin.top - this.margin.bottom, 0);

    this.canvasContext.rect(0, 0, w, h);

    this.canvasContext.clip();
  },

  /**
   * Redraw this series on top if needed.
   */
  _drawOnTop: function(serieToRedraw) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    if(serieToRedraw === this.seriesId) {
      this.drawCanvas(false);
    }
  },

  _requestCanvasCreation: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    this.set('canvasLayersConfig.striping', {});
  }
});
