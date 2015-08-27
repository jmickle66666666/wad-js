//constants 
var TEXT = "text";
var MAP = "map";
var MUSIC = "music";
var MIDI = "midi";
var MAPLUMPS = ["THINGS","LINEDEFS","SIDEDEFS","VERTEXES","SEGS",
                "SSECTORS","NODES","SECTORS","REJECT","BLOCKMAP"];
var TEXTLUMPS = [ "DEHACKED", "MAPINFO", "ZMAPINFO", "EMAPINFO", 
                  "DMXGUS", "DMXGUSC", "WADINFO", "EMENUS", "MUSINFO",
                  "SNDINFO", "GLDEFS", "KEYCONF", "SCRIPTS", "LANGUAGE",
                  "DECORATE" ];

                  
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
        var name = this.lumps[index].name;
        if ($.inArray(name, TEXTLUMPS) >= 0) return TEXT;
        if ($.inArray(name, MAPLUMPS) >= 0) return MAP;
        if (/MAP\d\d/.test(name)) return MAP;
        
        var lumpData = this.getLump(index);
        if (/^MThd/.test(this.lumpDataToText(lumpData))) return MIDI;
        if (/^D_/.test(name)) return MUSIC;
        
        return "...";
    }

};

var Playpal {
    
    rgbToHex : function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    palettes : [],
    
    load : function (lumpData) {
        var dv = new DataView(data);
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
    }
}