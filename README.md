node-red-contrib-ui-iro-color-picker
====================================

Alternative color picker node utilizing the [iro.js](https://iro.js.org) widget. The main credit goes to [James](https://jamesdaniel.dev/), thank you for this nice widget.

The node-red node is highly customizable inside the editor by choosing and combining several components either as a widget or a popup window.

This is my first dashboard node so any input is highly appreciated.

**My main goal of getting a colour picker on mobile devices usable with my thumb is not achieved jet. I could not solve the modal popup to be exclusively on top of everything else. If someone more experienced than I in safari or angular could perhaps help me:**

# help needed
- fix modal popup on safari (some other ui elements still are shown above the picker widget) Any iOS / Safari / webkit expert?

## screenshots

![as widget](https://raw.githubusercontent.com/Christian-Me/node-red-contrib-ui-iro-color-picker/master/doc/widgets.png)
![as popup](https://raw.githubusercontent.com/Christian-Me/node-red-contrib-ui-iro-color-picker/master/doc/popup.png)

## Install

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing Node-RED-dashboard.

    npm i node-red-contrib-ui-iro-color-picker

## Inputs
Send `msg.payload` to this node to change the color of the color picker widget. The format can be any of the color formats iro.js supports
- Hex string: "#ff0000"
- Hex alpha string: "#ff0000ff"
- Shorthand hex string: "#f00"
- Shorthand hex alpha string: "#f00f"
- RGB string: "rgb(255, 0, 0)"
- RGBA string: "rgba(255, 0, 0, 1)"
- Percentage RGB string: "rgb(100%, 0%, 0%)"
- Percentage RGBA string: "rgba(100%, 0%, 0%, 100%)"
- RGB object: {r: 255, g: 0, b: 0}
- RGBA object: {r: 255, g: 0, b: 0, a: 1}
- HSL string: "hsl(360, 50%, 100%)"
- HSLA string: "hsla(360, 50%, 100%, 1)"
- HSL object: {h: 360, s: 50, l: 100}
- HSLA object: {h: 360, s: 50, l: 100, a: 1}
- HSV object: {h: 360, s: 100, v: 50}
- HSVA object: {h: 360, s: 100, v: 50, a: 1}

in addition the following input formats are supported to set individual parameters
- `msg.hue` 0 - 360
- `msg.value` 0 - 100
- `msg.saturation` 0 - 100
- `msg.red` 0 - 255
- `msg.yellow` 0 - 255
- `msg.blue` 0 - 255
- `msg.alpha` 0 - 1
- `msg.kelvin` 2.000 - 40.0000

if a numeric `msg.payload` is received it is assumed that the value corresponds to the output format. **In this case the output format has be set to a single value format too!**

Send `msg.enable` **false** to disable the widget.

## Outputs
Node will send the color value as `msg.payload`. The format can be defined in the configuration dialog

## General configuration

- **Label**:
    - a text string to show on the left
    - an indent for the widget to align the widget nicely 
- **Type**:
    The node can showup as a widget or a popup window
    - as widget the picker will be placed in the remaining space left by the label. Depending of the selected components the widget will take the necessary height or scaled to fit.
    - *popup center click* centered to the current mouse position
    - *popup center group* centered to the group
    - *popup center window* centered in the browser window
    - if as popup the widget can be scaled relative to the group width
    - the background color and alpha can be specified
    - the background can follow the picked color
- **bypass messages** select this to pass all incoming messages to the output
- **send**
    - **when released** send a message when the user release the mouse button
    - **on user interaction** send on every user interaction
        - the output can be limited either by a maximum frequency or dynamically
        - if *when confirmed* is checked new messages are blocked until the last message is confirmed by the backend. This should adopt the updates according to the backend speed and the network
        - if unchecked a maximum update frequency in messages per second can be defined.
- **payload** choose the desired output format.
- **topic** topic to be added to the message
- **name** name of the node inside the editor

## Component configuration

iro.js offers a variety of different color picker styles. These can be combined as required showing a part of the color definition

- **direction** the components can be arranged either vertically or horizontally
- **components** a combination out of several components can be selected and sorted. 
    - Each component has these general options
        - **border** color
        - **width** border width in pixel. 0 or none to disable
    - *color wheel*: The classic color wheel showing the hue. (Should be combined with a saturation slider)
        - *lightness* **fade** to fade the wheel according to the lightness level **constant** to show full colors only
        - *starting angle* of 0° hue level
        - *direction* of the color wheel to be drawn
    - *color box*: Classic color box showing the saturation and lightness of a color. (Should be combined with a hue slider or wheel)
        - the hight in pixel of the box can be specified. 0 or none for a square
    -  *sliders* several different sliders can be selected and combined
        - *hue*
        - *saturation*
        - *value* (lightness)
        - *red*
        - *green*
        - *blue*
        - *alpha* (transparency)
        - *color temperature* in ° Kelvin
            - minimum value (>2.000°K)
            - maximum value (<40.000°K)

## Changelog

### 0.0.4
- partial fix for safari issue: Display seams OK but taps/clicks are still poking through **any support appreciated**
- single value payloads
- extra output format for tunable whites `{v:100,t:6000}` **experimental**
- fix for single hue slider
- msg.topic defaults correctly
- hsl and hsla output fixed
- fixes for horizontal stacking
- fixes for widgets without a label

## Requirements
- Node-RED v19.4 or greater
- Node-RED-dashboard v2.13.0 or greater

