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
