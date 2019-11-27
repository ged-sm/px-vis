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

    <px-vis-toolbar
      config="[[config]]"
      horizontal-alignment="left">
    </px-vis-toolbar>

Example of a custom `config` object:

    {
      "customzoom": {
        // label used for the tooltip of this button:
        "tooltipLabel": "zoom",
        // px-icon-set icon used for this button:
        "icon": "px-vis:zoom",
        // this function will be run when clicking the button
        // `this` will be bound to the chart unless `onClickContext` is defined
        "onClick": function() { console.log("clicked")},
        // this function will be run when the buttons is selected: either on click
        //or programmatically when `selected` is true
        // `this` will be bound to the chart unless `onClickContext` is defined
        "onSelect": "function() {this.set(\"_internalShowTooltip\", false);}",
        // context to be used in `onClick` `onSelect` and `onDeselect`. Can be 'toolbar' or any object. If
        //not specified will use the chart context
        "onClickContext': "toolbar",
        // if a button is part of a button group then it becomes selected when clicked
        // and all other buttons in the same group become deselected:
        "buttonGroup": 1,
        // force this button to be selected at start
        // (including applying its actionConfig and subConfig):
        "selected": true,
        // this config will be propagated to px-vis-interaction-space:
        "actionConfig": {
          // key = an event, value = either a predefined action from `actionMapping` in interaction-space
          // or a function, where `this` will be bound to the chart
          // or null, which ensures previously registered actions will be removed
          "mousedown": "startZooming",
          "mouseup": "stopZooming",
          "mousemove": "function() { console.log(\"Mouse moved on the chart!\");}",
          "mouseout": "null"
        },
        // subConfig allows you to define a second row of buttons
        // which will be displayed after clicking the main button:
        "subConfig": {
          "x": {
            // you can use a title instead of/in addition to the icon:
            "title": "X",
            "tooltipLabel": "Zoom on X axis only",
            // an event will be fired when clicking on this button:
            "eventName": "my-custom-click",
            "selectable": true,
            "selected": true,
            "onClick": "function() { this.set(\"selectionType\", \"xAxis\");}"
          },
          "y": {
            "title": "Y",
            "tooltipLabel": "Zoom on Y axis only",
            "selectable": true,
            "onClick": "function() { this.set(\"selectionType\", \"yAxis\");}"
          },
          "xy": {
            "title": "XY",
            "tooltipLabel": "Zoom on X and Y axis",
            "selectable": true,
            "onClick": "function() { this.set(\"selectionType\", \"xy\");}"
          },
          "zoomIn": {
            "icon": "fa-plus",
            "tooltipLabel": "zoom in",
            // these events are vis specific events and
            // are automatically caught by the chart and handled:
            "eventName": "px-vis-toolbar-zoom-in"
          },
          "zoomOut": {
            "icon": "fa-minus",
            "tooltipLabel": "zoom out",
            "eventName": "px-vis-toolbar-zoom-out"
          },
          "undoZoom": {
            "icon": "fa-undo",
            "tooltipLabel": "undo zoom",
            "eventName": "px-vis-toolbar-undo-zoom"
          },
          "resetZoom": {
            "icon": "px-vis:full-screen",
            "tooltipLabel": "reset zoom to initial value",
            "eventName": "px-vis-toolbar-reset-zoom"
          }
        }
      },
      //default "out of the box" panning button:
      "pan": true,
      //default "out of the box" tooltip button:
      "tooltip": true

@element px-vis-toolbar
@blurb Element providing a menu dynamically built depending on options
@homepage index.html
@demo demo.html

### Styling
The following custom properties are available for styling:

Custom property | Description
:----------------|:-------------
  `--px-vis-toolbar-icon-color` | color for the icon
  `--px-vis-toolbar-selected-color` | the color for a selected item
  `--px-vis-toolbar-hover-color` | color for a hovered item
  `--px-vis-toolbar-active-color` | color for an active item
  `--px-vis-toolbar-subrow-background-color` | background color of the sub menu
  `--px-vis-toolbar-submenu-z-index` | z index of the sub menu
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import 'px-tooltip/px-tooltip.js';
import 'px-icon-set/px-icon-set.js';
import 'px-icon-set/px-icon.js';
import './px-vis-behavior-common.js';
import './px-vis-behavior-d3.js';
import './css/px-vis-toolbar-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
Polymer({
  _template: html`
    <style include="px-vis-toolbar-styles"></style>

      <!--main row-->
      <span id="mainRow" class\$="flex [[_getRowDirection(horizontalAlignment)]]">
        <template id="mainRepeat" is="dom-repeat" items="{{_internalConfig}}" strip-whitespace="">
          <span class\$="u-p- flex__item main-item [[_getSelectedClass(item.selected)]] [[_getDisabledClass(item.disabled)]] [[_hide(item.hidden)]]" style\$="{{item.customButtonStyle}}" on-tap="_clickItem" on-mouseenter="_onItemHover" on-mouseleave="_onItemLeave" value="{{index}}" data-conf-type="main">
              <px-icon class\$="icon [[_show(item.icon)]]" icon="[[item.icon]]" value="{{index}}"></px-icon>{{item.title}}
          </span>
        </template>
      </span>
      <!--sub row-->
      <template id="templateSubRow" is="dom-if" if="[[_isWithinChart(withinChart)]]">
        <span id="subRow" class\$="flex subrow--container [[_getRowDirection(horizontalAlignment)]] [[_getSubRowClass(subToolbarAlignment)]]">
          <template id="subRepeat" is="dom-repeat" items="{{currentSubConfig}}" strip-whitespace="">
            <span class\$="u-p- flex__item main-item subrow--item [[_getSelectedClass(item.selected)]] [[_getDisabledClass(item.disabled)]] [[_hide(item.hidden)]]" on-tap="_clickSubItem" on-mouseenter="_onItemHover" on-mouseleave="_onItemLeave" value="{{index}}" data-conf-type="sub">
                <px-icon class\$="icon [[_show(item.icon)]]" icon="[[item.icon]]" value="{{index}}"></px-icon>
                {{item.title}}
            </span>
          </template>
        </span>
      </template>
`,

  is: 'px-vis-toolbar',

  behaviors: [
    PxVisBehavior.observerCheck,
    PxVisBehavior.commonMethods,
    PxVisBehavior.actionConfig,
    PxVisBehavior.showHideClasses
  ],

  /**
   * Fired after the secondary toolbar has opened or closed. Evt.detail
   * includes an `open` property reflecting whether the secondary
   * toolbar is now open or closed.
   * @event px-vis-toolbar-secondary-toggled
   */

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
    /**
     * Whether the toolbar is within a chart. Drives where the secondary toolbar is displayed.
     */
    withinChart: {
      type: Boolean,
      value: false
    },
    /**
     * The chart margins. Used to position the secondary toolbar if withinChart is true.
     */
    chartMargin: {
      type: Object
    },

    /**
     * Current sub-configuration. Can be the result of the config or passed in from another toolbar.
     */
    currentSubConfig: {
      type: Object,
      notify: true
    },
    /**
     * Current config used to build the toolbar.
     */
    _internalConfig: {
      type: Object
    },
    /**
     * Horizontal alignment of the toolbar. Should be 'left' or 'right'.
     */
    horizontalAlignment: {
      type: String,
      value: 'right'
    },
    /**
     * Alignment of the sub toolbar. Accepted values:
     * - horizontal
     * - vertical
     * - above (when in a chart, the sub toolbar will be displayed
     * above the chart rather than on top of it)
     */
    subToolbarAlignment: {
      type: String,
      value: 'horizontal'
    },
    /**
     * Configuration object for the toolbar. This object drives what buttons are available on
     * the toolbar and what they do. Three actions can be used out of the box by passing them
     * as keys in this config: 'zoom', 'pan' and 'tooltip'.
     * Any other kind of actions and buttons can be defined through this object. See above for example.
     *
     */
    config: {
      type: Object
    },
    /**
    * Configuration used to define what actions happen on events. Each key represents an event,
    * each value can be:
    * - a predefined action found as a key in px-vis-interaction-space `actionMapping`
    * - a function, where `this` will be bound to the chart and the function's argument will be the mouse position on the chart
    */
    actionConfig: {
      type: Object,
      notify: true,
      value: function() {
        return {
          'mousedown': 'startZooming',
          'mouseup': 'stopZooming',
          'mouseout': 'resetTooltip',
          'mousemove': 'calcTooltipData'
        };
      }
    },
    _tooltipRequested: {
      type: Boolean,
      value: false
    },
    _tooltipTimer: Number
  },

  observers: [
    '_configChanged(config.*, horizontalAlignment)',
    '_positionSubRow(withinChart, chartMargin, horizontalAlignment)',
    '_positionMainRow(chartMargin, horizontalAlignment)'
  ],

  /**
   * Predefined configs available for use and/or extensions:
   * - annotations
   * - axisMuteSeries
   * - axisDrag
   * - crosshairLasso
   * - crosshair
   * - crosshairWithOptions
   * - crosshairFrozen
   * - tooltip
   * - tooltipFrozen
   * - tooltipWithSearchTypes
   * - tooltipWithSearchTypesAndRadius
   * - tooltipWithFullOptions
   * - pan
   * - bareZoom
   * - zoom
   * - advancedZoom
   * - stripe
   */
  _defaultActionsMapping: {
    annotations: {
      tooltipLabel: 'Annotations',
      icon: 'px-vis:comment',
      cursorIcon: 'px-vis:comment',
      buttonGroup: 1,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
        this.set('showStrongIcon', true);
      },
      onDeselect: function() { this.set('showStrongIcon', false);},
      actionConfig: {
        mouseout: null,
        mousemove: null,
        mousedown: null,
        click: function(evt) {
          this.fire('px-vis-event-request', {
            eventName: 'px-vis-annotation-creation',
            data: {
              mouseCoords: evt.mouseCoords,
              clickTarget: evt.target,
              chart: this
            }
          });
        },
        mouseup: null
      },
      subConfig: {
        hideAnnotations: {
          tooltipLabel: 'Hide Annotations',
          icon: 'px-vis:hide',
          buttonGroup: 1,
          toggle: true,
          onClick: function(button) {
            this.$$('px-vis-annotations').set('hide', button.selected);
          }
        }
      }
    },
    axisMuteSeries: {
      tooltipLabel: 'Mute Series on Axis',
      icon: 'px-vis:brush',
      cursorIcon: 'px-vis:brush',
      buttonGroup: 1,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      actionConfig: {
        mouseout: null,
        mousemove: null,
        click: null,
        mousedown: 'callAxisMute',
        mouseup: 'callAxisMute'
      }
    },
    axisDrag: {
      tooltipLabel: 'Axis Drag',
      icon: 'px-vis:move-axis',
      cursorIcon: 'px-vis:move-axis',
      buttonGroup: 1,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      actionConfig: {
        mouseout: null,
        mousemove: null,
        click: null,
        mousedown: 'callAxisDrag',
        mouseup: 'callAxisDrag'
      }
    },
    crosshairLasso: {
      tooltipLabel: 'Lasso selection',
      icon: 'px-vis:lasso',
      buttonGroup: 1,
      selectable: true,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
        this.set('interactionSpaceConfig.searchType', 'lasso');
      },
      actionConfig: {
        mouseout: null,
        mousemove: null,
        click: null,
        mousedown: 'startLasso',
        mouseup: 'stopLasso'
      },
      subConfig: {
        clearCrosshair: {
          tooltipLabel: 'Clear lasso data',
          icon: 'px-nav:close',
          onClick: function() {
            this.set('crosshairData', { 'rawData': [], 'timeStamps': []});
            this.set('interactionSpaceConfig.resetLassoData', !this.interactionSpaceConfig.resetLassoData);
            this.set('resetLassoData', !this.resetLassoData);
          }
        }
      }
    },
    crosshairLassoTimeseries: {
      tooltipLabel: 'Lasso selection',
      icon: 'px-vis:lasso',
      buttonGroup: 1,
      selectable: true,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
        this.set('interactionSpaceConfig.searchType', 'lasso');
      },
      actionConfig: {
        mouseout: null,
        mousemove: null,
        click: null,
        mousedown: 'startLasso',
        mouseup: 'stopLasso'
      },
      subConfig: {
        xRect: {
          tooltipLabel: 'Lasso on X',
          icon: 'px-vis:x-axis',
          onClick: function() {
            this.set('interactionSpaceConfig.lassoType', 'xRect');
          }
        },
        yRect: {
          tooltipLabel: 'Lasso on Y',
          icon: 'px-vis:y-axis',
          onClick: function() {
            this.set('interactionSpaceConfig.lassoType', 'yRect');
          }
        },
        freeform: {
          tooltipLabel: 'Freeform Lasso',
          icon: 'px-vis:xy-axis',
          onClick: function() {
            this.set('interactionSpaceConfig.lassoType', 'freeform');
          }
        },
        clearCrosshair: {
          tooltipLabel: 'Clear lasso data',
          icon: 'px-nav:close',
          onClick: function() {
            this.set('crosshairData', { 'rawData': [], 'timeStamps': []});
            this.set('interactionSpaceConfig.resetLassoData', !this.interactionSpaceConfig.resetLassoData);
            this.set('resetLassoData', !this.resetLassoData);
          }
        }
      }
    },
    crosshair: {
      tooltipLabel: 'Crosshair',
      icon: 'px-vis:crosshair',
      cursorIcon: 'px-vis:crosshair',
      buttonGroup: 1,
      onSelect: function() {
        this.set('_internalShowTooltip', true);
      },
      actionConfig: {
        mouseout: 'resetTooltipAndCrosshairData',
        mousemove: 'calcCrosshairData',
        click: function() {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('crosshairWithOptions', 'crosshairFrozen', true);
            this.fire('px-freeze-crosshair');
          }
        },
        mousedown: null,
        mouseup: null
      }
    },
    crosshairWithOptions: {
      tooltipLabel: 'Crosshair',
      icon: 'px-vis:crosshair',
      buttonGroup: 1,
      onSelect: function() {
        this.set('interactionSpaceConfig.cursorType', 'circle');
      },
      onDeselect: function() {
        this.set('interactionSpaceConfig.cursorType', 'none');
      },
      actionConfig: {
        mouseout: 'resetTooltipAndCrosshairData',
        mousemove: 'calcCrosshairData',
        click: function() {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('crosshairWithOptions', 'crosshairFrozen', true);
            this.fire('px-freeze-crosshair');
          }
        },
        mousedown: null,
        mouseup: null
      },
      subConfig: {
        closestPoint: {
          icon: 'px-vis:closest-point',
          cursorIcon: 'px-vis:closest-point',
          tooltipLabel: 'Closest Timestamp and associated points',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'closestPoint');
          },
          actionConfig: {
            mouseout: 'resetTooltipAndCrosshairData',
            mousemove: 'calcTooltipAndCrosshairData',
            click: null,
            mousedown: null,
            mouseup: null
          },
        },
        pointPerSeries: {
          icon: 'px-vis:closest-point-series',
          cursorIcon: 'px-vis:closest-point-series',
          tooltipLabel: 'Point Per Series',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'pointPerSeries');
          },
          actionConfig: {
            mouseout: 'resetTooltipAndCrosshairData',
            mousemove: 'calcTooltipAndCrosshairData',
            click: null,
            mousedown: null,
            mouseup: null
          },
        },
        allInArea: {
          icon: 'px-vis:all-points-in-area',
          cursorIcon: 'px-vis:all-points-in-area',
          tooltipLabel: 'All in area',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'allInArea');
          },
          actionConfig: {
            mouseout: 'resetTooltipAndCrosshairData',
            mousemove: 'calcTooltipAndCrosshairData',
            click: null,
            mousedown: null,
            mouseup: null
          },
        },
        radiusUp: {
          icon: 'px-vis:expand-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', sr + 5);
          }
        },
        radiusDown: {
          icon: 'px-vis:shrink-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', Math.max(sr - 5, 0));
          }
        }
      }
    },
    crosshairFrozen: {
      tooltipLabel: 'Crosshair Frozen',
      hidden: true,
      icon: 'px-vis:pin',
      onClick: function(e) {
        e.toolbar.switchConfigItems('crosshairFrozen', e.toolbar.config.crosshairFrozen.originalTooltipConf, true);
        this.fire('px-unfreeze-crosshair');
      }
    },
    tooltip: {
      tooltipLabel: 'Tooltip',
      icon: 'px-vis:show-tooltip',
      cursorIcon: 'px-vis:show-tooltip',
      buttonGroup: 1,
      selected: true,
      onSelect: function() {
        this.set('_internalShowTooltip', true);
      },
      actionConfig: {
        mouseout: 'resetTooltip',
        mousemove: 'calcTooltipData',
        click: function(e) {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('tooltip', 'tooltipFrozen', true);
          }
        },
        mousedown: null,
        mouseup: null
      }
    },
    tooltipWithSearchTypes: {
      tooltipLabel: 'Tooltip',
      icon: 'px-vis:show-tooltip',
      cursorIcon: 'px-vis:show-tooltip',
      buttonGroup: 1,
      selected: true,
      onSelect: function() {
        this.set('_internalShowTooltip', true);
      },
      actionConfig: {
        mouseout: 'resetTooltip',
        mousemove: 'calcTooltipData',
        click: function(e) {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('tooltipWithSearchTypes', 'tooltipFrozen', true);
          }
        },
        mousedown: null,
        mouseup: null
      },
      subConfig: {
        timestamps: {
          title: 'Timestamps',
          tooltipLabel: 'Returns all points with the same timestamp as the point closest to your cursor',
          buttonGroup: 2,
          selectable: true,
          selected: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'timestamps');
          },
        },
        points: {
          title: 'Points',
          tooltipLabel: 'Returns only the closest point to your cursor',
          buttonGroup: 2,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'point');
          },
        }
      },
    },
    tooltipWithSearchTypesAndRadius: {
      tooltipLabel: 'Tooltip',
      icon: 'px-vis:show-tooltip',
      cursorIcon: 'px-vis:show-tooltip',
      buttonGroup: 1,
      selected: true,
      onSelect: function() {
        this.set('_internalShowTooltip', true);
      },
      actionConfig: {
        mouseout: 'resetTooltip',
        mousemove: 'calcTooltipData',
        click: function(e) {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('tooltipWithSearchTypesAndRadius', 'tooltipFrozen', true);
          }
        },
        mousedown: null,
        mouseup: null
      },
      subConfig: {
        timestamps: {
          title: 'Timestamps',
          tooltipLabel: 'Returns all points with the same timestamp as the point closest to your cursor',
          buttonGroup: 2,
          selectable: true,
          selected: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'timestamps');
          },
        },
        points: {
          title: 'Points',
          tooltipLabel: 'Returns only the closest point(s) to your cursor',
          buttonGroup: 2,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'point');
          },
        },
        radiusUp: {
          icon: 'px-vis:expand-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', sr + 5);
          }
        },
        radiusDown: {
          icon: 'px-vis:shrink-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', Math.max(sr - 5, 0));
          }
        }
      }
    },
    tooltipWithFullOptions: {
      tooltipLabel: 'Tooltip',
      icon: 'px-vis:show-tooltip',
      cursorIcon: 'px-vis:show-tooltip',
      buttonGroup: 1,
      selected: true,
      onSelect: function() {
        this.set('_internalShowTooltip', true);
      },
      actionConfig: {
        mouseout: 'resetTooltip',
        mousemove: 'calcTooltipData',
        click: function(e) {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('tooltipWithFullOptions', 'tooltipFrozen', true);
          }
        },
        mousedown: null,
        mouseup: null
      },
      subConfig: {
        timestamps: {
          title: 'Timestamps',
          tooltipLabel: 'Returns all points with the same timestamp as the point closest to your cursor',
          buttonGroup: 2,
          selectable: true,
          selected: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'timestamps');
          },
        },
        points: {
          title: 'Points',
          tooltipLabel: 'Returns only the closest point to your cursor',
          buttonGroup: 2,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchFor', 'point');
          },
        },
        closestPoint: {
          icon: 'px-vis:closest-point',
          cursorIcon: 'px-vis:closest-point',
          tooltipLabel: 'Closest point or timestamp',
          buttonGroup: 1,
          selectable: true,
          selected: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'closestPoint');
          },
          actionConfig: {
            mouseout: 'resetTooltip',
            mousemove: 'calcTooltipData',
            mousedown: null,
            mouseup: null
          },
        },
        pointPerSeries: {
          icon: 'px-vis:closest-point-series',
          cursorIcon: 'px-vis:closest-point-series',
          tooltipLabel: 'Point Per Series',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'pointPerSeries');
          },
          actionConfig: {
            mouseout: 'resetTooltip',
            mousemove: 'calcTooltipData',
            mousedown: null,
            mouseup: null
          },
        },
        allInArea: {
          icon: 'px-vis:all-points-in-area',
          cursorIcon: 'px-vis:all-points-in-area',
          tooltipLabel: 'All in area',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() {
            this.set('interactionSpaceConfig.searchType', 'allInArea');
          },
          actionConfig: {
            mouseout: 'resetTooltip',
            mousemove: 'calcTooltipData',
            mousedown: null,
            mouseup: null
          },
        },
        radiusUp: {
          icon: 'px-vis:expand-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', sr + 5);
          }
        },
        radiusDown: {
          icon: 'px-vis:shrink-radius',
          tooltipLabel: 'Radius',
          onSelect: function() {
            var sr = this.interactionSpaceConfig.searchRadius ? this.interactionSpaceConfig.searchRadius : 0;
            this.set('interactionSpaceConfig.searchRadius', Math.max(sr - 5, 0));
          }
        }
      }
    },
    tooltipFrozen: {
      tooltipLabel: 'Frozen Tooltip',
      icon: 'px-utl:locked',
      cursorIcon: 'px-utl:locked',
      hidden: true,
      onClick: function(e) {
        e.toolbar.switchConfigItems('tooltipFrozen', e.toolbar.config.tooltipFrozen.originalTooltipConf, true);
      },
      buttonGroup: 1,
      selected: true,
      actionConfig: {
        mouseout: null,
        mousemove: null,
        click: function(e) {
          var toolbar = this.getToolbar();
          if(toolbar) {
            toolbar.switchConfigItems('tooltipFrozen', toolbar.config.tooltipFrozen.originalTooltipConf, true);
          }
        }
      }
    },
    pan: {
      tooltipLabel: 'Pan',
      icon: 'px-vis:pan',
      cursorIcon: 'px-vis:pan',
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      buttonGroup: 1,
      actionConfig: {
        mousedown: 'startPanning',
        mouseup: 'stopPanning',
        mouseout: null,
        mousemove: null,
        click: null
      },
      subConfig: {
        resetZoom: {
          icon: 'px-vis:full-screen',
          tooltipLabel: 'Reset',
          eventName: 'px-vis-toolbar-reset-zoom'
        }
      }
    },
    bareZoom: {
      tooltipLabel: 'Zoom on axis',
      icon: 'px-vis:zoom-toolbar',
      cursorIcon: 'px-vis:zoom-toolbar',
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      buttonGroup: 1,
      actionConfig: {
        mousedown: 'startZooming',
        mouseup: 'stopZooming',
        mouseout: null,
        mousemove: null,
        click: null
      },
      subConfig: {
        undoZoom: {
          icon: 'px-vis:zoom-out-one-level',
          tooltipLabel: 'Undo zoom',
          eventName: 'px-vis-toolbar-undo-zoom'
        },
        resetZoom: {
          icon: 'px-vis:full-screen',
          tooltipLabel: 'Reset',
          eventName: 'px-vis-toolbar-reset-zoom'
        }
      }
    },
    zoom: {
      tooltipLabel: 'Zoom',
      icon: 'px-vis:zoom-toolbar',
      cursorIcon: 'px-vis:zoom-toolbar',
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      buttonGroup: 1,
      actionConfig: {
        mousedown: 'startZooming',
        mouseup: 'stopZooming',
        mouseout: null,
        mousemove: null,
        click: null
      },
      subConfig: {
        zoomIn: {
          icon: 'px-vis:zoom-in',
          tooltipLabel: 'Zoom in',
          eventName: 'px-vis-toolbar-zoom-in'
        },
        zoomOut: {
          icon: 'px-vis:zoom-out',
          tooltipLabel: 'Zoom out',
          eventName: 'px-vis-toolbar-zoom-out'
        },
        undoZoom: {
          icon: 'px-vis:zoom-out-one-level',
          tooltipLabel: 'Undo zoom',
          eventName: 'px-vis-toolbar-undo-zoom'
        },
        resetZoom: {
          icon: 'px-vis:full-screen',
          tooltipLabel: 'Reset',
          eventName: 'px-vis-toolbar-reset-zoom'
        }
      }
    },
    advancedZoom: {
      tooltipLabel: 'Zoom',
      icon: 'px-vis:zoom-toolbar',
      cursorIcon: 'px-vis:zoom-toolbar',
      buttonGroup: 1,
      selectable: true,
      onSelect: function() {
        this.set('_internalShowTooltip', false);
      },
      actionConfig: {
        mousedown: 'startZooming',
        mouseup: 'stopZooming',
        mouseout: null,
        mousemove: null,
        click: null
      },
      subConfig: {
        x: {
          icon: 'px-vis:x-axis',
          buttonGroup: 1,
          tooltipLabel: 'Zoom on X axis only',
          eventName: 'my-custom-click',
          selectable: true,
          onSelect: function() { this.set('selectionType', 'xAxis');}
        },
        y: {
          icon: 'px-vis:y-axis',
          buttonGroup: 1,
          tooltipLabel: 'Zoom on Y axis only',
          selectable: true,
          onSelect: function() { this.set('selectionType', 'yAxis');}
        },
        xy: {
          icon: 'px-vis:xy-axis',
          tooltipLabel: 'Zoom on X and Y axis',
          buttonGroup: 1,
          selectable: true,
          onSelect: function() { this.set('selectionType', 'xy');}
        },
        zoomIn: {
          icon: 'px-vis:zoom-in',
          tooltipLabel: 'Zoom in',
          eventName: 'px-vis-toolbar-zoom-in'
        },
        zoomOut: {
          icon: 'px-vis:zoom-out',
          tooltipLabel: 'Zoom out',
          eventName: 'px-vis-toolbar-zoom-out'
        },
        undoZoom: {
          icon: 'px-vis:zoom-out-one-level',
          tooltipLabel: 'Undo zoom',
          eventName: 'px-vis-toolbar-undo-zoom'
        },
        resetZoom: {
          icon: 'px-vis:full-screen',
          tooltipLabel: 'Reset',
          eventName: 'px-vis-toolbar-reset-zoom'
        }
      }
    },
    stripe: {
      tooltipLabel: 'Draw Stripe',
      icon: 'px-vis:draw-stripe',
      cursorIcon: 'px-vis:draw-stripe',
      buttonGroup: 1,
      selectable: true,
      onSelect: function() {
        this.set('extentsAction', 'stripe');
        this.set('_internalShowTooltip', false);
      },
      subConfig: {
        inclusion: {
          title: 'Inclusion',
          cursorIcon: 'px-vis:draw-stripe',
          buttonGroup: 1,
          tooltipLabel: 'Draw/edit inclusion type stripes',
          selectable: true,
          selected: true,
          onSelect: function() {
            this.set('selectionType', 'xAxis');
            this.set('stripeType', 'inclusion');
          }
        },
        exclusion: {
          title: 'Exclusion',
          cursorIcon: 'px-vis:draw-stripe',
          buttonGroup: 1,
          tooltipLabel: 'Draw/edit exclusion type stripes',
          selectable: true,
          onSelect: function() {
            this.set('selectionType', 'xAxis');
            this.set('stripeType', 'exclusion');
          }
        },
        add: {
          icon: 'px-vis:draw-stripe',
          cursorIcon: 'px-vis:draw-stripe',
          tooltipLabel: 'Add stripe',
          buttonGroup: 2,
          selected: true,
          selectable: true,
          actionConfig: {
            mousedown: 'startStriping',
            mouseup: 'stopStriping',
            mouseout: 'resetTooltip',
            mousemove: 'calcTooltipData',
            click: null
          },
        },
        edit: {
          icon: 'px-vis:remove-stripe',
          cursorIcon: 'px-vis:remove-stripe',
          buttonGroup: 2,
          selectable: true,
          tooltipLabel: 'Edit/remove stripe',
          actionConfig: {
            mousedown: null,
            mouseup: null,
            mouseout: null,
            click: null,
            mousemove: 'reportMouseCoords'
          }
        }
      }
    }
  },

  clearAllActions: function() {
    var keys = Object.keys(this.actionConfig),
        o = {};

    for(var i = 0; i < keys.length; i++) {
      o[keys[i]] = null;
    }

    for(var i=0; i<this._internalConfig.length; i++) {
      this.set('_internalConfig.' + i + '.selected', false);
      this.set('_internalConfig.' + i + '.opened', false);
    }

    this.set('actionConfig', o);
  },

  /**
   * Forces the toolbar to reprocess its current config. Useful when changing
   * one subproperty of a toolbar item without having to re-copy the whole
   * config
   */
  reProcessConfig: function() {
    this._configChanged();
  },

  /**
   * Convenience function for switching a toolbar item to another by hiding
   * the first one and selecting the second one.
   * Pass selectToItem true to select the "toItemName" automatically
   * By default this function will force the toolbar to reprocess the
   * changes incurred by this switching. If you have more changes to apply
   * to the config then pass `preventReprocess` true to this function and
   * call `reProcessConfig` on the toolbar once you applied all your changes
   */
  switchConfigItems(fromItemName, toItemName, selectToItem, preventReprocess) {

    //add the "toItem" if it has not already been defined by the user
    if(!this.config[toItemName]) {

      if(!this._defaultActionsMapping[toItemName]) {
        console.warn('Can\'t find item ' + toItemName + ' in toolbar config or toolbar predefined config, abort switching toolbar items.');
        return;
      } else {
        this.config[toItemName] = {};
      }
    }

    if(typeof this.config[fromItemName] !== 'object' && this.config[fromItemName] !== false) {
      //this is a predefined conf, convert to an obj so we still
      //apply the predefined conf and allow to override hidden
      this.config[fromItemName] = {};
    }
    this.config[fromItemName].hidden = true;
    this.config[fromItemName].selected = false;

    if(typeof this.config[toItemName] !== 'object' && this.config[fromItemName] !== false) {
      //same as above
      this.config[toItemName] = {};
    }
    this.config[toItemName].hidden = false;

    //store original conf so we can switch to it easily
    this.config[toItemName].originalTooltipConf = fromItemName;

    if(selectToItem) {
      this.config[toItemName].selected = true;
    }

    if(!preventReprocess) {
      //notify the toolbar to process the changes
      this.reProcessConfig();
    }
  },

  _extendConfig: function(defaultConfig, customConfig) {
    var keys = Object.keys(customConfig),
        obj = defaultConfig || {};

    for(var i=0; i<keys.length; i++) {
      obj[keys[i]] = typeof customConfig[keys[i]] === 'object' && customConfig[keys[i]] !== null ?
        this._extendConfig(obj[keys[i]], customConfig[keys[i]]) : customConfig[keys[i]]
    }

    return obj;
  },

  _configChanged: function() {
    if(this.hasUndefinedArguments(arguments)) {
      return;
    }

    var internalConf = [],
        keys = Object.keys(this.config);

    for(var i=0; i<keys.length; i++) {

      var toPush;

      if(this.config[keys[i]] !== false) {
        //if this is a default action use it
        if(this._defaultActionsMapping[keys[i]]) {

          //make sure we copy the predefined conf
          //so that we 1) don't override it if we need to reuse it
          //2) avoid dirty checking if reusing it later
          var predefinedConf = {};

          predefinedConf = this.clone(this._defaultActionsMapping[keys[i]], predefinedConf);

          toPush = typeof this.config[keys[i]] === 'object' ?
            this._extendConfig(predefinedConf, this.config[keys[i]]) :
            predefinedConf;
        } else {
          toPush = this.config[keys[i]];
        }
        toPush.initialKey = keys[i];
        internalConf.push(toPush);
      }

      if(toPush.selected) {
        this._tryProcessSubConfig(toPush);
        this._processItem(toPush, false);
      }
    }

    //reverse array to take flex row rev into account
    if(this.horizontalAlignment === 'right') {
      internalConf.reverse();
    }
    this.set('_internalConfig', internalConf);
  },

  /**
   * Called when clicking an item of the main toolbar.
   */
  _clickItem: function(evt) {
    evt = dom(evt);
    var index = evt.localTarget.value,
        conf = this._internalConfig[index],
        alreadyOpened,
        needNotify = false;

    if(!conf.disabled) {

      //make it the current selection if it is in a buttonGroup
      if(conf.buttonGroup) {

        //ensure we remember selection, deselect others and select this one
        for(var i=0; i<this._internalConfig.length; i++) {

          // if we are changing groups
          if(index !== i && this._internalConfig[i].buttonGroup === conf.buttonGroup) {
            // if we have a onDeselect func and we are selected, run it
            if(this._internalConfig[i]['onDeselect'] && this._internalConfig[i].selected) {
              var fn = this._returnFn(this._internalConfig[i]['onDeselect']);
              this._setupContext(this._internalConfig[i], fn);
            }
            // change styles on the old button
            this.set('_internalConfig.' + i + '.selected', false);
            this.set('_internalConfig.' + i + '.opened', false);
          }
        }

        //toggle style on the new button
        alreadyOpened = this._internalConfig[index].opened;
        this.set('_internalConfig.' + index + '.opened', !alreadyOpened);
        this.set('_internalConfig.' + index + '.selected', this._internalConfig[index].toggle ? !this._internalConfig[index].selected : true);
      }


      if(!alreadyOpened) {

        if(!this.currentSubConfig || this.currentSubConfig.length === 0) {
          needNotify = true;
        }

        //open sub toolbar
        this._tryProcessSubConfig(conf);
        this._processItem(conf, true);

        this._tryApplySelectedSub(conf);
      } else {

        if(this.currentSubConfig !== []) {
          needNotify = true;
        }

        //close subtoolbar
        this.set('currentSubConfig', []);
      }

      if(needNotify) {

        //make sure that the toolbar has been re rendered (i.e hidden or shown)
        this.$.templateSubRow.render();

        //tell the chart so it can resize
        this.dispatchEvent(new CustomEvent('px-vis-toolbar-secondary-toggled', { bubbles: true, composed: true, detail: { 'open': this.currentSubConfig !== [], withinChart: this.withinChart }}));
      }
    }
  },

  _tryProcessSubConfig: function(conf) {
    //process sub config if existing
    if(conf.subConfig && !conf.disabled) {
      var subConf = [],
          keys = Object.keys(conf.subConfig);

      //reverse order to take flex-row-reverse into account
      if(this.horizontalAlignment === 'right') {
        for(var i=keys.length-1; i>-1; i--) {
          subConf.push(conf.subConfig[keys[i]]);
        }
      } else {
        for(var i=0; i<keys.length; i++) {
          subConf.push(conf.subConfig[keys[i]]);
        }
      }

      this.set('currentSubConfig', subConf);
    } else {
      this.set('currentSubConfig', []);
    }
  },

  _tryApplySelectedSub: function(conf) {
    if(conf.subConfig) {
      var subs = Object.keys(conf.subConfig);

      for(var i=0; i<subs.length; i++) {
        if(conf.subConfig[subs[i]]["selected"]) {
          this._processItem(conf.subConfig[subs[i]], false);
        }
      }
    }
  },

  /**
   * Called when clicking an item of the secondary toolbar.
   */
  _clickSubItem: function(evt) {
    evt = dom(evt);
    var index = evt.localTarget.value,
        conf = this.currentSubConfig[index];

    //make it the current selection if it is selectable
    if(conf.buttonGroup) {
      //ensure we remember selection, deselect others and select this one

      for(var i =0; i<this.currentSubConfig.length; i++) {
        if(i !== index && this.currentSubConfig[i].buttonGroup === conf.buttonGroup) {
          this.set('currentSubConfig.' + i + '.selected', false);
        }
      }
      this.set('currentSubConfig.' + index + '.selected', conf.toggle ? !conf.selected : true);
    }

    this._processItem(conf, true);
  },

  /**
   * Processes an item click: fire event if needed and set action config appropriately
   */
  _processItem: function(conf, comesFromClick) {
    if(conf.actionConfig) {
      if(!conf.disabled) {
        var newConf = typeof conf.actionConfig === 'string' ? JSON.parse(conf.actionConfig) : this.clone(conf.actionConfig);

        this.set('actionConfig', newConf);
      } else {
        this.set('actionConfig', {});
      }
    }

    if(conf.eventName) {

      //fire the event fromt the chart's context
      this.fire('px-vis-event-request', {eventName: conf.eventName, data: conf});
    }

    if(conf.onClick && comesFromClick) {
      let fn = this._returnFn(conf.onClick);
      this._setupContext(conf, fn);
    }

    if(conf.onSelect) {
      let fn = this._returnFn(conf.onSelect);
      this._setupContext(conf, fn);
    }

    this._setMouseCursor(conf);

  },

  _returnFn: function(fn) {
    if(typeof fn === 'function') {
      return fn;
    } else if (typeof fn === 'string') {
      return eval('var f = function() { return ' + fn + ';}; f();');
    }
  },

  _setupContext: function(conf, fn) {
    if(conf.onClickContext) {
      if(conf.onClickContext === 'toolbar') {
        fn = fn.bind(this);
      } else {
        fn = fn.bind(conf.onClickContext);
      }

      fn(conf, this);
    } else {
      //run it from the chart's context
      this.fire('px-vis-action-request', {'function': fn, 'data': {itemConfig: conf, toolbar: this}});
    }
  },

  _setMouseCursor: function(conf, resetIcon) {
    var icon = null,
        fn;

      // In general if an action doesnt have a cursor icon, we want to use the last
      // if we are forcing a reset, then start off null and overwrite if there is a cursorIcon
      if(resetIcon) {
        icon = null;
      }

      if(conf.cursorIcon) {
        icon = conf.cursorIcon;
      }


      fn = function() { this.set('interactionSpaceConfig.iconType', icon); };

    this.fire('px-vis-action-request', {'function': fn, 'data': null });

  },

  _getIcon: function(item) {
    return item.icon ? (item.icon + ' ') : '';
  },

  _getSelectedClass: function(selected) {
    return selected ? 'selected ' : '';
  },

  _getDisabledClass: function(disabled) {
    return disabled ? 'disabled ' : '';
  },

  _hasTooltip: function(item) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    return item.tooltipLabel && !!item.tooltipLabel.length;
  },

  _alignRow: function(row) {
    if(this.horizontalAlignment === 'left') {
      row.style['margin-left'] = Number(this.chartMargin.left) + 'px';
      row.style['margin-right'] = '';
    } else {
      row.style['margin-right'] = Number(this.chartMargin.right) + 'px';
      row.style['margin-left'] = '';
    }
  },

  _positionMainRow: function(chartMargin, horizontalAlignement) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    this._alignRow(this.$$('#mainRow'));
  },

  _positionSubRow: function(withinChart, chartMargin, horizontalAlignement) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    if(this.withinChart) {

      //make sure dom if is up to date
      this.$.templateSubRow.render();

      this.$$('#subRow').style['margin-top'] = this.subToolbarAlignment === 'above' ? '0px' : Number(chartMargin.top) + 'px';
      this._alignRow(this.$$('#subRow'));
    }
  },

  _getSubRowClass: function(subToolbarAlignment) {
    var base = this.subToolbarAlignment === 'above' ? '' : 'subrow--chart ';

    if(this.subToolbarAlignment === 'vertical') {
      base += ' flex--col flex--bottom right ';
    } else {
      base += ' flex--row';
    }

    return base;
  },

  _isWithinChart: function(withinChart) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    return this.withinChart;
  },

  _getRowDirection: function(horizontalAlignment) {
   if(this.hasUndefinedArguments(arguments)) {
     return;
   }

    if(this.horizontalAlignment === 'right') {
      return 'flex--row--rev right ';
    } else {
      return 'flex--row ';
    }
  },

  _onItemHover: function(evt) {
    const target = dom(evt).rootTarget;
    const conf = target.dataset.confType === 'main' ? this._internalConfig[target.value] : this.currentSubConfig[target.value];

    if(!this._hasTooltip(conf)) {
      return;
    }

    this._tooltipRequested = true;
    this._tooltipTimer = setTimeout(() => {

      const detail = {
        origin: this,
        is: this.is,
        element: target,
        orientation: 'top',
        data: [{
          text: conf.tooltipLabel
        }]
      }

      this.dispatchEvent(new CustomEvent('central-tooltip-display-request', { bubbles: true, composed: true, detail: detail }));

      this._tooltipRequested = false;

    }, 500);
  },

  _onItemLeave: function(evt) {
    if(this._tooltipRequested) {
      clearTimeout(this._tooltipTimer);

    } else {
      this.dispatchEvent(new CustomEvent('central-tooltip-cancel-request', { bubbles: true, composed: true, detail: {origin: this } }));

    }
  }
});
