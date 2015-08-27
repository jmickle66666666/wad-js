//constants 
var TEXT = "text";
var MAP = "map";
var MUSIC = "music";
var MIDI = "midi";
var GRAPHIC = "graphic";
var FLAT = "flat";
var MARKER = "marker";
var GRAPHIC_MARKERS = ["P","PP","P2","P3","S","S2","S3"];
var FLAT_MARKERS = ["F","FF","F2","F3"];
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
            
            
            if (self.onLoad != null) {
                self.onLoad();
            }
        }

        reader.readAsArrayBuffer(file);  
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
        //name-based detection
        var name = this.lumps[index].name;
        if ($.inArray(name, TEXTLUMPS) >= 0) return TEXT;
        if ($.inArray(name, MAPLUMPS) >= 0) return MAP;
        if ($.inArray(name, DATA_LUMPS) >= 0) return name;
        if (/MAP\d\d/.test(name)) return MAP;
        if (/E\dM\d/.test(name)) return MAP;
        
        //data-based detection
        var lumpData = this.getLump(index);
        if (/^MThd/.test(this.lumpDataToText(lumpData))) return MIDI;
        
        //between markers
        for (var i = index; i>=0; i--) {
            if (/_END$/.test(this.lumps[i].name)) break;
            if (/_START$/.test(this.lumps[i].name)) {
                pre = this.lumps[i].name.substr(0,this.lumps[i].name.indexOf("_"));
                if ($.inArray(pre, GRAPHIC_MARKERS)) return GRAPHIC;
                if ($.inArray(pre, FLAT_MARKERS)) return FLAT;
            }
        }
        
        //shitty name-based detection
        if (/_START$/.test(name)) return MARKER;
        if (/_END$/.test(name)) return MARKER;
        if (/^D_/.test(name)) return MUSIC;
        
        return "...";
    }

};

var Playpal = {
    
    rgbToHex : function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    hexToRgb : function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    palettes : [],
    
    load : function (lumpData) {
        var dv = new DataView(lumpData);
        // 14 palettes to parse
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
            col = this.hexToRgb(this.palettes[0][i/4]);
            imageData.data[i] = col.r;
            imageData.data[i+1] = col.g;
            imageData.data[i+2] = col.b;
            imageData.data[i+3] = 255;
        }
        var newCanvas = $("<canvas>")
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