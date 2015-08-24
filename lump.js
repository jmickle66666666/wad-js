class Lump {
    constructor(data = null, fromFile = null) {
        
    }
    
    fromFile(source) {
        
    }
    
    toFile(source) {
        
    }
    
    copy() {
        
    }
}

class Music {
    
}

class Sound {
    
}

class Graphic {
    constructor(data = null, fromFile = null, palette = null) {
        
    }
    
    getOffsets() {
        
    }
    
    setOffsets(x,y) {
        
    }
    
    getDimensions() {
        
    }
    
    fromRaw(data, width, height, xOffset = 0, yOffset = 0, pal = null) {
        
    }
    
    toRaw(tranIndex = null)  {
        
    }
    
    toImage() {
        
    }
    
    fromImage(image, translate = false) {
        //PIL Image, probably won't implement
        //leaving in case there is a way to make a PIL analogy
    }
    
    fromFile(filename, translate = false) {
        
    }
    
    toFile(filename, mode='P') {
        
    }
    
    translate(pal) {
        
    }
}

class Flat extends Graphic {
    getDimensions() {
        
    }
    
    loadRaw(data) {
        
    }
    
    toRaw() {
        
    }
}