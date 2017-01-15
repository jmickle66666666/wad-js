var Playpal = {
    
    rgbToHex : function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    palettes : [["#000000", "#1f170b", "#170f07", "#4b4b4b", "#ffffff", "#1b1b1b", "#131313", "#0b0b0b", "#070707", "#2f371f", "#232b0f", "#171f07", "#0f1700", "#4f3b2b", "#473323", "#3f2b1b", "#ffb7b7", "#f7abab", "#f3a3a3", "#eb9797", "#e78f8f", "#df8787", "#db7b7b", "#d37373", "#cb6b6b", "#c76363", "#bf5b5b", "#bb5757", "#b34f4f", "#af4747", "#a73f3f", "#a33b3b", "#9b3333", "#972f2f", "#8f2b2b", "#8b2323", "#831f1f", "#7f1b1b", "#771717", "#731313", "#6b0f0f", "#670b0b", "#5f0707", "#5b0707", "#530707", "#4f0000", "#470000", "#430000", "#ffebdf", "#ffe3d3", "#ffdbc7", "#ffd3bb", "#ffcfb3", "#ffc7a7", "#ffbf9b", "#ffbb93", "#ffb383", "#f7ab7b", "#efa373", "#e79b6b", "#df9363", "#d78b5b", "#cf8353", "#cb7f4f", "#bf7b4b", "#b37347", "#ab6f43", "#a36b3f", "#9b633b", "#8f5f37", "#875733", "#7f532f", "#774f2b", "#6b4727", "#5f4323", "#533f1f", "#4b371b", "#3f2f17", "#332b13", "#2b230f", "#efefef", "#e7e7e7", "#dfdfdf", "#dbdbdb", "#d3d3d3", "#cbcbcb", "#c7c7c7", "#bfbfbf", "#b7b7b7", "#b3b3b3", "#ababab", "#a7a7a7", "#9f9f9f", "#979797", "#939393", "#8b8b8b", "#838383", "#7f7f7f", "#777777", "#6f6f6f", "#6b6b6b", "#636363", "#5b5b5b", "#575757", "#4f4f4f", "#474747", "#434343", "#3b3b3b", "#373737", "#2f2f2f", "#272727", "#232323", "#77ff6f", "#6fef67", "#67df5f", "#5fcf57", "#5bbf4f", "#53af47", "#4b9f3f", "#439337", "#3f832f", "#37732b", "#2f6323", "#27531b", "#1f4317", "#17330f", "#13230b", "#0b1707", "#bfa78f", "#b79f87", "#af977f", "#a78f77", "#9f876f", "#9b7f6b", "#937b63", "#8b735b", "#836b57", "#7b634f", "#775f4b", "#6f5743", "#67533f", "#5f4b37", "#574333", "#533f2f", "#9f8363", "#8f7753", "#836b4b", "#775f3f", "#675333", "#5b472b", "#4f3b23", "#43331b", "#7b7f63", "#6f7357", "#676b4f", "#5b6347", "#53573b", "#474f33", "#3f472b", "#373f27", "#ffff73", "#ebdb57", "#d7bb43", "#c39b2f", "#af7b1f", "#9b5b13", "#874307", "#732b00", "#ffffff", "#ffdbdb", "#ffbbbb", "#ff9b9b", "#ff7b7b", "#ff5f5f", "#ff3f3f", "#ff1f1f", "#ff0000", "#ef0000", "#e30000", "#d70000", "#cb0000", "#bf0000", "#b30000", "#a70000", "#9b0000", "#8b0000", "#7f0000", "#730000", "#670000", "#5b0000", "#4f0000", "#430000", "#e7e7ff", "#c7c7ff", "#ababff", "#8f8fff", "#7373ff", "#5353ff", "#3737ff", "#1b1bff", "#0000ff", "#0000e3", "#0000cb", "#0000b3", "#00009b", "#000083", "#00006b", "#000053", "#ffffff", "#ffebdb", "#ffd7bb", "#ffc79b", "#ffb37b", "#ffa35b", "#ff8f3b", "#ff7f1b", "#f37317", "#eb6f0f", "#df670f", "#d75f0b", "#cb5707", "#c34f00", "#b74700", "#af4300", "#ffffff", "#ffffd7", "#ffffb3", "#ffff8f", "#ffff6b", "#ffff47", "#ffff23", "#ffff00", "#a73f00", "#9f3700", "#932f00", "#872300", "#4f3b27", "#432f1b", "#372313", "#2f1b0b", "#000053", "#000047", "#00003b", "#00002f", "#000023", "#000017", "#00000b", "#000000", "#ff9f43", "#ffe74b", "#ff7bff", "#ff00ff", "#cf00cf", "#9f009b", "#6f006b", "#a76b6b"]],
    
    load : function (lumpData) {
        var dv = new DataView(lumpData);
        // 14 palettes to parse
        this.palettes = [];
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
            col = hexToRgb(this.palettes[0][i/4]);
            imageData.data[i] = col.r;
            imageData.data[i+1] = col.g;
            imageData.data[i+2] = col.b;
            imageData.data[i+3] = 255;
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
