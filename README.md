node-red-contrib-ui-iro-color-picker
====================================

Alternative color picker node utilizing the [iro.js](https://iro.js.org) widget

The widget is highly customizable by choosing and combining several components

This is my first dashboard node so any input is highly appreciated.

# help needed
- synchronize state on all dashboards
- let the state survive reloads and new connections
- fix modal popup on safari (some other ui elements still are shown above the picker widget

## Install

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing Node-RED-dashboard.

    npm i node-red-contrib-ui-iro-color-picker

## Inputs
Send `msg.payload` to this node to change the color of the color picker widget.

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
    - *when released* send a message when the user release the mouse button
    - *on user interaction* send on every user interaction
    - *on color change* only if the resulting color changed
- **payload** choose the desired output format.
- **topic** topic to be added to the message
- **name** name of the node inside the editor

## Component configuration

iro.js offers a variety of different color picker styles. These can be combined as required showing a part of the color definition

- **direction** the components can be arranged either vertically or horizontally
- **components** a combination out of several components can be selected and sorted. Each component has there general options
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
            - minimum value (>2000°C)
            - maximum value (<40.000°C)
## Requirements
- Node-RED v19.4 or greater
- Node-RED-dashboard v2.13.0 or greater
