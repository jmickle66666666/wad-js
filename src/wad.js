var Wad = { 

    onProgress : null,
    onLoad : null,
    ident : "",
    numlumps : -1,
    dictpos : -1,
    data : null,
    lumps : [],
    playpal : null,
    errormsg: null,

    error : function (msg) {
	    self.errormsg = msg;
    },
    
    loadURL : function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        var self = this;
        xhr.onload = function(e) {
          if (this.status == 200) {
            var blob = this.response;
            self.load(blob);
          }
        };
        xhr.send();
    },
    
    load : function (blob) {
        var self = this;

    	self.lumps = [];

    	var offset = 0;
    	var chunkSize = -1;

        var reader = new FileReader();
    	reader.readAsArrayBuffer(blob);
    	reader.onprogress = self.onProgress;

    	reader.onload = function(e) {
    		self.data = e.target.result;

    		// header reading
    		var headerReader = new DataView(e.target.result);
    		for (var i = 0; i < 4; i++) self.ident += String.fromCharCode(headerReader.getUint8(i));
    		if (self.ident != "IWAD" && self.ident != "PWAD") {
    		    self.error("Not a valid WAD file.");
    	            self.onLoad();
    		} else {
    		    self.numlumps = headerReader.getInt32(4, true);
    		    self.dictpos = headerReader.getInt32(8, true);
    		    offset = self.dictpos;
    		    chunkSize = 128;

    		    chunkReaderBlock(self.dictpos, chunkSize, blob);
    		}
    	}

    	var nextChunk = function(e) {
    	   offset += e.target.result.byteLength;

    	   var dataReader = new DataView(e.target.result);

    	   for (var i = 0; i < dataReader.byteLength / 16; i++) {
    		   var p = i * 16;
    		   var lumpPos = dataReader.getInt32(p, true);
    		   var lumpSize = dataReader.getInt32(p + 4, true);
    		   var lumpName = "";
    		   for (j = p + 8; j < p + 16; j++) {
    		       if (dataReader.getUint8(j) != 0) {
    			   lumpName += String.fromCharCode(dataReader.getUint8(j));
    		       }
    		   }

    		   lumpEntry = { 
    		       pos : lumpPos,
    		       size : lumpSize,
    		       name : lumpName
    		   }
    		   self.lumps.push(lumpEntry);
    	   }
    	  
               if (offset >= blob.size) {
    		self.playpal = Object.create(Playpal);
    		if (self.lumpExists("PLAYPAL")) {
    			self.playpal.load(wad.getLumpByName("PLAYPAL"));
    		}
    		self.onLoad();
    	   	return;
    	   }

    	   chunkReaderBlock(offset, chunkSize, blob)
    	}

    	chunkReaderBlock = function(_offset, chunkSize, data) {
    	    var r = new FileReader();
    	    var b = data.slice(_offset, _offset + chunkSize);
    	    r.onload = nextChunk; 
    	    r.onprogress = self.onProgress;
    	    r.readAsArrayBuffer(b);
    	}
        
    },

    save : function () {
        var name = prompt("Save as...","output.wad");
        if (this.data != null) {
            var toDownload=new Blob([this.data],{type:'octet/stream'});
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.style='display:none;';
            var url=window.URL.createObjectURL(toDownload);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    },

    saveLump : function(index) {
        var name = this.lumps[index].name + '.lmp';
        var toDownload=new Blob([this.getLump(index)],{type:'octet/stream'});
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style='display:none;';
        var url=window.URL.createObjectURL(toDownload);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
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

};
