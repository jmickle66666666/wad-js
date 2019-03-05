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
