# elowo API reference

elowo runs in a browser window or as stand-alone web app and therefore allows its applets to access all standard Web APIs, as for example described at [MDN](https://developer.mozilla.org/docs/Web/API).

## Objects

In addition, elowo exposes a simplified application programming interface via the following objects:

- `app`
- `console`

### app

This object is elowo's main facade for simplified window and resource management.

Methods

- `app.getCanvasContext(layer=0, type='2d')`

    returns the drawing context of a canvas layer.

    If no arguments are given, the 2d context of layer 0 is returned, which exists by default. Other layers need to be added before usage via `app.addCanvasLayer()`.

- `app.setBackground(bg)`

    sets the global window background.

    The bg argument may be a color value string or a more complex [CSS background specification](https://developer.mozilla.org/docs/Web/CSS/background).

- `app.addEventListener(event, callback)`

    adds an event listener callback function to one of the elowo runtime environment events described in [Events](#Events)

- `app.getResource(id)`

    returns a resource identified by its name

- `app.addCanvasLayer(layer)`

    adds a new canvas layer to the current screen.

    The numeric layer number parameter also defines the layer's z index; a higher layer number puts the layer in front of layers having a lower layer number. New layers are initially visible.

- `app.addHTMLLayer(layer, innerHTML='')`

     adds a new HTML layer to the current screen.

    The first parameter defines the layer number and the layer's z index; a higher layer number puts the layer in front of layers having a lower layer number. The layer's inner HTML may be initialized with the second optional parameter. New layers are initially visible. Note that this method is currently an experimental feature that may likely change in future elowo releases.

- `app.getLayer(layer)`

    returns the DOM element corresponding to a given layer number

- `app.hideLayer(layer)`

    makes a layer invisible without removing it from the current screen's layer stack

- `app.showLayer(layer)`

    makes a hidden layer visible

- `app.addScreen(name)`

    adds a new screen to the current application.

    A screen is a collection of layers. The name of the default screen is `'output'`.

- `app.setScreen(name)`

    sets the current screen by its name


Properties

- `width`

    the current screen width measured in CSS px units

- `height`

    the current screen height measured in CSS px units

- `orientation`

    a constant describing the current screen orientation.

    Possible values are `'landscape-primary'`, `'landscape-secondary'`, `'portrait-primary'`, and `'portrait-secondary'`.

- `pixelRatio`

    the number of physical display pixels corresponding to a CSS px unit.

    Typical high-density (also called "retina") displays have pixel ratios of 2 or 3.

### console

Elowo's console is mainly a thin wrapper around the standard browser [console API](https://developer.mozilla.org/docs/Web/API/Console) with a few additional methods. Note that apart from `console.in()`, all these methods are chainable.
In addition to writing to the system's console, the following functions also write their arguments to a console overlay layer (visible by default on the `'output'` screen):

- `console.log(args...)`
- `console.warn(args...)`
- `console.error(args...)`

The following methods extend the standard system console:

- `console.hide()`

    hides the console layer

- `console.show()`

    makes the console visible

- `async console.in(prompt, defaultValue)`

    line-oriented text input

- `console.out(args...)`

    line-oriented text output.
    
    Unlike `console.log()`, this method does not parallely write to the system console.

- `console.color(color)`

    sets the text color using a [CSS color value](https://developer.mozilla.org/docs/Web/CSS/color_value)

- `console.background(bg)`

    sets the console's background.

    The bg argument may be a color value string or a more complex [CSS background specification](https://developer.mozilla.org/docs/Web/CSS/background). The default value is `'transparent'`.

- `console.width(w)`

    sets the console's width using a [CSS length](https://developer.mozilla.org/docs/Web/CSS/length) string

- `console.height(h)`

    sets the console's height using a [CSS length](https://developer.mozilla.org/docs/Web/CSS/length) string or a number, defining the number of lines

- `console.layer(layer)`

    sets the console's layer height (z index)

- `console.position(args...)`

    sets the console's position. Valid arguments are `'left'`, `'right'`, `'top'`, and `'bottom'`.


## <a name="Events"></a>Events

Callbacks for the following elowo-specific events can be registered via `app.addEventListener()`:

- `'resize`'

    called on applet startup and whenever the window size or orientation changes.

    callback arguments:
    - `width`:  the current screen width measured in CSS px units
    - `height`: the current screen height measured in CSS px units
    - `orientation`: a constant describing the current screen orientation.\
      Possible values are `'landscape-primary'`, `'landscape-secondary'`, `'portrait-primary'`, and `'portrait-secondary'`.

- `'update‘`

    called before every window redraw, usually 60 times per second, useful for smooth animations.

    callback arguments:
    - `deltaT`: time passed since the previous update event, measured in milliseconds
    - `now`: current timestamp, a [Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) object

- `'close'`

    called on applet shutdown

- `'pointer'`

    a simplified and portable abstraction over mouse, touch, and pen input events

    callback arguments:
    - `type`: event type, either `'start'`, `'move'`, `'end'`, or `'hover'`
    - `x`: event x coordinate measured in CSS px units
    - `y`: event y coordinate measured in CSS px units
    - `id`: mouse button or touch number
    - `device`: `'mouse'`, `'pen'`, or `'touch'`
