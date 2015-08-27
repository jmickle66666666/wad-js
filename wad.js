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
            
            for (i = 0; i < self.numlumps; i++) {
                p = i * 16;
                var lumpPos = dictionaryReader.getInt32(p, true);
                var lumpSize = dictionaryReader.getInt32(p + 4, true);
                var lumpName = "";
                for (j = p + 8; j < p + 16; j++) lumpName += String.fromCharCode(dictionaryReader.getUint8(j));
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

    getLump : function (name) {
        console.log("wad.js: getLump("+name+");");
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                l = this.lumps[i];
                return this.data.slice(l.pos,l.pos+l.size);
            }
        }
        return null;
    },
    
    getLumpSize : function (name) {
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                l = this.lumps[i];
                return l.size;
            }
        }
        return null;
    },
    
    getLumpAsText : function (name) {
        var dat = this.getLump(name);
        var dv = new DataView(dat);
        output = "";
        for (i = 0; i < dat.byteLength; i++) output += String.fromCharCode(dv.getUint8(i));
        return output;
    }

};