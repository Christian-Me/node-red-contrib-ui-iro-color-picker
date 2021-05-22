/* eslint-disable indent */
/**
 * Copyright 2021 Christian Meinert
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


/*************************************************************************
 * !!REQUIRED!!
 * A ui-node must always begin with the following function.
 * module.exports = function(RED) {your code here}
 * There is no need to edit this line.
 */

var path = require('path');

module.exports = function(RED) {

//*************************************************************************
    // var settings = RED.settings;  // optional - only needed if required later


/**********************************************************************
 * !!REQUIRED!!
 *
 * A ui-node must always contain the function HTML(config) {}
 *
 * This function will generate the HTML (as a text string) which will be showed in the browser
 * on the dashboard.
 *
 * The 'config' input contains all the node properties, which can be changed by the user on
 * the node's config screen (in the flow editor).
 *
 * In this function 3 AngularJs directives are being demonstrated:
 *  -> ng-init is required to transfer the node configuration from the Node-RED flow to the dashboard.
 *  -> ng-model is used to make sure the data is (two way) synchronized between the scope and the html element.
 *          (the 'textContent' variable on the AngularJs $scope is called the 'model' of this html element.
 *  -> ng-change is used to do something (e.g. send a message to the Node-RED flow, as soon as the data in the model changes.
 *  -> ng-keydown is used to do something when the user presses a key. (e.g., type a value into a textbox, then press enter)
 **********************************************************************/

    function HTML(config) {
        // The configuration is a Javascript object, which needs to be converted to a JSON string
        var configAsJson = JSON.stringify(config);

        // var html = String.raw`
        // <input type='text' style='color:` + config.textColor + `;' ng-init='init(` + configAsJson + `)' ng-model='textContent' ng-change='change()'>
        // `;
        // return html;
        var html;
        
        if (config.pickerType.startsWith('popup')) {
            html = String.raw`
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>

            .iro-color-container{
                display:flex;
                width:100%;
                margin:auto;
            }

            .iro-color-disabled{
                opacity: 0.4 !important;
                pointer-events: none !important;
            }

            /* Modal Background */
            .modal {
              display: none; /* Hidden by default */
              -webkit-transform:translate3d(0,0,100px);
              transform: translate3d(0, 0, 100px);
              position: fixed;
              z-index: 10 !important; /* Sit on top */
              /* padding-top: 100px;  Location of the box */
              left: 0;
              top: 0;
              width: 100%; /* Full width */
              height: 100%; /* Full height */
              -webkit-overflow-scrolling: none;
        	  overflow: hidden;
              background-color: rgb(0,0,0); /* Fallback color */
              background-color: rgba(0,0,0,0.8); /* Black w/ opacity */
            }
            
            /* Modal Content */
            .modal-content {
              background-color: rgba(0,0,0,0);
              position: absolute;
              display: block;
            }
            
            </style>
            
            <script type='text/javascript' src='ui-iro-color-picker/js/iro.min.js'></script>

            <div class="iro-color-container" id="iro-color-container-${config.id}" style="display:flex; flex-direction: row;" ng-init='init(` + configAsJson + `)'>
                <div ng-if="${config.label != ""}" style="width:${config.labelWidth}px;">${config.label}</div>          
                <button id="colorButton-${config.id}" class="md-raised md-button md-ink-ripple" type="button" style="width:100px;" color='{{colorHex || config.site.theme["widget-backgroundColor"].value}}'>&nbsp;</Button>
            </div>
            
            <!-- The Modal -->
            <div id="colorModal-${config.id}" class="modal">
            
              <!-- Modal content -->
              <div class="modal-content" id="modal-content-${config.id}" style="width:${config.widgetWidthPx}px;">
                <!-- <span id="colorModal-close-${config.id}" class="close">&times;</span> -->
                <div id='ui_iro_color_picker-{{$id}}' style="width:${config.widgetWidthPx}px; background-color:unset; border:unset;"></div>
              </div>
            
            </div>
            
            <script>
                // When the user clicks the button, open the modal 
                document.getElementById("colorButton-${config.id}").onclick = function(e) {
                    var modal = document.getElementById("colorModal-${config.id}");
                    var modalContent = document.getElementById("modal-content-${config.id}");
                    modal.style.backgroundColor = '${config.backgroundColor}'+Math.floor(${config.backgroundDim / 100*255}).toString(16);
                    
                    var positionLeft = 0;
                    var positionTop = 0;
                    var pickerType = '${config.pickerType}';
                    switch (pickerType) {
                        case 'popupCW': 
                            positionTop = (window.innerHeight /2  - ${config.widgetHeightPx/2});
                            positionLeft = (window.innerWidth /2  - ${config.widgetWidthPx/2});
                            break;
                        case 'popupCG':
                            positionTop = (e.clientY - e.layerY - ${config.widgetHeightPx/2});
                            positionLeft = (e.clientX - e.layerX - ${config.widgetWidthPx/2} + 35);
                            break;
                            case 'popupCC':
                            positionTop = (e.clientY - ${config.widgetHeightPx/2});
                            positionLeft = (e.clientX - ${config.widgetWidthPx/2});
                        break;
                    }
                    if (positionTop + ${config.widgetHeightPx} > window.innerHeight) positionTop = window.innerHeight - ${config.widgetHeightPx};
                    if (positionTop<5) positionTop = 5;
                    if (positionLeft<5) positionLeft = 5;
                    
                    //console.log(positionLeft, e.clientX, e.layerX, ${config.widgetWidthPx/2}, e);
                    //console.log(pickerType, positionTop, window.innerHeight, ${config.widgetHeightPx});

                    modalContent.style.left = positionLeft + "px";
                    modalContent.style.top = positionTop + "px";
                    modal.style.display = "flex";
                    document.ontouchmove = (e) => e.preventDefault();

                    // When the user clicks anywhere outside of the modal, close it
                    window.onclick = function(event) {
                        var modal = document.getElementById("colorModal-${config.id}");
                        if (event.target == modal) {
                            document.ontouchmove = (e) => true;
                            modal.style.display = "none";
                        }
                    }
                }
                
            </script>
            `;
            } else {
                html = String.raw`
                <script type='text/javascript' src='ui-iro-color-picker/js/iro.min.js'></script>
                <div class="iro-color-container" id="iro-color-container-${config.id}" style="display:flex; flex-direction: row;" ng-init='init(` + configAsJson + `)'>
                    <div ng-if="${config.label != ""}" id="iro-color-label-${config.id}" style="width:${config.labelWidth}px;">${config.label}</div>          
                    <div id='ui_iro_color_picker-{{$id}}' style="width:${config.widgetWidthPx}px; background-color:unset; border:unset;"></div>
                </div>
            `;

        }
        return html;
    }

/********************************************************************
* REQUIRED
* A ui-node must always contain the following function.
* This function will verify that the configuration is valid
* by making sure the node is part of a group. If it is not,
* it will throw a "no-group" error.
* You must enter your node name that you are registering here.
*/
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_iro-color-picker.error.no-group"));
            return false;
        }
        return true;
    }

/********************************************************************
*********************************************************************
* !!REQUIRED!!
*
* UI Variable Define
*
* Define a variable to reference the ui.
* There is no need to edit this line.
*/

    var ui = undefined;

/*********************************************************************/


/*********************************************************************
* !!REQUIRED!!
+
* A ui-node must always contain a YourNodeNameHere(config) function, which will be executed in the Node-RED flow.
* This function will add the widget to the dashboard, based on the 'required' node properties.  On the other hand
* our own custom node properties will most probably not be used here, but only in the above HTML function (where
* all properties are available in the config variable).
*
*/
    function iroColorPickerUINode(config) {
        try {
            var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing.
            // Remove those statements when you publish your node on NPM!!!
            //debugger;
            if (checkConfig(node, config)) {
                // Add default values to older nodes (version 1.0.0)
                config.stateField = config.stateField || 'payload';
                config.enableField = config.enableField || 'enable';

                getSiteProperties = function () {
                    var opts = {}
                    opts.sizes = { sx: 48, sy: 48, gx: 4, gy: 4, cx: 4, cy: 4, px: 4, py: 4 }
                    opts.theme = {
                        'group-borderColor': {
                            value: "#097479"
                        }
                    }
    
                    if (typeof ui.getSizes === "function") {
                        if (ui.getSizes()) {
                            opts.sizes = ui.getSizes();
                        }
                        if (ui.getTheme()) {
    
                            opts.theme = ui.getTheme();
                        }
                    }
                    return opts
                }
    
                var group = RED.nodes.getNode(config.group);
                config.groupId = group.id;
                config.site = getSiteProperties();
                config.type = config.layout;
                config.width = (config.width == 0) ? parseInt(group.config.width) : parseInt(config.width);
                var widgetIndent = config.widgetIndent;
                if (widgetIndent<1 && config.label!=="") widgetIndent=1;
                if (config.label==="") widgetIndent=0;
                config.labelWidth = parseInt(config.site.sizes.sx * widgetIndent + config.site.sizes.cx * (widgetIndent - 1)) - 12;
                config.widgetWidth = (config.pickerType.startsWith('popup')) ? config.width : config.width-widgetIndent;
                config.horizontalScale = 1;
                config.widgetBox = {
                    horizontalPx : parseInt(config.site.sizes.sx * config.widgetWidth + config.site.sizes.cx * (config.widgetWidth - 1)) - 12,
                    verticalPx : 0,
                    horizontalGrid : config.widgetWidth,
                    verticalGrid : 0,
                }
                
                // calculate an ideal rectangle for all components
                config.components.forEach(component => {
                    switch (component.componentId) {
                        case 'picker' :
                            config.widgetBox.verticalGrid += config.widgetBox.horizontalGrid;
                            config.widgetBox.verticalPx += config.widgetBox.horizontalGrid * (config.site.sizes.sy+config.site.sizes.cy)
                            break;
                        case 'box' :
                            if (component.options!==undefined && component.options.hasOwnProperty('boxHeight') && component.options.boxHeight>0) {
                                config.widgetBox.verticalGrid += Math.floor(component.options.boxHeight / (config.site.sizes.sy+config.site.sizes.cy)) + 1;
                                config.widgetBox.verticalPx += component.options.boxHeight + config.site.sizes.cy;
                            } else {
                                config.widgetBox.verticalGrid += config.widgetWidth;
                                config.widgetBox.verticalPx += config.widgetWidth * (config.site.sizes.sy+config.site.sizes.cy)
                            }
                            break;
                        case 'slider':
                            config.widgetBox.verticalGrid++;
                            config.widgetBox.verticalPx += (config.site.sizes.sy+config.site.sizes.cy)
                            break;
                    }
                });

                config.iroWidth = config.widgetBox.horizontalPx;
                // swap height and width if arraigned horizontally
                if (config.layoutDirection==='horizontal') {
                    let tempPx = config.widgetBox.verticalPx;
                    config.widgetBox.verticalPx=config.widgetBox.horizontalPx;
                    config.widgetBox.horizontalPx=tempPx;
                    let tempGrid = config.widgetBox.verticalGrid;
                    config.widgetBox.verticalGrid=config.widgetBox.horizontalGrid;
                    config.widgetBox.horizontalGrid=tempGrid;
                }

                // console.log('widgetBox',config.widgetBox);
                // calculate auto hight and sizes for components exceeding available width
                if (config.height == 0) { // auto scale
                    config.height = config.widgetBox.verticalGrid;
                    config.widgetHeightPx = config.widgetBox.verticalPx;
                    if (!config.pickerType.startsWith('popup')) { // widget
                        if (config.widgetWidth<config.widgetBox.horizontalGrid) { // rescale components to fit into available width
                            config.horizontalScale=config.widgetWidth / config.widgetBox.horizontalGrid;
                            config.height = Math.floor(config.height * config.horizontalScale) +1;
                        }
                    } else { // popups only need one grid for button
                        config.height=1;
                    }
                    config.widgetHeightPx = config.widgetBox.verticalPx - 12;
                } else {
                    config.height =parseInt(config.height);
                    config.widgetHeightPx = parseInt(config.site.sizes.sy * config.height + config.site.sizes.cy * (config.height - 1)) - 12;
                }

                // setup and scale width for popup
                if (config.pickerType.startsWith('popup')) {
                    config.widgetWidthPx = config.widgetBox.horizontalPx;
                    if (!config.pickerSize || Number(config.pickerSize)==NaN) {
                        config.widthFactor=1;
                    } else {
                        config.widthFactor=Number(config.pickerSize)/100;
                        if (config.widthFactor<0.1) config.widthFactor=0.1;
                        if (config.widthFactor>5) config.widthFactor=5;
                        config.widgetWidthPx = config.widgetWidthPx * config.widthFactor;
                        config.widgetHeightPx = config.widgetHeightPx * config.widthFactor;
                        config.iroWidth = config.iroWidth * config.widthFactor;
                    }
                } else {
                    config.widgetWidthPx = parseInt(config.site.sizes.sx * config.widgetWidth + config.site.sizes.cx * (config.widgetWidth - 1)) - 12;
                    config.iroWidth = (config.layoutDirection==='horizontal') ? config.widgetHeightPx : config.widgetWidthPx;
                }

                config.groupWidth = parseInt(config.site.sizes.sx * config.width + config.site.sizes.cx * (config.width - 1)) - 12;

                node.on("input", function(msg) {
                    node.topi = msg.topic;
                });
            
                var sizes = ui.getSizes();
                var html = HTML(config);                    // *REQUIRED* !!DO NOT EDIT!!
                var done = ui.addWidget({                   // *REQUIRED* !!DO NOT EDIT!!
                    type: 'iro color',
                    label: config.label,
                    tooltip: config.tooltip,
                    node: node,                             // *REQUIRED* !!DO NOT EDIT!!
                    order: config.order,                    // *REQUIRED* !!DO NOT EDIT!!
                    group: config.group,                    // *REQUIRED* !!DO NOT EDIT!!
                    width: config.width,                    // *REQUIRED* !!DO NOT EDIT!!
                    height: config.height,                  // *REQUIRED* !!DO NOT EDIT!!
                    format: html,                           // *REQUIRED* !!DO NOT EDIT!!
                    templateScope: "local",                 // *REQUIRED* !!DO NOT EDIT!!
                    emitOnlyNewValues: false,               // *REQUIRED* Edit this if you would like your node to only emit new values.
                    forwardInputMessages: config.passthru,  // *REQUIRED* Edit this if you would like your node to forward the input message to it's ouput.
                    storeFrontEndInputAsState: true,        // *REQUIRED* If the widget accepts user input - should it update the backend stored state ?

/********************************************************************

/********************************************************************
* !!REQUIRED!!
*
* Convert Back Function
* Callback to convert sent message.
*
* TODO: Need help explaining this one.
*/

                    convertBack: function (value) {
                        return value;
                    },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Before Emit Function
* Callback to prepare message that is sent from the backend TO the widget
*
*/

                    beforeEmit: function(msg, value) {
                        const iroParameters = ['kelvin','red','green','blue','value','saturation','alpha','hue','index'];
                        var newMsg = {};
                        // console.log('beforeEmit: ',msg,value);
                        if (msg) {
                            // Copy the socket id from the original input message. 
                            newMsg.socketid = msg.socketid;
                            
                            // Try to get the specified message fields, and copy those to predefined fixed message fields.
                            // This way the message has been flattened, so the client doesn't need to access the nested msg properties.
                            // See https://discourse.nodered.org/t/red-in-ui-nodes/29824/2
                            try {
                                // Get the new state value from the specified message field
                                newMsg.state = RED.util.getMessageProperty(msg, config.stateField || "payload");
                                iroParameters.forEach(paramter => {
                                    if (msg.hasOwnProperty(paramter)) {
                                        newMsg[paramter] = RED.util.getMessageProperty(msg, paramter);
                                    }
                                });
                            } 
                            catch(err) {
                                // No problem because the state field is optional ...
                            }
                            
                            try {
                                // Get the new enable value from the specified message field
                                newMsg.enable = RED.util.getMessageProperty(msg, config.enableField);
                            } 
                            catch(err) {
                                // No problem because the enable value is optional ...
                            }
                        }
                        // console.log('beforeEmit: ', newMsg);
                        return { msg: newMsg };
                    },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Before Send Function
* Callback to prepare message FROM the UI before it is sent to next node
*
*/
                    beforeSend: function (msg, orig) {
                        // console.log('beforeSend:',msg,orig);
                        if (orig) {
                            var newMsg = {};
                            // Store the switch state in the specified msg state field
                            RED.util.setMessageProperty(newMsg, config.stateField, orig.msg.state, true)
                            //orig.msg = newMsg;
                            var topic = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                            if (topic) { newMsg.topic = topic; }
                            return newMsg;
                        }
                    },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Init Controller
* Callback to initialize in controller.
*
* The initController is where most of the magic happens, to let the dashboard communicate with
* the Node-RED flow.
*/
                    initController: function($scope, events) {
                        // debugger;
                        var iroDiv;
                        $scope.flag = true;   // not sure if this is needed?

/*******************************************************************
/*******************************************************************
*
* STORE THE CONFIGURATION FROM NODE-RED FLOW INTO THE DASHBOARD
* The configuration (from the node's config screen in the flow editor) should be saved in the $scope.
* This 'init' function should be called from a single html element (via ng-init) in the HTML function,
* since the configuration will be available there.
*
*/
                        const iroParameters = ['kelvin','red','green','blue','value','saturation','alpha','hue','index'];

                        /**
                        *  updates the color if it is changed. Updates button and background if necessary
                        *   @param  {object} color  iro.js color object
                        *   @param  {boolean} send  send message to backend if true
                        *   @return {void}
                        */
                        var colorUpdate = function (color, send = true) {
                            var colorHex8String = color.hex8String;
                            var colorToSend;
                            switch ($scope.config.outFormat) {
                                case 'tuneable':
                                    colorToSend = {
                                        v: color.value,
                                        t: color.kelvin
                                    }
                                    break;
                                default:
                                    colorToSend = color[$scope.config.outFormat];
                            }
                            // console.log('colorUpdate:',$scope.iroColorValue,colorHex8String);
                            if ($scope.iroColorValue!==colorHex8String || (send && $scope.lastSent!==JSON.stringify(colorToSend))) { // limit updates to "new" colors
                                $scope.iroColorValue = colorHex8String;
                                if ($scope.btn) $scope.btn.style["background-color"] = colorHex8String;
                                if ($scope.modal) $scope.modal.style.backgroundColor = color.hexString + Math.floor($scope.config.backgroundDim / 100*255).toString(16);
                                if (send && !$scope.sendHold) {
                                    $scope.send({state:colorToSend});
                                    $scope.lastSent = JSON.stringify(colorToSend);
                                    if ($scope.config.outputLimit && $scope.config.outputLimit>0) {
                                        $scope.sendHold = true;
                                        setTimeout(function () {delete $scope.sendHold;},1000/$scope.config.outputLimit);
                                    }
                                }
                            }
                        }

                        /**
                        *  creates an instance of the iro.js widget
                        *   -   destroys existing instance
                        *   -   register callback functions
                        *       -   `input:start`   sets the `$scope.inputStarted` flag and btn an modal references
                        *       -   `input:move`
                        *       -   `input:end`
                        *   @return {void}
                        */
                        var createIro = function () {
                            if($scope.iroColorPicker !== undefined) {
                                $scope.iroColorPicker.destroy();
                            }
                            $scope.opts.color = $scope.iroColorValue;
                            $scope.iroColorPicker = new iro.ColorPicker(iroDiv, $scope.opts);
                            $scope.iroColorPicker.on('input:start', function (color) {
                                // console.log('input started', color.hex8String);
                                $scope.inputStarted = true;
                                $scope.btn = document.getElementById(`colorButton-${$scope.config.id}`);
                                if ($scope.config.backgroundVariable) {
                                    $scope.modal = document.getElementById(`colorModal-${$scope.config.id}`);
                                }
                            });
                            $scope.iroColorPicker.on('input:end', function (color) {
                                $scope.inputStarted = false;
                                $scope.coolDown = color.hex8String;
                                // console.log('input ended', color.hex8String);
                                colorUpdate(color);
                            });
                            $scope.iroColorPicker.on('input:move', function (color) {
                                // console.log('input moved: ', color.hex8String);
                                colorUpdate(color, ($scope.config.dynOutput==='input:move'));
                            });
                        }

                        $scope.init = function (config) {
                            $scope.config = config;
                            iroDiv = '#ui_iro_color_picker-' + $scope.$eval('$id');

                            // console.log(`init: $scope.config: ${$scope.config}`);
                            // console.log("iroWidth: ",config.iroWidth);

                            if ($scope.iroColorValue===undefined)  $scope.iroColorValue = {h: 360, s: 100, v: 100};
                            $scope.opts={
                                width: config.iroWidth * config.horizontalScale, // config.widgetWidthPx,
                                handleRadius : 8 * config.horizontalScale,
                                padding : 6 * config.horizontalScale,
                                color: $scope.iroColorValue, // $scope.iroColorValue
                                layoutDirection: config.layoutDirection,
                                layout: [],
                            };
                            config.components.forEach(component => {
                                $scope.opts.layout.push({
                                    "component":    (component.componentId==='picker') ? iro.ui.Wheel :
                                                    (component.componentId==='box') ? iro.ui.Box :
                                                    (component.componentId==='slider') ? iro.ui.Slider : null,
                                    "options": component.options
                                });
                            });
                            // console.log('init',$scope.opts);
                            var stateCheck = setInterval(function() {
                                if (document.querySelector(iroDiv)) {
                                    clearInterval(stateCheck);
                                    $scope.initialized = true;
                                    createIro();
                                }
                            }, 100);
                        };

/*******************************************************************
/*******************************************************************
*
* HANDLE MESSAGE FROM NODE-RED FLOW TO DASHBOARD
* Use $scope.$watch 'msg' to manipulate your user interface when a message from the Node-RED flow arrives.
* As soon as the message arrives in the dashboard, the callback function will be executed.
* Inside the callback function, you can manipulate your node's HTML attributes and elements.  That way you
* can update the dashboard based on data from the input message.
* E.g. change the text color based on the value of msg.color.
*
*/
                        $scope.$watch('msg', function(msg) {
                            if (!msg) { return; } // Ignore undefined msg
                            if (msg.enable === true || msg.enable === false){
                                disable(!msg.enable);
                                return;
                            }                      
                            // console.log('color received:',msg);

                            // utilize the iro.Color API build in iro.js and update $scope.iroColorValue to 64bit RGBA string
                            if ($scope.iroColor === undefined) {
                                $scope.iroColor = new iro.Color();
                            }

                            if (msg.hasOwnProperty('state')){
                                if (typeof msg.state === "number") {
                                    try {
                                        $scope.iroColor[$scope.config.outFormat] = msg.state;
                                    } catch (e) {
                                        console.warn(`color conversion failed! Expected "${$scope.config.outFormat}" value, received:`,msg.state);		// catch any errors that may occur and display them in the web browsers console
                                        return;
                                    }
                                } else {
                                    try {
                                        $scope.iroColor.set(msg.state);
                                    } catch (e) {
                                        console.warn(`color conversion failed! received:`,msg.state);		// catch any errors that may occur and display them in the web browsers console
                                        return;
                                    }
                                }
                            }

                            if ($scope.lastData===undefined) $scope.lastData={};
                            iroParameters.forEach(paramter => {
                                if (msg.hasOwnProperty(paramter)) {
                                    $scope.iroColor[paramter] = Number(msg[paramter]);
                                    $scope.lastData[paramter]=Number(msg[paramter]);
                                    if (paramter==='kelvin' && $scope.lastData.hasOwnProperty('value')) $scope.iroColor.value = $scope.lastData.value;
                                }
                            });

                            var iroColorValue = $scope.iroColor.hex8String;

                            // send 'when confirmed': reset sendHold flag
                            // console.log('$scope.config.outputConfirmed',$scope.config.outputConfirmed,$scope.lastSent,JSON.stringify(msg.state),$scope.lastSent===JSON.stringify(msg.state));
                            if ($scope.config.outputConfirmed && $scope.sendHold && $scope.lastSent===JSON.stringify(msg.state)) {
                                delete $scope.sendHold;
                            }

                            if (msg.socketid) {
                                console.log('msg discarded: socketid present - exiting');
                                return;
                            }
                            // exit here during 'sliding'
                            if ($scope.inputStarted) {
                                console.log('msg discarded: input started - exiting');
                                return;
                            }
                            // exit if msg == lastSend
                            if ($scope.lastSent===JSON.stringify(msg.state)) {
                                console.log('msg discarded: msg.state == lastSend - exiting');
                                return;
                            }
                            
                            /*
                            // reset coolDown flag if last value is confirmed or exit
                            if ($scope.coolDown !== undefined) {
                                if (iroColorValue !== $scope.coolDown) {
                                    console.log('msg discarded during cooldown - exiting');
                                    return;
                                }
                                delete $scope.coolDown;
                                console.log('Cooldown ended - exiting');
                                return;
                            }
                            */

                            // console.log('color: ',iroColorValue,' last', $scope.lastData);
                            $scope.iroColorValue = iroColorValue;
                            
                            // update color picker if available 
                            if ($scope.iroColorPicker!==undefined && $scope.iroColorPicker.color!==undefined){
                                $scope.iroColorPicker.color.set($scope.iroColorValue);
                            }

                            // console.log('color set to ',$scope.iroColorValue);
                            var btn = document.getElementById(`colorButton-${$scope.config.id}`);
                            if (btn) {
                                btn.style["background-color"]=$scope.iroColorValue;
                            }
                            if ($scope.config.backgroundVariable) {
                                var modal = document.getElementById(`colorModal-${$scope.config.id}`);
                                if (modal) {
                                    modal.style.backgroundColor = $scope.iroColorValue.substring(0,7) + Math.floor($scope.config.backgroundDim / 100*255).toString(16);
                                }
                            }
                        });

                    function disable(state){                            
                        //true - widget disabled, false - widget enabled
                        var container = document.getElementById("iro-color-container-"+$scope.config.id);
                        if (!container) return;
                        if(state == true){
                            container.classList.add('iro-color-disabled');                    
                        }
                        else{
                            container.classList.remove('iro-color-disabled');
                        }
                    }
/*******************************************************************
/*******************************************************************
*
* SEND MESSAGE FROM DASHBOARD TO NODE-RED FLOW
* When the user has changed something in the dashboard, you can send the updated data to the Node-RED flow.
*
$scope.change = function() {
    // The data will be stored in the model on the scope
    $scope.send({payload: $scope.textContent});
};
*/
/*******************************************************************/
/*******************************************************************
*
* SEND MESSAGE FROM DASHBOARD TO NODE-RED FLOW
* While an input has focus, the user can press the enter key to send the updated data to the Node-RED flow.
*
$scope.enterkey = function(keyEvent){
    if (keyEvent.which === 13) {
        $scope.send({payload: $scope.textContent});
    }
};
*/
/*******************************************************************/

                    }
                });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);		// catch any errors that may occur and display them in the web browsers console
        }

/*******************************************************************
* !!REQUIRED!!
* If you need to do any handling before closing do it here then call done().
*/
        node.on("close", function() {
            if (done) {
                done();
            }
        });
/*******************************************************************/
    }


/*******************************************************************
* !!REQUIRED!!
* Registers the node with a name, and a configuration.
* You must enter the SAME name of your node you registered (in the html file) and enter the name
* of the function (see line #87) that will return your nodes's configuration.
* Note: the name must begin with "ui_".
*/
    setImmediate(function() {
        RED.nodes.registerType("ui_iro-color-picker", iroColorPickerUINode);

        var uipath = 'ui';
        if (RED.settings.ui) { uipath = RED.settings.ui.path; }
        var fullPath = path.join('/', uipath, '/ui-iro-color-picker/*').replace(/\\/g, '/');
        RED.httpNode.get(fullPath, function (req, res) {
            var options = {
                root: __dirname + '/lib/',
                dotfiles: 'deny'
            };
            res.sendFile(req.params[0], options)
        });
    })
}
