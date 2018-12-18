# elowo publishing guide

Currently elowo deliberately abstains from offering any built-in web service for sharing an applet between devices/users or publishing it on the world-wide web. However, the export and package features provide you convenient and flexible means for accomplishing this, without locking you into any proprietary service.

## applet export

The most basic approach to get an applet from one device to another is exporting the applet to the local file system and moving the file to a (network) location where it can be found and imported by the target device.

## manual applet sharing

Additionally, elowo is able to run exported applets directly from any web location reachable by your browser, provided that the applet is served with cross-origin resource sharing (CORS) enabled. This can preferably be your own web space, a [GitHub](https://github.com) page, but also some file sharing service or cloud storage such as Nextcloud or [Dropbox](https://www.dropbox.com) will do. In Dropbox, for example, you can create a web link to your applet via the Share functionality.  Then anyone knowing the link can run this applet, of course on their own local device.

In order to make elowo execute an externally provided applet, you have to append the applet location to a special elowo sandbox url `https://sandbox.eludi.net/elowo#`, after a separating hash (#) character. The sandbox URL ensures that the external applet has a separate environment and cannot read from or write to your standard development environment.

If you want to serve the applet from a generic cloud storage service, you have to find out the download link that directly returns the pure resource. For Dropbox the pattern to derive this from the general link is directly built into elowo. If you know an analogous permanent pattern for other popular cloud storages such as Microsoft OneCloud, Google Drive, or Apple iCloud, please let us know.

## compiling a stand-alone app

If you finally want to share or publish your completed applet from a nice short URL, then it is recommended to first define some meta information about your app in elowo's metadata dialog. Thus elowo can generate a [web app manifest](https://developer.mozilla.org/docs/Web/Manifest) and add the respective information also to the entry HTML web page.
Furthermore, if you upload an icon resource in SVG format having the name icon.js, then elowo is also able to generate a bunch of icons in different sizes for various devices and platforms.

Afterwards you can make use of elowo's package functionality, which generates a zip file containing a stand-alone [progressive web app (PWA)](https://developers.google.com/web/progressive-web-apps) stripped off from all editing features. A compiled app contains its own runtime core and therefore runs directly in the browser independent of the elowo app as host environment. Please notice that the elowo runtime environment is not copyrighted but given to the public domain - you are free to do whatever you want with your entire app under any license condition as you deem appropriate.
