//constants 
var TEXT = "text";
var MAP = "map";
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

                  
var Wad = { 

    onLoad : null,
    ident : "",
    numlumps : -1,
    dictpos : -1,
    data : null,
    lumps : [],
    playpal : null,

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
        if (MAPLUMPS.indexOf(name) >= 0) return MAP;
        if (DATA_LUMPS.indexOf(name) >= 0) return name;
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
                if (GRAPHIC_MARKERS.indexOf(name)>= 0) return GRAPHIC;
                if (FLAT_MARKERS.indexOf(name)>= 0) return FLAT;
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
    
    
    palettes : null,
    
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
            .attr("width", imageData.width)
            .attr("height", imageData.height)[0];
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
            .attr("width", imageData.width)
            .attr("height", imageData.height)[0];
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
            .attr("width", imageData.width)
            .attr("height", imageData.height)[0];
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
            .attr("width", imageData.width)
            .attr("height", imageData.height)[0];
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