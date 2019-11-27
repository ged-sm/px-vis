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
/* Common imports */
/* Import peer demo pages */
/* Demo DOM module */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import 'px-demo/px-demo-footer.js';
import 'px-demo/px-demo-collection.js';
import './px-vis-catalog.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <!-- Theme includes -->
    <custom-style>
      <style include="px-theme-styles" is="custom-style"></style>
     </custom-style>

    <custom-style>
      <style include="px-vis-demo-catalog-styles" is="custom-style"></style>
     </custom-style>

    <!-- Demo list/view change entrypoint -->
    <px-demo-collection demos="{{demos}}" chosen-demo-name="{{chosenDemoName}}"></px-demo-collection>

    <px-demo-footer></px-demo-footer>
`,

  is: 'local-element-demo',

  properties: {

    /**
     * A list of demo pages to make available. An array of objects, each with
     * the name of a demo, and the name of the custom element loaded holding
     * the demo. (Make sure you create <link> tags to import each demo
     * page in your index.html.)
     *
     * @example
     *
     * [
     *   { name: "px-context-browser", tagName: "px-context-browser-demo" },
     *   { name: "px-context-browser-typeahead", tagName: "px-context-browser-typeahead-demo" }
     * ]
     *
     * @property demos
     * @type {Array}
     */
    demos: {
      type: Array,
      value: function(){
        return [
          {
            name: 'Catalog',
            tagName:'px-vis-catalog'
          },{
            name:'px-vis-area-svg',
            tagName:'px-vis-area-svg-demo'
          },{
            name:'px-vis-axis',
            tagName:'px-vis-axis-demo'
          },{
            name:'px-vis-axis-interaction-space',
            tagName:'px-vis-axis-interaction-space-demo'
          },{
            name:'px-vis-bar-svg',
            tagName:'px-vis-bar-svg-demo'
          },{
            name:'px-vis-brush',
            tagName:'px-vis-brush-demo'
          },{
            name:'px-vis-canvas',
            tagName:'px-vis-canvas-demo'
          },{
            name:'px-vis-chart-navigator',
            tagName:'px-vis-chart-navigator-demo'
          },{
            name:'px-vis-clip-path',
            tagName:'px-vis-clip-path-demo'
          },{
            name:'px-vis-clip-path-complex-area',
            tagName:'px-vis-clip-path-complex-area-demo'
          },{
            name:'px-vis-cursor',
            tagName:'px-vis-cursor-demo'
          },{
            name:'px-vis-cursor-line',
            tagName:'px-vis-cursor-line-demo'
          },{
            name:'px-vis-data-converter',
            tagName:'px-vis-data-converter-demo'
          },{
            name:'px-vis-dynamic-menu',
            tagName:'px-vis-dynamic-menu-demo'
          },{
            name:'px-vis-event',
            tagName:'px-vis-event-demo'
          },{
            name:'px-vis-gridlines',
            tagName:'px-vis-gridlines-demo'
          },{
            name:'px-vis-highlight-line-canvas',
            tagName:'px-vis-highlight-line-canvas-demo'
          },{
            name:'px-vis-highlight-line',
            tagName:'px-vis-highlight-line-demo'
          },{
            name:'px-vis-highlight-point-canvas',
            tagName:'px-vis-highlight-point-canvas-demo'
          },{
            name:'px-vis-highlight-point',
            tagName:'px-vis-highlight-point-demo'
          },{
            name:'px-vis-interactive-axis',
            tagName:'px-vis-interactive-axis-demo'
          },{
            name:'px-vis-interaction-space',
            tagName:'px-vis-interaction-space-demo'
          },{
            name:'px-vis-line-canvas',
            tagName:'px-vis-line-canvas-demo'
          },{
            name:'px-vis-line-svg',
            tagName:'px-vis-line-svg-demo'
          },{
            name:'px-vis-multi-axis',
            tagName:'px-vis-multi-axis-demo'
          },{
            name:'px-vis-pie',
            tagName:'px-vis-pie-demo'
          },{
            name:'px-vis-radar-grid',
            tagName:'px-vis-radar-grid-demo'
          },{
            name:'px-vis-radial-gridlines',
            tagName:'px-vis-radial-gridlines-demo'
          },{
            name:'px-vis-register',
            tagName:'px-vis-register-demo'
          },{
            name:'px-vis-scale',
            tagName:'px-vis-scale-demo'
          },{
            name:'px-vis-scatter',
            tagName:'px-vis-scatter-demo'
          },{
            name:'px-vis-scatter-canvas',
            tagName:'px-vis-scatter-canvas-demo'
          },{
            name:'px-vis-striping',
            tagName:'px-vis-striping-demo'
          },{
            name:'px-vis-svg',
            tagName:'px-vis-svg-demo'
          },{
            name:'px-vis-svg-canvas',
            tagName:'px-vis-svg-canvas-demo'
          },{
            name:'px-vis-threshold',
            tagName:'px-vis-threshold-demo'
          },{
            name:'px-vis-toolbar',
            tagName:'px-vis-toolbar-demo'
          },{
            name:'px-vis-tooltip',
            tagName:'px-vis-tooltip-demo'}
        ];
      }
    },

    /**
    * The name of the active demo. Can be set to update the currently visible
    * demo, or listened to for notifications when the user changes the
    * active demo.
    *
    * @property chosenDemoName
    * @type {String}
    */
   chosenDemoName: {
     type: String,
     observer: '_demoChosen'
   }
 },

  listeners: {
    'px-demo-active-should-change' : '_handleActiveChange'
  },

  created: function() {
   this._loadedDemos = ['catalog'];
  },

  _demoChosen: function(newDemo) {
   if (typeof newDemo === 'string' && this._loadedDemos.indexOf(newDemo) === -1) {
     var pageName = null;
     for (var i=0; i<this.demos.length; i++) {
       if (this.demos[i].name === newDemo) {
         pageName = this.demos[i].tagName + '.html';
       }
     }
     if (!pageName) return;

     this._loadedDemos.push(newDemo);
     var url = this.resolveUrl(pageName);
     this.importHref(url, null, function(){
       console.log('Could not load demo ' + newDemo);
     }, true);
   }
  },

  _handleActiveChange: function(evt) {
    this.set('chosenDemoName', evt.detail.name);
  }
});
