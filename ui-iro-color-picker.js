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
                        padding:0px 6px 3px 6px;
                    }

                    .iro-color-widget{
                        padding:unset;
                        display:flex;
                        margin:auto;
                        flex-direction: column;
                        white-space:nowrap;
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
                    <div ng-if="${config.label != ""}" class="iro-color-label" id="iro-color-label-${config.id}" style="display:flex; justify-content:${config.hAlign}; align-items:${config.vAlign};  width:${(config.placement==='above') ? `unset` : (config.labelProperties.x-12)+'px'}; height:${config.labelProperties.y-12}px;">${config.label}</div>
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
                var group = RED.nodes.getNode(config.group);
                config.groupId = group.id;

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
                config.site = getSiteProperties();

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
                config.ui_control = getUiControl();

    
                /**
                *  calculate horizontal dimension in pixel out of grid units
                *   @param  {number} gridX  width in number of grids 
                *   @return {number} dimension in pixel
                **/
                var getX = function(gridX) {
                    return ((gridX===0) ? 0 : parseInt(config.site.sizes.sx * gridX + config.site.sizes.cx * (gridX - 1)));
                }
                /**
                *  calculate vertical dimension in pixel out of grid units
                *   @param  {number} gridY  height in number of grids 
                *   @return {number} dimension in pixel
                **/
                var getY = function(gridY) {
                    return ((gridY===0) ? 0 : parseInt(config.site.sizes.sy * gridY + config.site.sizes.cy * (gridY - 1)));
                }
                /**
                *  calculate label properties
                *   @param  {object} config  dashboard widget config
                *   @return {object} label properties
                **/
                var getLabelProperties = function (config) {
                    var label = {width:parseInt(config.width), height:1, indent: parseInt(config.widgetIndent), placement: config.placement,x:0, y:0};
                    if (config.label!=="") {
                        if (label.placement==='above') {
                            label.width = (label.width>0) ? label.width : parseInt(group.config.width);
                            label.indent = 0;
                        } else {
                            label.width = (label.indent>0) ? label.indent : 2;
                            label.indent = label.width;
                        }
                    } else {
                        label.indent = 0;
                        label.width = 0;
                        label.height = 0;
                    }
                    label.x= getX(label.width);
                    label.y= getY(label.height);
                    //console.log(`getLabelProperties(config)`,label);
                    return label;
                }
                /**
                *  calculate widget properties
                * 
                *  **must be called after `getLabelProperties()`**
                *   @param  {object} config  dashboard widget config
                *   @return {object} widget properties
                **/
                var getWidgetProperties = function (config) {
                    var widget = {width:parseInt(config.width), height:parseInt(config.height)};
                    if (widget.width<1) { // auto mode
                        widget.width = parseInt(group.config.width) - ((config.placement==='above') ? 0 : config.labelProperties.width);
                        widget.height = (config.pickerType.startsWith('popup')) ? 1 : widget.width; // lets assume a square widget for now
                        if (config.labelProperties.placement==='above') widget.height -= 1;
                    }
                    widget.x = getX(widget.width);
                    widget.y = getY(widget.height);
                    if (config.labelProperties.indent<1) {
                        widget.x -=12; // if no label on the left reduce by label margin left
                    } else {
                        if (config.layoutDirection==='horizontal') {
                            widget.y -= 12; // if vertically arranged reduce by label margin top;
                        }
                    }
                    //console.log(`getWidgetProperties(config)`,widget);
                    return widget;
                }
                /**
                *  calculate popup properties
                *   @param  {object} config  dashboard widget config
                *   @return {object} popup properties
                **/
                var getPopupProperties = function (config) {
                    var popup = {width:parseInt(config.popupWidth || 0), height:parseInt(config.popupHeight || 0)};
                    if (popup.width < 1) popup.width = parseInt(group.config.width);
                    popup.x = getX(popup.width);
                    popup.y = getY(popup.height);
                    popup.buttonX = (config.buttonWidth>0) ? getX(config.buttonWidth) - 12 : 100;
                    popup.buttonY = getY(1) - 12;


                    //console.log(`getPopupProperties(config)`,popup);
                    return popup;
                }
                /**
                *  calculate iro.js properties
                *   @param  {object} config  dashboard widget config
                *   @param  {number} baseWidth  target width of the iro widget in pixel
                *   @return {object} iro properties
                **/
                var getIroProperties = function (config,baseWidth) {
                    var iro = {scale:1,x:baseWidth,y:0,width:config.widgetProperties.width,height:1};
                    config.components.forEach(component => {
                        switch (component.componentId) {
                            case 'picker' :
                                iro.y += iro.x;
                                break;
                            case 'box' :
                                if (component.options!==undefined && component.options.hasOwnProperty('boxHeight') && component.options.boxHeight>0) {
                                    iro.y += component.options.boxHeight;
                                } else {
                                    iro.y += iro.x;
                                }
                                break;
                            case 'slider':
                                iro.y += config.ui_control.sliderSize;
                                break;
                        }
                        iro.y += config.ui_control.margin;
                    });
                    iro.y -= config.ui_control.margin; // one margin to much!
                    // swap x and y if arranged horizontally
                    if (config.layoutDirection==='horizontal') {
                        let tempPx = iro.x;
                        iro.x=iro.y;
                        iro.y=tempPx;
                        if (iro.x>baseWidth-12) { // if rotated the horizontal size can exceed the available with
                            iro.scale = (baseWidth-12) / iro.x;
                            iro.x *= iro.scale;
                            iro.y *= iro.scale;
                        }
                        iro.iroWidth =iro.y; 
                    } else {
                        iro.iroWidth =iro.x; 
                    }
                    // recalculate the necessary height to fit all components
                    iro.height = Math.floor(iro.y/parseInt(config.site.sizes.sy + config.site.sizes.cy))+1;
                    if (config.height>0 && iro.height<config.height) iro.height = parseInt(config.height);
                    iro.width = Math.floor(iro.x/parseInt(config.site.sizes.sx + config.site.sizes.cx))+1;
                    if (iro.width>(group.config.width-config.label.width)) iro.width = group.config.width-config.label.width;
                    if (!config.pickerType.startsWith('popup')) {
                        config.widgetProperties.x=iro.x;
                        config.widgetProperties.width=iro.width;
                    }
                    //console.log(`getIroProperties(config,${baseWidth})`,iro)
                    return iro;
                }

                // calculate ui dimensions
                //console.log(config.label);
                config.labelProperties = getLabelProperties(config);
                config.widgetProperties = getWidgetProperties(config);
                if (config.pickerType.startsWith('popup')) {
                    config.popupProperties = getPopupProperties(config);
                    config.iroProperties = getIroProperties(config, config.popupProperties.x);
                    config.height = (config.label!=='' && config.placement==='above') ? 2 : 1;
                    config.popupProperties.x = config.iroProperties.x;
                    config.popupProperties.y = config.iroProperties.y;
                    config.popupProperties.width = config.iroProperties.width;
                    config.popupProperties.height = config.iroProperties.height;
                } else {
                    config.iroProperties = getIroProperties(config, (config.layoutDirection==='horizontal') ? config.widgetProperties.y : config.widgetProperties.x);
                    config.widgetProperties.height = config.iroProperties.height;
                    config.widgetProperties.y = config.iroProperties.y;
                    config.height = config.widgetProperties.height + (config.placement==='above');
                }
                // correct label height to actual widget height
                config.labelProperties.height = (config.placement==='above') ? 1 : config.widgetProperties.height;
                config.labelProperties.y = (config.placement==='above') ? getY(1) : config.widgetProperties.y;
                
                config.width =  config.widgetProperties.width + ((config.placement==='above') ? 0 : config.labelProperties.width);
                //console.log(`size: ${config.width}x${config.height}`);
                switch (config.outFormat) {
                    case 'rgbw':
                        config.frontendOutFormat = 'hsv';
                        break;
                    case 'hsi':
                        config.frontendOutFormat = 'rgb';
                        break;
                    default:
                        config.frontendOutFormat = config.outFormat;
                        break;
                }

                node.on("input", function(msg) {
                    node.topi = msg.topic;
                });

                /**
                *  check if all of the given keys are present in an object
                *   @param  {object} objectToTest Object to test
                *   @param  {array} keys Array of stings containing the property names
                *   @return {boolean} = true if ALL given keys are present
                */
                var hasProperties = function (objectToTest,keys) {
                    for (var key of keys) {
                        if (!objectToTest.hasOwnProperty(key)) return false;
                    }
                    return true;
                }
                /**
                *  limit value between min and max value
                *   @param  {number} x Value
                *   @param  {number} min = 0 Minimum
                *   @param  {number} max = 1 Maximum
                *   @return {number} adjusted value
                */
                var limit = function (x, min=0, max=1) {
                    return x < min ? min : x > max ? max : x;
                }
                const {min,sqrt,acos,cos,atan} = Math;
                const PI = Math.PI;
                const TWOPI = Math.PI*2;
                const PITHIRD = Math.PI/3;
                /**
                *  convert hsi into rgb
                *   @param  {object} input {h:360,s:100,i:100}
                *   @return {object} {r:255,g:255,b:255}
                */
                var hsi2rgb = function (input) {
                    let h = input.h;
                    let s = input.s / 100;
                    let i = input.i / 100;
                    let r,g,b;
                
                    if (isNaN(h)) h = 0;
                    if (isNaN(s)) s = 0;
                    // normalize hue
                    if (h > 360) h -= 360;
                    if (h < 0) h += 360;
                    h /= 360;
                    if (h < 1/3) {
                        b = (1-s)/3;
                        r = (1+s*cos(TWOPI*h)/cos(PITHIRD-TWOPI*h))/3;
                        g = 1 - (b+r);
                    } else if (h < 2/3) {
                        h -= 1/3
                        r = (1-s)/3
                        g = (1+s*cos(TWOPI*h)/cos(PITHIRD-TWOPI*h))/3
                        b = 1 - (r+g)
                    } else {
                        h -= 2/3
                        g = (1-s)/3
                        b = (1+s*cos(TWOPI*h)/cos(PITHIRD-TWOPI*h))/3
                        r = 1 - (g+b)
                    }
                    var output = {
                        r: limit(i*r*3) * 255,
                        g: limit(i*g*3) * 255,
                        b: limit(i*b*3) * 255
                    }
                    //console.log(`hsi2rgb`, input,output);
                    return output;
                }
                /**
                *  convert rgb into hsi
                *   @param  {object} input  {r:255,g:255,b:255}
                *   @return {object} {h:360,s:100,i:100}
                */
                var rgb2hsi = function (input) {
                    var r = input.r / 255;
                    var g = input.g / 255;
                    var b = input.b / 255;

                    let h = 0;
                    const min_ = min(r,g,b);
                    const i = (r+g+b) / 3;
                    const s = i > 0 ? 1 - min_/i : 0;
                    if (s === 0) {
                        h = 0; 
                    } else {
                        h = ((r-g)+(r-b)) / 2;
                        h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
                        h = acos(h);
                        if (b > g) {
                            h = TWOPI - h;
                        }
                        h /= TWOPI;
                    }
                    var output = {
                        h: limit(h)*360,
                        s: limit(s)*100,
                        i: limit(i)*100
                    }
                    //console.log(`rgb2hsi`, input,output);
                    return (output);

                }
                /**
                *  convert rgbw color model into hsv
                *   @param  {object} input {r:255,g:255,b:255}
                *   @return {object} {h:360,s:100,v:100}
                    */
                var rgbw2hsv = function (input) {
                    let r = limit(input.r,0,255);
                    let g = limit(input.g,0,255);
                    let b = limit(input.b,0,255);
                    let w = limit(input.w,0,255);

                    // calculate hue out of the rgb component only
                    let H = 0;
                    const min_ = min(r,g,b);
                    const i = (r+g+b) / 3;
                    const s = i > 0 ? 1 - min_/i : 0;
                    if (s === 0) {
                        H = 0; 
                    } else {
                        H = ((r-g)+(r-b)) / 2;
                        H /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
                        H = acos(H);
                        if (b > g) {
                            H = TWOPI - H;
                        }
                        H /= TWOPI;
                    }
                        
                    // calculate saturation and value out of RGBW

                    let argH;
                    let argI;
                    // check what sector we are in
                    if (b == 0) {
                        // between 0 and 2*pi/3
                        argH = (g+r) / (2*r-g);
                        argI = r;
                    }
                    if (r == 0) {
                        // between 2*pi/3 and 4*pi/3
                        argH = (b+g) / (2*g-b);
                        argI = g;
                    }
                    if (g == 0) {
                        // between 4*pi/3 and 6*pi/3
                        argH = (r+b) / (2*b-r);
                        argI = b;
                    }

                    var I = (((3 * argI) / (1 + 1/argH)) + w) / 255;
                    var S = 1 - w / (255*I)

                    var output = {
                        h : limit(H) * 360,
                        s : limit(S) * 100,
                        v : limit(I) * 100
                    }
                    //console.log(`rgbw2hsv`, input,output);
                    return output;
                }
                /**
                *  convert hsv color model into rgbW
                *   @param  {object} input  {h:360,s:100,i:100}
                *   @return {object} {r:255,g:255,b:255}
                */
                // Source https://blog.saikoled.com/post/44677718712/how-to-convert-from-hsi-to-rgb-white
                var hsv2rgbw = function (input) {
                    fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };
                    var color = {r:0, g:0, b:0, w:0};
                    var cos_h, cos_1047_h;
                    var H = fmod(input.h,360); // cycle H around to 0-360 degrees
                    H = 3.14159*H/180; // Convert to radians.
                    var S = limit(input.s / 100);
                    var I = limit(input.v / 100);
                    var r,g,b,w;
                
                    if(H < 2.09439) {
                        cos_h = cos(H);
                        cos_1047_h = cos(1.047196667-H);
                        r = S*255*I/3*(1+cos_h/cos_1047_h);
                        g = S*255*I/3*(1+(1-cos_h/cos_1047_h));
                        b = 0;
                        w = 255*(1-S)*I;
                    } else if(H < 4.188787) {
                        H = H - 2.09439;
                        cos_h = cos(H);
                        cos_1047_h = cos(1.047196667-H);
                        g = S*255*I/3*(1+cos_h/cos_1047_h);
                        b = S*255*I/3*(1+(1-cos_h/cos_1047_h));
                        r = 0;
                        w = 255*(1-S)*I;
                    } else {
                        H = H - 4.188787;
                        cos_h = cos(H);
                        cos_1047_h = cos(1.047196667-H);
                        b = S*255*I/3*(1+cos_h/cos_1047_h);
                        r = S*255*I/3*(1+(1-cos_h/cos_1047_h));
                        g = 0;
                        w = 255*(1-S)*I;
                    }
                    var output = {
                        r: limit(r,0,255),
                        g: limit(g,0,255),
                        b: limit(b,0,255),
                        w: limit(w,0,255)
                    }
                    //console.log(`hsv2rgbw`, input,output);
                    return output;
                }
                
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
                        
                        if (msg) {
                            // Copy the socket id from the original input message. 
                            newMsg.socketid = msg.socketid;
                            
                            // Try to get the specified message fields, and copy those to predefined fixed message fields.
                            // This way the message has been flattened, so the client doesn't need to access the nested msg properties.
                            // See https://discourse.nodered.org/t/red-in-ui-nodes/29824/2
                            try {
                                // Get the new state value from the specified message field
                                newMsg.state = RED.util.getMessageProperty(msg, config.stateField || "payload");

                                if (hasProperties(newMsg.state,['r','g','b','w'])) {
                                    newMsg.state=rgbw2hsv(newMsg.state);    
                                } else {
                                    if (hasProperties(msg.state,['h','s','i'])) {
                                        newMsg.state = hsi2rgb(newMsg.state);    
                                    }
                                }

                                iroParameters.forEach(paramter => {
                                    if (msg.hasOwnProperty(paramter)) {
                                        newMsg[paramter] = RED.util.getMessageProperty(msg, paramter);
                                    }
                                });
                                console.log('beforeEmit: ',msg,newMsg);
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
                        //console.log('beforeEmit: ', newMsg);
                        return { msg: newMsg };
                    },

                    beforeSend: function (msg, orig) {
                        //console.log('beforeSend:',msg,orig,config.outFormat);
                        if (orig) {
                            var newMsg = {};

                            // Store the switch state in the specified msg state field
                            RED.util.setMessageProperty(newMsg, config.stateField, orig.msg.state, true)
                            //orig.msg = newMsg;
                            // convert 
                            switch (config.outFormat) {
                                case 'rgbw':
                                    newMsg.payload = hsv2rgbw(orig.msg.state);
                                    break;
                                case 'hsi':
                                    newMsg.payload = rgb2hsi(orig.msg.state);
                                    break;
                            }
                            node.status({green:"red", shape:'dot', text:orig.msg.rgb});
                            var topic = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                            if (topic) { newMsg.topic = topic; }
                            return newMsg;
                        }
                    },

                    initController: function($scope, events) {
                        var iroDiv;
                        $scope.flag = true;   // not sure if this is needed?

                        const iroParameters = ['kelvin','red','green','blue','value','saturation','alpha','hue','index'];

                        /**
                        *  read $scope.colorToSend form picker color object
                        *   @param  {object} color  iro.js color object
                        *   @return {void}
                        */
                        var updateColorToSend = function (color) {
                            switch ($scope.config.frontendOutFormat) {
                                case 'tuneable':
                                    if ($scope.colorToSend===undefined) $scope.colorToSend={};
                                    if (color.sliderType==="value") {
                                        $scope.colorToSend.v = color.value;
                                    };   
                                    if (color.sliderType==="kelvin") {
                                        $scope.colorToSend.t = color.kelvin;
                                    };                                    
                                    break;
                                /*
                                case 'rgbw':
                                    $scope.colorToSend = hsv2rgbw(color.hsv);
                                    break;
                                case 'hsi':
                                    $scope.colorToSend = rgb2hsi(color.rgb);
                                    break;
                                */
                                default:
                                    $scope.colorToSend = color[$scope.config.frontendOutFormat];
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
                            //console.log('colorUpdate:',$scope.colorToSend);
                            if ($scope.iroColorValue!==colorHex8String || (send && $scope.lastSent!==JSON.stringify($scope.colorToSend))) { // limit updates to "new" colors
                                $scope.iroColorValue = colorHex8String;
                                if ($scope.btn) $scope.btn.style["background-color"] = colorHex8String;
                                if ($scope.modal) $scope.modal.style.backgroundColor = color.hexString + Math.floor($scope.config.backgroundDim / 100*255).toString(16);
                                if (send && !$scope.sendHold) {
                                    $scope.send({state:$scope.colorToSend,rgb:color.hexString});
                                    $scope.lastSent = JSON.stringify($scope.colorToSend);
                                    if ($scope.config.outputLimit && $scope.config.outputLimit>0) {
                                        $scope.sendHold = true;
                                        setTimeout(function () {delete $scope.sendHold;},1000/$scope.config.outputLimit);
                                    }
                                }
                            }
                            if ($scope.config.frontendOutFormat==="tuneable" && color.sliderType==="kelvin") {
                                $scope.iroColorPicker.forEach(picker => {
                                    if (picker.color.sliderType==='value') {
                                        let value = picker.color.value;
                                        picker.color.kelvin = color.kelvin; 
                                        picker.color.value = value;
                                        //console.log('tuneable',picker.color.value,picker,color.kelvin);
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
                            $scope.btn.setAttribute("class", "md-raised md-button md-ink-ripple iro-color-button");
                            $scope.btn.setAttribute("type", "button");
                            $scope.btn.setAttribute("id", "iro-modal-button_"+$scope.config.id);
                            $scope.btn.setAttribute("style", `background-color: ${$scope.iroColorValue}; min-width: unset; width:${$scope.config.popupProperties.buttonX}px; height:${$scope.config.popupProperties.buttonY}px;margin-top:0px`);
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
                                // <div id='ui_iro_color_picker-{{$id}}' style="width:${config.widgetProperties.x}px; background-color:unset; border:unset;"></div>
                                var pickerDiv = document.createElement("div");
                                pickerDiv.setAttribute("class", 'iro-color-widget');
                                pickerDiv.setAttribute("style", `width:${$scope.config.widgetProperties.x}px;`);
                                pickerDiv.setAttribute("id", 'ui_iro_color_picker-' + $scope.$eval('$id'));
                                document.getElementById(`iro-color-container-${$scope.config.id}`).appendChild(pickerDiv);
                            }
                            if($scope.iroColorPicker !== undefined) {
                                $scope.iroColorPicker.forEach(picker => picker.destroy());
                            }
                            var minTemperature = 3000;
                            if ($scope.config.frontendOutFormat==="tuneable") { // find min temperature
                                $scope.opts.forEach(opts => {
                                    if (opts.layout[0].options.sliderType==='kelvin') minTemperature=opts.layout[0].options.minTemperature;
                                });
                            }

                            $scope.iroColorPicker = [];
                            $scope.opts.forEach((opts,index) => {
                                opts.color = $scope.iroColorValue;
                                $scope.iroColorPicker.push(new iro.ColorPicker(iroDiv, opts));
                                $scope.iroColorPicker[index].color.sliderType=opts.layout[0].options.sliderType;
                                
                                if ($scope.config.frontendOutFormat==="tuneable") { // default settings for tuneable sliders
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
                                    spacerDiv.style.width = `${$scope.config.widgetProperties.x}px`;
                                    document.getElementById('ui_iro_color_picker-' + $scope.$eval('$id')).appendChild(spacerDiv);
                                }
                            });
                        }

                        $scope.init = function (config) {
                            $scope.config = config;
                            iroDiv = '#ui_iro_color_picker-' + $scope.$eval('$id');

                            if ($scope.config.frontendOutFormat==="tuneable") {
                                if ($scope.iroColorValue===undefined)  $scope.iroColorValue = config.iroColorValue || {r: 255, g: 255, b: 255};
                                $scope.opts = [];
                                config.components.forEach((component,index) => {
                                    if (component.options.sliderType==='kelvin' || component.options.sliderType==='value' ) {
                                        $scope.opts.push({
                                            width: config.iroProperties.iroWidth,
                                            handleRadius : 8 * config.iroProperties.scale,
                                            padding : 6 * config.iroProperties.scale,
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
                                    //console.log("init",$scope.config.label,$scope);
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
                                        width: config.iroProperties.iroWidth,
                                        handleRadius : 8 * config.iroProperties.scale,
                                        padding : 6 * config.iroProperties.scale,
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
                            //console.log('color received:',msg);

                            // utilize the iro.Color API build in iro.js and update $scope.iroColorValue to 64bit RGBA string
                            if ($scope.iroColor === undefined) {
                                $scope.iroColor = new iro.Color();
                            }

                            if (msg.hasOwnProperty('state')){
                                if (typeof msg.state === "number") {
                                    try {
                                        $scope.iroColor[$scope.config.frontendOutFormat] = msg.state;
                                    } catch (e) {
                                        console.warn(`color conversion failed! Expected "${$scope.config.frontendOutFormat}" value, received:`,msg.state);		// catch any errors that may occur and display them in the web browsers console
                                        return;
                                    }
                                } else {
                                    try {
                                        var hasProperties = function (objectToTest,keys) {
                                            for (var key of keys) {
                                                if (!objectToTest.hasOwnProperty(key)) return false;
                                            }
                                            return true;
                                        }
                                        /*
                                        if (hasProperties(msg.state,['r','g','b','w'])) {
                                            $scope.iroColor.set(rgbw2hsv(msg.state));    
                                        } else {
                                            if (hasProperties(msg.state,['h','s','i'])) {
                                                $scope.iroColor.set(hsi2rgb(msg.state));    
                                            } else {
                                                $scope.iroColor.set(msg.state);
                                            }
                                        }
                                        */
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
                            if ($scope.config.frontendOutFormat!=="tuneable") {
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
                                //console.log('new color:',newColor,msg);
                                $scope.config.components.forEach((component,index) => {
                                    if ($scope.iroColorPicker[index].color.sliderType==='value') {
                                        //console.log('newKelvin',newColor);
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
                                    positionTop = widgetPos.y + widgetPos.height/2- $scope.config.popupProperties.y/2;
                                    positionLeft = widgetPos.x + widgetPos.width/2 - $scope.config.popupProperties.x/2;
                                    break;
                                case 'popupCC':
                                    widgetPos = document.getElementById(`iro-modal-button_${$scope.config.id}`).getBoundingClientRect();
                                    positionTop = widgetPos.y + widgetPos.height/2- $scope.config.popupProperties.y/2;
                                    positionLeft = widgetPos.x + widgetPos.width/2 - $scope.config.popupProperties.x/2;
                                break;
                            }

                            var boxVerticalPx = $scope.config.popupProperties.y + $scope.config.ui_control.margin;
                            var boxHorizontalPx = $scope.config.popupProperties.x + 6;

                            //console.log('popup',$scope.config.popupProperties);

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
