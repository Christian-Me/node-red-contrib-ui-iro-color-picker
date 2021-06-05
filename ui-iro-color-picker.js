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

var path = require('path');

module.exports = function(RED) {

    function HTML(config) {
        var configAsJson = JSON.stringify(config).replace(/[\/\(\)\']/g, "&apos;");

        var html;

            html = String.raw`
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

                    .iro-color-label{
                        padding:3px 6px 3px 6px;
                    }

                    .iro-color-widget{
                        padding:3px 6px 3px 6px;
                        display:flex;
                        margin:auto;
                        flex-direction: column;
                    }

                    .iro-color-button{
                        padding:3px 6px 3px 6px;
                    }

                    /* Modal Background */
                    .modal {
                        display:flex;
                        position: fixed;
                        z-index: 100 !important; /* Sit on top */
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
                        position: relative;
                        display: block;
                        margin: auto;
                    }
                </style>

                <script type='text/javascript' src='ui-iro-color-picker/js/iro.min.js'></script>
                <div class="iro-color-container" id="iro-color-container-${config.id}" style="display:flex; flex-direction: ${(config.placement==='above') ? "column" : "row"};" ng-init='init(` + configAsJson + `)'>
                    <div ng-if="${config.label != ""}" class="iro-color-label" id="iro-color-label-${config.id}" style="display:flex; justify-content:${config.hAlign}; align-items:${config.vAlign};  width:${(config.placement==='above') ? `unset` : (config.labelWidth-12)+'px'}; height:${config.labelHeight}px;">${config.label}</div>
                    <!-- ${(config.placement==='above') ? "</br>" : ""} -->         
                </div>
                `;

            return html;
        }

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_iro-color-picker.error.no-group"));
            return false;
        }
        return true;
    }

    var ui = undefined;

    function iroColorPickerUINode(config) {
        try {
            var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

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

                var getUiControl = function () {
                    return {
                        color : "#ffffff",
                        borderWidth : 0,
                        borderColor : "#ffffff",
                        padding : 6,
                        margin : 12,
                        handleRadius: 8,
                        activeHandleRadius: 8,
                        handleSvg: null,
                        handleProps: { x: 0, y: 0 },
                        wheelLightness: true,
                        wheelAngle: 0,
                        wheelDirection: "anticlockwise",
                        sliderSize: 28
                    }
                }
    
                var group = RED.nodes.getNode(config.group);
                config.groupId = group.id;
                config.site = getSiteProperties();
                config.ui_control = getUiControl();
                config.type = config.layout;
                config.totalWidth = (config.width == 0) ? parseInt(group.config.width) : parseInt(config.width);
                var widgetIndent = config.widgetIndent;
                if (widgetIndent<1 && config.label!=="") widgetIndent=3;
                if (config.placement==='above') widgetIndent=0;
                if (config.label==="") {
                    widgetIndent = 0;
                    config.labelWidth = 12;
                } else {
                    config.labelWidth = parseInt(config.site.sizes.sx * widgetIndent + config.site.sizes.cx * (widgetIndent - 1)) - 12;
                }
                config.widgetWidth = (config.pickerType.startsWith('popup')) ? config.totalWidth : config.totalWidth-widgetIndent;
                config.horizontalScale = 1;
                config.widgetBox = {
                    horizontalPx : parseInt(config.site.sizes.sx * config.widgetWidth + config.site.sizes.cx * (config.widgetWidth - 1)),
                    verticalPx : 0,
                    horizontalGrid : config.widgetWidth,
                    verticalGrid : 0,
                }
                // calculate an ideal rectangle for all components
                config.components.forEach(component => {
                    switch (component.componentId) {
                        case 'picker' :
                            config.widgetBox.verticalGrid += config.widgetBox.horizontalGrid;
                            config.widgetBox.verticalPx += config.widgetBox.horizontalPx;
                            break;
                        case 'box' :
                            if (component.options!==undefined && component.options.hasOwnProperty('boxHeight') && component.options.boxHeight>0) {
                                config.widgetBox.verticalGrid += Math.floor(component.options.boxHeight / (config.site.sizes.sy+config.site.sizes.cy)) + 1;
                                config.widgetBox.verticalPx += component.options.boxHeight;
                            } else {
                                config.widgetBox.verticalGrid += config.widgetWidth;
                                config.widgetBox.verticalPx += config.widgetBox.horizontalPx;
                            }
                            break;
                        case 'slider':
                            config.widgetBox.verticalGrid++;
                            config.widgetBox.verticalPx += config.ui_control.sliderSize;
                            break;
                    }
                    config.widgetBox.verticalPx += config.ui_control.margin;
                });
                config.widgetBox.verticalGrid = Math.floor(config.widgetBox.verticalPx / (config.site.sizes.sy+config.site.sizes.cy)) + 1;
                config.widgetBox.verticalPx -= config.ui_control.margin; // one margin to much!

                config.iroWidth = config.widgetBox.horizontalPx;
                // swap height and width if arranged horizontally
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
                    config.widgetHeightPx = config.widgetBox.verticalPx - 12 - 3;
                } else {
                    config.height =parseInt(config.height);
                    config.widgetHeightPx = parseInt(config.site.sizes.sy * config.height + config.site.sizes.cy * (config.height - 1)) - 12;
                    config.iroWidth = (config.layoutDirection==='horizontal') ? config.widgetHeightPx : config.widgetBox.horizontalPx;
                    if (config.layoutDirection==='horizontal') config.widgetBox.verticalPx = config.iroWidth;
                }

                // setup and scale width for popup
                if (config.pickerType.startsWith('popup')) {
                    config.buttonWidthPx = (config.buttonWidth>0) ? parseInt(config.site.sizes.sx * config.buttonWidth + config.site.sizes.cx * (config.buttonWidth-1)) - 12 : 100;
                    config.height = 1;
                    config.widgetWidthPx = config.widgetBox.horizontalPx;
                    config.widthFactor=(!config.pickerSize || Number(config.pickerSize)==NaN) ? 1 : Number(config.pickerSize)/100;
                    if (config.widthFactor<0.1) config.widthFactor=0.1;
                    if (config.widthFactor>5) config.widthFactor=5;
                    config.widgetWidthPx = config.widgetWidthPx * config.widthFactor;
                    config.widgetHeightPx = config.widgetHeightPx * config.widthFactor;
                    config.iroWidth = config.iroWidth * config.widthFactor;
                    config.labelHeight = config.site.sizes.sy-12;
                    if (config.layoutDirection==='horizontal') config.widgetBox.verticalPx *= config.widthFactor;
                    if (config.layoutDirection==='vertical') config.widgetBox.horizontalPx *= config.widthFactor;
                } else {
                    config.widgetWidthPx = parseInt(config.site.sizes.sx * config.widgetWidth + config.site.sizes.cx * (config.widgetWidth - 1)); // - 12;
                    config.iroWidth = (config.layoutDirection==='horizontal') ? config.widgetHeightPx-4 : (config.label==="") ? config.widgetWidthPx -20 : config.widgetWidthPx;
                    config.labelHeight = (config.widgetHeightPx * config.horizontalScale) -12;
                }


                if (config.placement==='above') {
                    config.widgetWidthPx -= 20;
                    config.iroWidth -= 20;
                    config.labelHeight = config.site.sizes.sy-12;
                    if (!config.pickerType.startsWith('popup')) {
                        if (config.layoutDirection==='horizontal') {
                            config.labelWidth = config.widgetWidthPx;
                            if (config.width==0) {
                                config.widgetWidthPx = config.widgetBox.horizontalPx;
                                config.labelWidth =  config.widgetWidthPx;   
                            }
                        } else {
                            config.labelWidth = config.iroWidth * config.horizontalScale;
                        }
                    } else {
                        config.width = (config.buttonWidth>0) ? config.buttonWidth : 2;
                        config.labelWidth = config.buttonWidthPx;
                    }
                    config.height++;
                }
                config.groupWidth = parseInt(config.site.sizes.sx * config.totalWidth + config.site.sizes.cx * (config.totalWidth - 1)) - 12;

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

                    convertBack: function (value) {
                        return value;
                    },

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

                    initController: function($scope, events) {
                        // debugger;
                        var iroDiv;
                        $scope.flag = true;   // not sure if this is needed?

                        const iroParameters = ['kelvin','red','green','blue','value','saturation','alpha','hue','index'];

                        /**
                        *  read $scope.colorToSend form picker color object
                        *   @param  {object} color  iro.js color object
                        *   @return {void}
                        */
                        var updateColorToSend = function (color) {
                            switch ($scope.config.outFormat) {
                                case 'tuneable':
                                    if ($scope.colorToSend===undefined) $scope.colorToSend={};
                                    if (color.sliderType==="value") {
                                        $scope.colorToSend.v = color.value;
                                    };   
                                    if (color.sliderType==="kelvin") {
                                        $scope.colorToSend.t = color.kelvin;
                                    };                                    
                                    break;
                                default:
                                    $scope.colorToSend = color[$scope.config.outFormat];
                            }
                        }

                        /**
                        *  updates the color if it is changed. Updates button and background if necessary
                        *   @param  {object} color  iro.js color object
                        *   @param  {boolean} send  send message to backend if true
                        *   @return {void}
                        */
                        var colorUpdate = function (color, send = true) {
                            var colorHex8String = color.hex8String;
                            updateColorToSend(color);
                            // console.log('colorUpdate:',$scope.iroColorValue,colorHex8String);
                            if ($scope.iroColorValue!==colorHex8String || (send && $scope.lastSent!==JSON.stringify($scope.colorToSend))) { // limit updates to "new" colors
                                $scope.iroColorValue = colorHex8String;
                                if ($scope.btn) $scope.btn.style["background-color"] = colorHex8String;
                                if ($scope.modal) $scope.modal.style.backgroundColor = color.hexString + Math.floor($scope.config.backgroundDim / 100*255).toString(16);
                                if (send && !$scope.sendHold) {
                                    $scope.send({state:$scope.colorToSend});
                                    $scope.lastSent = JSON.stringify($scope.colorToSend);
                                    if ($scope.config.outputLimit && $scope.config.outputLimit>0) {
                                        $scope.sendHold = true;
                                        setTimeout(function () {delete $scope.sendHold;},1000/$scope.config.outputLimit);
                                    }
                                }
                            }
                            if ($scope.config.outFormat==="tuneable" && color.sliderType==="kelvin") {
                                $scope.iroColorPicker.forEach(picker => {
                                    if (picker.color.sliderType==='value') {
                                        let value = picker.color.value;
                                        picker.color.kelvin = color.kelvin; 
                                        picker.color.value = value;
                                        console.log('tuneable',picker.color.value,picker,color.kelvin);
                                    }
                                });
                            };
                        }

                        /**
                        *  creates an button to open modal iro.js popup
                        *   -   destroys existing instance
                        *   @return {void}
                        */
                        var createIroButton = function () {
                            $scope.btn = document.createElement("div");
                            $scope.btn.setAttribute("class", "md-raised md-button md-ink-ripple");
                            $scope.btn.setAttribute("type", "button");
                            $scope.btn.setAttribute("id", "iro-modal-button_"+$scope.config.id);
                            $scope.btn.setAttribute("style", `background-color: ${$scope.iroColorValue}; min-width: unset; width:${$scope.config.buttonWidthPx}px; margin-top:0px`);
                            $scope.btn.innerHTML = "&nbsp;"
                            $scope.btn.addEventListener("click",  function(e) {
                                $scope.colorButtonPress(e);
                            });

                            document.getElementById(`iro-color-container-${$scope.config.id}`).appendChild($scope.btn);
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
                            //console.log("createIro",$scope.config);
                            if (!document.querySelector(iroDiv)) {
                                // <div id='ui_iro_color_picker-{{$id}}' style="width:${config.widgetWidthPx}px; background-color:unset; border:unset;"></div>
                                var pickerDiv = document.createElement("div");
                                pickerDiv.setAttribute("class", 'iro-color-widget');
                                pickerDiv.setAttribute("width", `${$scope.config.widgetWidthPx}px`);
                                pickerDiv.setAttribute("id", 'ui_iro_color_picker-' + $scope.$eval('$id'));
                                document.getElementById(`iro-color-container-${$scope.config.id}`).appendChild(pickerDiv);
                            }
                            if($scope.iroColorPicker !== undefined) {
                                $scope.iroColorPicker.forEach(picker => picker.destroy());
                            }
                            var minTemperature = 3000;
                            if ($scope.config.outFormat==="tuneable") { // find min temperature
                                $scope.opts.forEach(opts => {
                                    if (opts.layout[0].options.sliderType==='kelvin') minTemperature=opts.layout[0].options.minTemperature;
                                });
                            }

                            $scope.iroColorPicker = [];
                            $scope.opts.forEach((opts,index) => {
                                opts.color = $scope.iroColorValue;
                                $scope.iroColorPicker.push(new iro.ColorPicker(iroDiv, opts));
                                $scope.iroColorPicker[index].color.sliderType=opts.layout[0].options.sliderType;
                                
                                if ($scope.config.outFormat==="tuneable") { // default settings for tuneable sliders
                                    $scope.iroColorPicker[index].color.kelvin = minTemperature;
                                    if ($scope.iroColorPicker[index].color.sliderType==="value") $scope.iroColorPicker[index].color.value = 0
                                }
                                updateColorToSend($scope.iroColorPicker[index].color);
                                $scope.iroColorPicker[index].on('input:start', function (color) {
                                    // console.log('input started', color.hex8String);
                                    $scope.inputStarted = true;
                                    $scope.btn = document.getElementById(`iro-modal-button_${$scope.config.id}`);
                                    if ($scope.config.backgroundVariable) {
                                        $scope.modal = document.getElementById(`colorModal-${$scope.config.id}`);
                                    }
                                });
                                $scope.iroColorPicker[index].on('input:end', function (color) {
                                    $scope.inputStarted = false;
                                    $scope.coolDown = color.hex8String.hex8String;
                                    // console.log('input ended', color);
                                    colorUpdate(color);
                                });
                                $scope.iroColorPicker[index].on('input:move', function (color) {
                                    // console.log('input moved: ', color.hex8String);
                                    colorUpdate(color, ($scope.config.dynOutput==='input:move'));
                                });
                                if (index < $scope.opts.length-1) {
                                    let spacerDiv = document.createElement("div");
                                    spacerDiv.style.height = `${$scope.config.ui_control.margin}px`;
                                    spacerDiv.style.width = `${$scope.config.widgetWidthPx}px`;
                                    document.getElementById('ui_iro_color_picker-' + $scope.$eval('$id')).appendChild(spacerDiv);
                                }
                            });
                        }

                        $scope.init = function (config) {
                            $scope.config = config;
                            iroDiv = '#ui_iro_color_picker-' + $scope.$eval('$id');

                            if ($scope.config.outFormat==="tuneable") {
                                if ($scope.iroColorValue===undefined)  $scope.iroColorValue = config.iroColorValue || {r: 255, g: 255, b: 255};
                                $scope.opts = [];
                                config.components.forEach((component,index) => {
                                    if (component.options.sliderType==='kelvin' || component.options.sliderType==='value' ) {
                                        $scope.opts.push({
                                            width: config.iroWidth * config.horizontalScale, // config.widgetWidthPx,
                                            handleRadius : 8 * config.horizontalScale,
                                            padding : 6 * config.horizontalScale,
                                            color: $scope.iroColorValue,
                                            layoutDirection: config.layoutDirection,
                                            layout: [{
                                                "component": iro.ui.Slider,
                                                "options": component.options
                                            }],
                                        });
                                    }
                                });
                            } else {
                                    console.log("init",$scope.config.label,$scope);
                                    if ($scope.iroColorValue===undefined)  {
                                        $scope.iroColorValue = config.iroColorValue || {r: 255, g: 0, b: 0};
                                        $scope.initColor = config.iroColorValue;
                                    } else {
                                        if ($scope.initColor !== config.iroColorValue) {
                                            $scope.iroColorValue = config.iroColorValue;
                                            $scope.initColor = config.iroColorValue;
                                        }
                                    }
                                    $scope.opts=[{
                                        width: config.iroWidth * config.horizontalScale, // config.widgetWidthPx,
                                        handleRadius : 8 * config.horizontalScale,
                                        padding : 6 * config.horizontalScale,
                                        color: $scope.iroColorValue,
                                        layoutDirection: config.layoutDirection,
                                        layout: [],
                                    }];
                                    config.components.forEach(component => {
                                        $scope.opts[0].layout.push({
                                            "component":    (component.componentId==='picker') ? iro.ui.Wheel :
                                                            (component.componentId==='box') ? iro.ui.Box :
                                                            (component.componentId==='slider') ? iro.ui.Slider : null,
                                            "options": component.options
                                    });
                                });
                            }
                            if (config.pickerType.startsWith('popup')) {
                                createIroButton();
                            } else {
                                createIro();
                            }
                        };

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
                                    $scope.lastData[paramter] = Number(msg[paramter]);
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
                                //console.log('msg discarded: socketid present - exiting');
                                return;
                            }
                            // exit here during 'sliding'
                            if ($scope.inputStarted) {
                                //console.log('msg discarded: input started - exiting');
                                return;
                            }
                            // exit if msg == lastSend
                            if ($scope.lastSent===JSON.stringify(msg.state)) {
                                //console.log('msg discarded: msg.state == lastSend - exiting');
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
                            if ($scope.config.outFormat!=="tuneable") {
                                if ($scope.iroColorPicker!==undefined && $scope.iroColorPicker[0]!==undefined && $scope.iroColorPicker[0].color!==undefined){
                                    $scope.iroColorPicker[0].color.set($scope.iroColorValue);
                                }
                            } else { // handle tuneable white
                                var newColor={
                                    "kelvin" : (msg.kelvin) ? msg.kelvin : $scope.colorToSend.t,
                                    "value" : (msg.value) ? msg.value : $scope.colorToSend.v
                                };
                                if (typeof msg.state === "object" && (msg.state.hasOwnProperty('v') && msg.state.hasOwnProperty('t'))) {
                                    newColor.value = msg.state.v;
                                    newColor.kelvin = msg.state.t;
                                }
                                console.log('new color:',newColor,msg);
                                $scope.config.components.forEach((component,index) => {
                                    if ($scope.iroColorPicker[index].color.sliderType==='value') {
                                        console.log('newKelvin',newColor);
                                        $scope.iroColorPicker[index].color.kelvin = newColor.kelvin;
                                        $scope.iroColorPicker[index].color.value = newColor.value;
                                    } else {
                                        $scope.iroColorPicker[index].color[component.options.sliderType] = newColor[component.options.sliderType];
                                    }
                                    updateColorToSend($scope.iroColorPicker[index].color);
                                });
                                //console.log('colorToSend:',$scope.colorToSend);
                            }
                            // console.log('color set to ',$scope.iroColorValue);

                            if ($scope.btn) $scope.btn.style["background-color"]=$scope.iroColorValue;

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

                        $scope.change = function() {
                            // console.log('scope change');
                            //$scope.send({payload: $scope.textContent});
                        };

                        $scope.colorButtonPress = function(e){
                            if(document.getElementById(`colorModal-${$scope.config.id}`)) {
                                document.getElementsByTagName("body")[0].removeChild(document.getElementById(`colorModal-${$scope.config.id}`));
                            };

                            var modal = document.getElementsByTagName("body")[0].appendChild(document.createElement("div"));
                            modal.id=`colorModal-${$scope.config.id}`;
                            modal.classList.add("modal");
                            modal.style.backgroundColor = $scope.config.backgroundColor+Math.floor($scope.config.backgroundDim / 100*255).toString(16);
                            
                            var modalContent = modal.appendChild(document.createElement("div"));
                            modalContent.id=`modal-content-${$scope.config.id}`;
                            modalContent.classList.add("modal-content");
                            
                            var colorPicker = modalContent.appendChild(document.createElement("div"));
                            colorPicker.setAttribute("id", 'ui_iro_color_picker-' + $scope.$eval('$id'));
                            colorPicker.classList.add(`ui_iro_color_picker-${$scope.config.id}`);

                            var positionLeft = undefined;
                            var positionTop = undefined;
                            var pickerType = $scope.config.pickerType;
                            var widgetPos = undefined;
                            
                            switch (pickerType) {
                                case 'popupCG':
                                    widgetPos = document.getElementById(`iro-color-container-${$scope.config.id}`).getBoundingClientRect();
                                    positionTop = widgetPos.y + widgetPos.height/2- $scope.config.widgetBox.verticalPx/2;
                                    positionLeft = widgetPos.x + widgetPos.width/2 - $scope.config.widgetBox.horizontalPx/2;
                                    break;
                                case 'popupCC':
                                    widgetPos = document.getElementById(`iro-modal-button_${$scope.config.id}`).getBoundingClientRect();
                                    positionTop = widgetPos.y + widgetPos.height/2- $scope.config.widgetBox.verticalPx/2;
                                    positionLeft = widgetPos.x + widgetPos.width/2 - $scope.config.widgetBox.horizontalPx/2;
                                break;
                            }

                            var boxVerticalPx = $scope.config.widgetBox.verticalPx + $scope.config.ui_control.margin;
                            var boxHorizontalPx = $scope.config.widgetBox.horizontalPx + 6;

                            console.log('popup',$scope.config.widgetBox);

                            if (positionTop + boxVerticalPx > window.innerHeight) positionTop = window.innerHeight - boxVerticalPx;
                            if (positionLeft + boxHorizontalPx > window.innerWidth) positionLeft = window.innerWidth - boxHorizontalPx;
                        
                            if (positionTop<6) positionTop = 6;
                            if (positionLeft<6) positionLeft = 6;
                            
                            if(positionLeft && positionTop){
                                modalContent.style.marginLeft = positionLeft + "px";
                                modalContent.style.marginTop = positionTop + "px";
                            }
                            modal.style.display = "flex";
                            document.ontouchmove = (e) => e.preventDefault();
                            createIro();


                            // When the user clicks anywhere outside of the modal, close it
                            window.onclick = function(event) {
                                var modal = document.getElementById(`colorModal-${$scope.config.id}`);
                                if (event.target == modal) {
                                    delete $scope.iroColorPicker;
                                    document.ontouchmove = (e) => true;
                                    document.getElementsByTagName("body")[0].removeChild(document.getElementById(`colorModal-${$scope.config.id}`));
                                }
                            }

                        };
                    }
                });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);		// catch any errors that may occur and display them in the web browsers console
        }

        // If you need to do any handling before closing do it here then call done().
        node.on("close", function() {
            if (done) {
                done();
            }
        });
    }

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
