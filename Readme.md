# Web Tool <https://jmickle66666666.github.io/wad-js/>
### Front-end tool for editing wads on the web.
Load a wad from your device, or by URL and view many different types of lumps.

Preview support includes:
* Text files
* Audio files
* Midi files
* Graphics (Doom Image Format, Flats, PNGs)
* ENDOOM, PLAYPAL and COLORMAP files
* THINGS (displays thing count of Doom and Doom 2 types)

# WAD.js
### Javascript Library for manipulating Doom WAD format files
Read Doom WADs and access data from many different common lump types easily. 

Current features include:
* Loading WADs from local directories or URLs
* Finding lumps in a WAD by name or index
* Retrieving lump data as either text or binary data
* Lump type detection (Common Text Data types, Mapdata, Graphics, Sprites, Flats, MIDI, MUS, and many more)
* ENDOOM renderer (requires dos.png, a character map for the ASCII characters used)
* PLAYPAL, COLORMAP renderer
* Export Graphics and Flats to Canvas
* Render Maps to Canvas

## How to???

### Load WAD file from desktop

In your HTML, any standard file input such as:
`<input type="file" id="fileInput"/>`

And create a WAD object, and load the file like this:
```
var wad = Object.create(Wad); // Create a new WAD object to load our file into

// Create a callback function when loading is complete
wad.onLoad = function() {
  alert('Wad successfully loaded!');
};

var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function(e) {
  var file = fileInput.files[0];
  wad.load(file); // Load the file into the WAD object we created
}
```

### Load WAD file from URL

Create a WAD object and load the URL
```
var wad = Object.create(Wad); // Create a new WAD object to load our file into

// Create a callback function when loading is complete
wad.onLoad = function() {
  alert('Wad successfully loaded!');
}; 

wad.loadURL('http://www.example.com/file.wad');
```

### Lumps

A directory of lump information is stored in `wad.lumps`, storing the names and also used internally to access the data of the lumps.
```
for (var i = 0; i < wad.lumps.length; i++) {
  console.log(wad.lumps[i].name); // Print the name of every lump in the WAD file.
}
```

These lump objects store `name`, `size` and `pos` (byte position in the WAD file). However, only the name will be useful for most cases.

To get the actual data for a lump, use the commands:
`wad.getLump(index)` Return the lump data by index of the lump.
`wad.getLumpByName(name)` Return the data of the first lump in the wad that matches `name`.

To ease finding lumps, there are some helper functions:
`wad.lumpExists(name)` Returns true if a lump in the wad exists with the given `name`.
`wad.getLumpIndexByName(name)` Just returns the index of the first lump matching the given name, instead of the entire data of the lump.
`wad.getLumpAsText(index)` Return the lump data as a string instead of byte data.

## Lump interfaces

### Graphics

Doom uses a custom image format for most of the graphics in the game. These can be automatically converted to standard images by wad.js.

Example:
```
graphic = Object.create(Graphic); // We create Graphic objects just like Wad object files
graphic.load(wad.getLumpByName('PLAYA1'); // Load the player sprite from DOOM2.WAD
canvas = graphic.toCanvas(); // Export the image to a HTML5 canvas
document.body.appendChild(canvas); // Place the image on the page
```

### Flats

Flats are another image format used in Doom games, for sector floors and ceilings. The API matches the graphic format API.

`flat = Object.create(Flat);` Create a new Flat object
`flat.load(data);` Load lump data into flat object
`flat.toCanvas();` Return new canvas object with the flat's data rendered to it

### Playpal

The PLAYPAL lump is the palette used in the Doom wad, present in the IWAD files. If no PLAYPAL is present, a copy of the DOOM/2.WAD palette is used internally for graphics rendering.

`playpal = Object.Create(Playpal);` Create a new Playpal object
`playpal.load(data);` Load lump data into playpal object
`playpal.toCanvas();` Render playpal to a canvas object and return it

### Colormap

The COLORMAP lump is used in Doom for lighting effects. It is an indexed list for each color in the palette with a ramp to darkness.

`colormap = Object.Create(Colormap);` Create a new Colormap object
`colormap.load(data);` Load lump data into colormap object
`colormap.toCanvas();` Render the colormap to a canvas object and return it
