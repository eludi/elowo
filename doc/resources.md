# resource handling

Most applications do not solely consist of program code, but also require some static assets, which usually are termed _resources_. Originally the web exclusively consisted of static resources, so it is not surporising that they play a central role in modern web applications as well.

## Supported file formats

Elowo supports the following resource formats:
- PNG and JPEG raster images
- SVG vector graphics
- MP3 audio
- WOFF2 fonts (not on Edge browser)
- TXT plain text files
- JSON structured data
- JavaScript libraries/code chunks

## Resource management

The resource management screen is opened via the following button in elowo's editor top bar:
![resources icon](doc/resources.svg)

On this screen you find an overview on the currently defined resources. Furthermore, it allows you to 
- ![import icon](doc/import.svg) import new resources from the local file system
- ![export icon](doc/export.svg) export all resources as a zip archive to the local file system

## Resource access

Within the application's source code, resources can be accessed via the method `app.getResource(name)` . For a detailed example, refer to [test_resources](./#./applets/test_resources.json).

Font resources need to be referenced in an element's style or canvas font attribute by their font name, which derives from the file name (file name without suffix, dash characters replaced by spaces, first letters of words uppercase, all other letters lowercase):

```javascript
let ctx = app.getCanvasContext();
// set font to metro-maestro.woff2 at a size of 24px:
ctx.font = '24px Metro Maestro';
ctx.fillText('font test', 50, 50);
```
