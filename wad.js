//constants 
var TEXT = "text";
var MAP = "map";
var MAPDATA = "mapdata";
var MUSIC = "music";
var MIDI = "midi";
var GRAPHIC = "graphic";
var FLAT = "flat";
var MARKER = "marker";
var GRAPHIC_MARKERS = ["P_","PP_","P1_","P2_","P3_","S_","S2_","S3_"];
var FLAT_MARKERS = ["F_","FF_","F1_","F2_","F3_"];
var MAPLUMPS = ["THINGS","LINEDEFS","SIDEDEFS","VERTEXES","SEGS",
                "SSECTORS","NODES","SECTORS","REJECT","BLOCKMAP"];
var TEXTLUMPS = [ "DEHACKED", "MAPINFO", "ZMAPINFO", "EMAPINFO", 
                  "DMXGUS", "DMXGUSC", "WADINFO", "EMENUS", "MUSINFO",
                  "SNDINFO", "GLDEFS", "KEYCONF", "SCRIPTS", "LANGUAGE",
                  "DECORATE" ];
var DATA_LUMPS = [ "PLAYPAL", "COLORMAP", "TEXTURE1", "TEXTURE2", "PNAMES",
                    "ENDOOM"];
var GRAPHIC_LUMPS = [ "TITLEPIC" ];

                  
var Wad = { 

    onLoad : null,
    ident : "",
    numlumps : -1,
    dictpos : -1,
    data : null,
    lumps : [],
    playpal : null,
    
    loadURL : function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'blob:'+url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
          if (this.status == 200) {
            var myBlob = this.response;
            // myBlob is now the blob that the object URL pointed to.
            console.log(myBlob);
          }
        };
        xhr.send();
    },
    
    load : function (file) {
        var reader = new FileReader();
        
        var self = this;
        
        reader.onload = function(e) {
            
            
            self.data = reader.result;
            var i;
            
            // header reading
            var headerReader = new DataView(self.data);
            for (i = 0; i < 4; i++) self.ident += String.fromCharCode(headerReader.getUint8(i));
            self.numlumps = headerReader.getInt32(4, true);
            self.dictpos = headerReader.getInt32(8, true);
            
            // dictionary reading
            
            // the size of the dictionary is 16 * numlumps so slice that shit then create the obj
            var dictionaryBuffer = self.data.slice(self.dictpos,self.dictpos + (self.numlumps * 16));
            var dictionaryReader = new DataView(dictionaryBuffer);
            
            self.lumps = [];
            
            for (i = 0; i < self.numlumps; i++) {
                p = i * 16;
                var lumpPos = dictionaryReader.getInt32(p, true);
                var lumpSize = dictionaryReader.getInt32(p + 4, true);
                var lumpName = "";
                for (j = p + 8; j < p + 16; j++) {
                    if (dictionaryReader.getUint8(j) != 0) {
                        lumpName += String.fromCharCode(dictionaryReader.getUint8(j));
                    }
                }
                lumpEntry = { 
                    pos : lumpPos,
                    size : lumpSize,
                    name : lumpName
                }
                self.lumps.push(lumpEntry);
            }
            
            if (self.lumpExists("PLAYPAL")) {
                self.playpal = Object.create(Playpal);
                self.playpal.load(wad.getLumpByName("PLAYPAL"));
            } else {
                self.playpal = Object.create(Playpal);
            }
            
            if (self.onLoad != null) {
                self.onLoad();
            }
        }

        reader.readAsArrayBuffer(file);  
    },
    
    lumpExists : function (name) {
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                return true;
            }
        }
        return false;
    },

    getLumpByName : function (name) {
        console.log("wad.js: getLumpByName("+name+");");
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                l = this.lumps[i];
                return this.data.slice(l.pos,l.pos+l.size);
            }
        }
        return null;
    },
    
    getLumpIndexByName : function (name) {
        for (var i = this.numlumps-1; i >= 0; i--) {
            if (this.lumps[i].name == name) {
                return i;
            }
        }
        return null;
    },
    
    getLumpAsText : function (index) {
        var dat = this.getLump(index);
        return this.lumpDataToText(dat);
    },
    
    lumpDataToText : function (data) {
        output = "";
        var dv = new DataView(data);
        for (i = 0; i < data.byteLength; i++) output += String.fromCharCode(dv.getUint8(i));
        return output;
    },
    
    getLump: function (index) {
        l = this.lumps[index];
        return this.data.slice(l.pos,l.pos+l.size);
    },
    
    detectLumpType : function (index) {
        //TODO: get patches from pnames
        
        //name-based detection
        var name = this.lumps[index].name;
        if (TEXTLUMPS.indexOf(name) >= 0) return TEXT;
        if (MAPLUMPS.indexOf(name) >= 0) return MAPDATA;
        if (DATA_LUMPS.indexOf(name) >= 0) return name;
        if (GRAPHIC_LUMPS.indexOf(name) >= 0) return GRAPHIC;
        if (/^MAP\d\d/.test(name)) return MAP;
        if (/^E\dM\d/.test(name)) return MAP;
        if (/_START$/.test(name)) return MARKER;
        if (/_END$/.test(name)) return MARKER;
        
        //data-based detection
        var lumpData = this.getLump(index);
        if (lumpData.byteLength == 0) return MARKER;
        if (/^MThd/.test(this.lumpDataToText(lumpData))) return MIDI;
        
        //between markers
        for (var i = index; i>=0; i--) {
            if (/_END$/.test(this.lumps[i].name)) break;
            if (/_START$/.test(this.lumps[i].name)) {
                pre = this.lumps[i].name.substr(0,this.lumps[i].name.indexOf("_")+1);
                if (GRAPHIC_MARKERS.indexOf(pre)>= 0) return GRAPHIC;
                if (FLAT_MARKERS.indexOf(pre)>= 0) return FLAT;
            }
        }
        
        //shitty name-based detection
        
        if (/^D_/.test(name)) return MUSIC;
        
        return "...";
    }

};

var Playpal = {
    
    rgbToHex : function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    palettes : [["#000000", "#1f170b", "#170f07", "#4b4b4b", "#ffffff", "#1b1b1b", "#131313", "#0b0b0b", "#070707", "#2f371f", "#232b0f", "#171f07", "#0f1700", "#4f3b2b", "#473323", "#3f2b1b", "#ffb7b7", "#f7abab", "#f3a3a3", "#eb9797", "#e78f8f", "#df8787", "#db7b7b", "#d37373", "#cb6b6b", "#c76363", "#bf5b5b", "#bb5757", "#b34f4f", "#af4747", "#a73f3f", "#a33b3b", "#9b3333", "#972f2f", "#8f2b2b", "#8b2323", "#831f1f", "#7f1b1b", "#771717", "#731313", "#6b0f0f", "#670b0b", "#5f0707", "#5b0707", "#530707", "#4f0000", "#470000", "#430000", "#ffebdf", "#ffe3d3", "#ffdbc7", "#ffd3bb", "#ffcfb3", "#ffc7a7", "#ffbf9b", "#ffbb93", "#ffb383", "#f7ab7b", "#efa373", "#e79b6b", "#df9363", "#d78b5b", "#cf8353", "#cb7f4f", "#bf7b4b", "#b37347", "#ab6f43", "#a36b3f", "#9b633b", "#8f5f37", "#875733", "#7f532f", "#774f2b", "#6b4727", "#5f4323", "#533f1f", "#4b371b", "#3f2f17", "#332b13", "#2b230f", "#efefef", "#e7e7e7", "#dfdfdf", "#dbdbdb", "#d3d3d3", "#cbcbcb", "#c7c7c7", "#bfbfbf", "#b7b7b7", "#b3b3b3", "#ababab", "#a7a7a7", "#9f9f9f", "#979797", "#939393", "#8b8b8b", "#838383", "#7f7f7f", "#777777", "#6f6f6f", "#6b6b6b", "#636363", "#5b5b5b", "#575757", "#4f4f4f", "#474747", "#434343", "#3b3b3b", "#373737", "#2f2f2f", "#272727", "#232323", "#77ff6f", "#6fef67", "#67df5f", "#5fcf57", "#5bbf4f", "#53af47", "#4b9f3f", "#439337", "#3f832f", "#37732b", "#2f6323", "#27531b", "#1f4317", "#17330f", "#13230b", "#0b1707", "#bfa78f", "#b79f87", "#af977f", "#a78f77", "#9f876f", "#9b7f6b", "#937b63", "#8b735b", "#836b57", "#7b634f", "#775f4b", "#6f5743", "#67533f", "#5f4b37", "#574333", "#533f2f", "#9f8363", "#8f7753", "#836b4b", "#775f3f", "#675333", "#5b472b", "#4f3b23", "#43331b", "#7b7f63", "#6f7357", "#676b4f", "#5b6347", "#53573b", "#474f33", "#3f472b", "#373f27", "#ffff73", "#ebdb57", "#d7bb43", "#c39b2f", "#af7b1f", "#9b5b13", "#874307", "#732b00", "#ffffff", "#ffdbdb", "#ffbbbb", "#ff9b9b", "#ff7b7b", "#ff5f5f", "#ff3f3f", "#ff1f1f", "#ff0000", "#ef0000", "#e30000", "#d70000", "#cb0000", "#bf0000", "#b30000", "#a70000", "#9b0000", "#8b0000", "#7f0000", "#730000", "#670000", "#5b0000", "#4f0000", "#430000", "#e7e7ff", "#c7c7ff", "#ababff", "#8f8fff", "#7373ff", "#5353ff", "#3737ff", "#1b1bff", "#0000ff", "#0000e3", "#0000cb", "#0000b3", "#00009b", "#000083", "#00006b", "#000053", "#ffffff", "#ffebdb", "#ffd7bb", "#ffc79b", "#ffb37b", "#ffa35b", "#ff8f3b", "#ff7f1b", "#f37317", "#eb6f0f", "#df670f", "#d75f0b", "#cb5707", "#c34f00", "#b74700", "#af4300", "#ffffff", "#ffffd7", "#ffffb3", "#ffff8f", "#ffff6b", "#ffff47", "#ffff23", "#ffff00", "#a73f00", "#9f3700", "#932f00", "#872300", "#4f3b27", "#432f1b", "#372313", "#2f1b0b", "#000053", "#000047", "#00003b", "#00002f", "#000023", "#000017", "#00000b", "#000000", "#ff9f43", "#ffe74b", "#ff7bff", "#ff00ff", "#cf00cf", "#9f009b", "#6f006b", "#a76b6b"]],
    
    load : function (lumpData) {
        var dv = new DataView(lumpData);
        // 14 palettes to parse
        this.palettes = [];
        for (var i = 0; i < 14; i++) {
            palette = [];
            for (var j = 0; j < 256; j++) {
                var red = dv.getUint8((i*768)+(j*3)+0);
                var grn = dv.getUint8((i*768)+(j*3)+1);
                var blu = dv.getUint8((i*768)+(j*3)+2);
                palette.push(this.rgbToHex(red,grn,blu));
            }
            this.palettes.push(palette);
        }
        
    },
    
    toCanvas : function () {
        var scaleSize = 16;
        //then lets make a canvas to put this image onto
        var canvas = document.createElement("canvas");
        canvas.width = 16 * scaleSize;
        canvas.height = 16 * scaleSize;
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(16,16);
        //image pixel data is stored in a linear array
        //each pixel is represented by four values:
        //red, green, blue then alpha.
        //palettes are 256 colours, so the canvas is going
        //to be 16x16.
        for (var i = 0; i < 1024; i+=4) {
            col = hexToRgb(this.palettes[0][i/4]);
            imageData.data[i] = col.r;
            imageData.data[i+1] = col.g;
            imageData.data[i+2] = col.b;
            imageData.data[i+3] = 255;
        }
        var newCanvas = document.createElement("CANVAS");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        newCanvas.getContext("2d").putImageData(imageData, 0, 0);
        context.scale(scaleSize, scaleSize);
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);
        return canvas;
        
    }
    
}

var Colormap = {
    
    colormaps : null,
    
    load : function (lumpData) {
        var dv = new DataView(lumpData);
        this.colormaps = [];
        for (var i = 0; i < 34; i++) {
            cm = []
            for (var j = 0; j < 256; j++) {
                cm.push(dv.getUint8((i*256)+j));
            }
            this.colormaps.push(cm);
        }
    },
    
    
    toCanvas : function (wad) {
        var scaleSize = 3;
        var canvas = document.createElement("canvas");
        canvas.width = 256 * scaleSize;
        canvas.height = 34 * scaleSize;
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(256,34);
        for (var j = 0; j < 34; j++) {
            for (var i = 0; i < 256; i++) {
                col = hexToRgb(wad.playpal.palettes[0][this.colormaps[j][i]]);
                imageData.data[(((j*256)+i)*4)+0] = col.r;
                imageData.data[(((j*256)+i)*4)+1] = col.g;
                imageData.data[(((j*256)+i)*4)+2] = col.b;
                imageData.data[(((j*256)+i)*4)+3] = 255;
            }
        }
        var newCanvas = document.createElement("CANVAS");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        newCanvas.getContext("2d").putImageData(imageData, 0, 0);
        context.scale(scaleSize, scaleSize);
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);
        return canvas;
    }
}

var Flat = {
    
    data : null,
    
    load : function (lumpData) {
        var dv = new DataView(lumpData);
        this.data = [];
        for (var j = 0; j < 4096; j++) {
            this.data.push(dv.getUint8(j));
        }
    },
    
    
    toCanvas : function (wad) {
        var scaleSize = 3;
        var canvas = document.createElement("canvas");
        canvas.width = 64 * scaleSize;
        canvas.height = 64 * scaleSize;
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(64,64);
        for (var i = 0; i < 4096; i++) {
            col = hexToRgb(wad.playpal.palettes[0][this.data[i]]);
            imageData.data[(i*4)+0] = col.r;
            imageData.data[(i*4)+1] = col.g;
            imageData.data[(i*4)+2] = col.b;
            imageData.data[(i*4)+3] = 255;
        }
        var newCanvas = document.createElement("CANVAS");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        newCanvas.getContext("2d").putImageData(imageData, 0, 0);
        context.scale(scaleSize, scaleSize);
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);
        return canvas;
    }
}

var Graphic = {
    
    data : null,
    width : null,
    height : null,
    xOffset : null,
    yOffset : null,
    
    load : function (lumpData) {
        var i;
        var j;
        var dv = new DataView(lumpData);
        
        this.data = [];
        
        function setData(x,y,val) {
            console.log(x);
            console.log(y);
            console.log(val);
            console.log((y * this.width) + x);
            this.data[(y * this.width) + x] = val;
        }
        
        this.width = dv.getUint16(0,true);
        this.height = dv.getUint16(2,true);
        this.xOffset = dv.getUint16(4,true);
        this.yOffset = dv.getUint16(6,true);
        
        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                //-1 for transparency
                this.data.push(-1);
            }
        }
        
        var columns = [];
        
        for (i = 0; i < this.width; i++) {
            columns[i] = dv.getUint32(8 + (i*4),true);
        }
        
        var position = 0;
        var pixelCount = 0;
        var dummyValue = 0;
        
        for (i = 0; i < this.width; i++) {
            
            position = columns[i];
            var rowStart = 0;
            
            while (rowStart != 255) {
                
                rowStart = dv.getUint8(position);
                position += 1;
                
                if (rowStart == 255) break;
                
                pixelCount = dv.getUint8(position);
                position += 2;
                
                for (j = 0; j < pixelCount; j++) {
                    this.data[((rowStart + j) * this.width) + i] = dv.getUint8(position);
                    position += 1;
                }
                position += 1;
            }
        }
    },
    
    toCanvas : function (wad) {
        var scaleSize = 3;
        var canvas = document.createElement("canvas");
        canvas.width = this.width * scaleSize;
        canvas.height = this.height * scaleSize;
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(this.width,this.height);
        var size = this.width * this.height;
        for (var i = 0; i < size; i++) {
            if (this.data[i] != -1) {
                col = hexToRgb(wad.playpal.palettes[0][this.data[i]]);
                imageData.data[(i*4)+0] = col.r;
                imageData.data[(i*4)+1] = col.g;
                imageData.data[(i*4)+2] = col.b;
                imageData.data[(i*4)+3] = 255;
            } else {
                imageData.data[(i*4)+0] = 0;
                imageData.data[(i*4)+1] = 0;
                imageData.data[(i*4)+2] = 0;
                imageData.data[(i*4)+3] = 0;
            }
        }
        var newCanvas = document.createElement("CANVAS");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        newCanvas.getContext("2d").putImageData(imageData, 0, 0);
        context.scale(scaleSize, scaleSize);
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);
        return canvas;
    }
    
}

//utility functions

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function readName(dv,pos) {
    output = "";
    for (j = pos; j < pos + 8; j++) {
        if (dv.getUint8(j) != 0) {
            output += String.fromCharCode(dv.getUint8(j));
        }
    }
    return output;
}