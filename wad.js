console.log("wad.js");

var Wad = { 

    onLoad : null,
    ident : "",
    numlumps : -1,
    dictpos : -1,
    data : null,
    lumps : [],

    load : function (file) {
        var reader = new FileReader();
        console.log("wad.js: load");
        
        var self = this;
        
        reader.onload = function(e) {
            
            console.log("wad.js: reader onLoad");
            
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
                var lumpPos = dictionaryReader.getInt32(p);
                var lumpSize = dictionaryReader.getInt32(p + 4);
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
                console.log("wad.js: wad onLoad");
                self.onLoad();
            }
            console.log("wad.js: after wad onLoad");
            console.log(self.onLoad);
        }

        reader.readAsArrayBuffer(file);  
    },

    getLump : function (name) {
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                l = this.lumps[i];
                return this.data.slice(l.pos,l.pos+l.size);
            }
        }
        return null;
    }

};