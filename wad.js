class Wad {
    
    //takes a fileobject as an argument
    constructor(file) {
        // get the file and do shit
        this.data = //put the byte array here
        this.dictionary = //put the wad dictionary object here
    }
    
    readData() {
        headerBuffer = //pull the header info from the array buffer
        dictionaryBuffer = 
    }
    
    getLumpBuffer(name) {
        
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