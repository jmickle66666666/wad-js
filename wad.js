class Wad {
    
    //takes a fileobject as an argument
    constructor() {
        this.ident = "";
    }
    
    load(file,onload){
        var reader = new FileReader();

        reader.onload = function(e) {
            this.data = reader.result;
            var i;
            var headerReader = new DataView(this.data);
            
            for (i = 0; i < 4; i++) this.ident += String.fromCharCode(headerReader.getUint8(i));
            console.log(this.ident);
            var numlumps = headerReader.getInt32(4, true);
            var dictpos = headerReader.getInt32(4, true);
            // the size of the dictionary is 16 * numlumps so slice that shit then create the obj
            var dictionaryBuffer = this.data.slice(dictpos,dictpos + (numlumps * 16));
            this.dictionary = new WadDict(dictionaryBuffer);
            
            if (onload != null) {
                onload();
            }
        }

        reader.readAsArrayBuffer(file);   
    }
    
}

class WadDict {
    
    //takes a dictionary shaped arraybuffer and stores all the lump names and positions
    constructor(data) {
        this.lumps = [];
    }
    
}

class WadDictEntry {
    constructor(position,size,name) {
        this.name = name;
        this.size = size;
        this.position = position;
    }
}