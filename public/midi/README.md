# Changing the patch files

The Javascript files are obtained from [midijs.net](http://www.midijs.net/) and the pat files are obtained from [babelsberg-js](https://github.com/babelsberg/babelsberg-js/tree/master/midijs/pat). The pat files are the one that are hard-coded into midi.js by default, however you can change this. 

In midi.js, replace instances of "pat/" with the root directory of the patches.

In libtimidity.js, the steps are a bit more involved. Instead of repeating myself, see this [comment here](https://github.com/jmickle66666666/wad-js/issues/27#issuecomment-272285146).
