var EndoomChar = {
    charIndex : 0,
    backColor : 0,
    foreColor : 0,
    blinking : false
};

var Endoom = {
    ansiColDark : [ [0, 0, 0], 
                    [0, 0, 170], 
                    [0, 170, 0],
                    [0, 170, 170],
                    [170, 0, 0],
                    [170, 0, 170],
                    [170, 85, 0],
                    [170, 170, 170] ],
                    
    ansiColLight : [ [85, 85, 85],
                     [85, 85, 255],
                     [85, 255, 85],
                     [85, 255, 255],
                     [255, 85, 85],
                     [255, 85, 255],
                     [255, 255, 85],
                     [255, 255, 255] ],

    charCanvas : [],
    charContext : [],
    
    setTile : function (_ctx,x,y,i,c1,c2) {
        var _i = (x % 80)+Math.floor(y / 80);
        this.data[_i].charIndex = i;
        this.data[_i].backColor = c1;
        this.data[_i].foreColor = c2;
        _ctx.drawImage(this.getChar(i,c1,c2),x * 8, y * 16);
    },
    
    getChar : function (i,c1,c2) {
        var _can = document.createElement('canvas');
        var _ctx = _can.getContext('2d');
        _ctx.drawImage(this.charCanvas[i],0,0);
        
        this.swapcolor(_ctx,[0,0,0],this.ansiColDark[c1]);
        
        var _fc = [];
        if (c2 >= 8) _fc = this.ansiColLight[c2-8];
        else _fc = this.ansiColDark[c2];
        
        this.swapcolor(_ctx,[255,255,255],_fc);
        return _can;
    },
    
    swapcolor : function (ctex,oc,nc) {
        // pull the entire image into an array of pixel data
        var imageData = ctex.getImageData(0, 0, 8, 16);
        
        // examine every pixel, 
        // change any old rgb to the new-rgb
        for (var i=0;i<imageData.data.length;i+=4)
          {
              // is this pixel the old rgb?
              if(imageData.data[i]==oc[0] &&
                 imageData.data[i+1]==oc[1] &&
                 imageData.data[i+2]==oc[2]
              ){
                  // change to your new rgb
                  imageData.data[i]=nc[0];
                  imageData.data[i+1]=nc[1];
                  imageData.data[i+2]=nc[2];
              }
          }
        // put the altered data back on the canvas  
        ctex.putImageData(imageData,0,0);
    },
    
    data : [],
    
    load : function (lumpData) {
        
        this.data = [];
        
        if (lumpData != null) {
        
            var dv = new DataView(lumpData);
            for (var i=0; i < 2000; i++) {
                var _c = dv.getUint8(i*2);
                var _s = dv.getUint8(i*2 + 1);
                
                var _f = _s & parseInt('00001111',2);
                var _b = (_s>>4);
                var _bl = false;
                if (_b >= 8) {
                    _bl = true;
                    _b -= 8;
                }
                
                var _nec = Object.create(EndoomChar);
                _nec.charIndex = _c;
                _nec.backColor = _b;
                _nec.foreColor = _f;
                _nec.blinking = _bl;
                this.data.push(_nec);
            }
        
        } else {
            for (var i=0; i < 2000; i++) {
                var _nec = Object.create(EndoomChar);
                this.data.push(_nec);
            }
        }
        
        charImage = document.createElement("img");
        charImage.src = 'dos.png';
        charImage.onerror = function() {console.log("Image failed!");};
        var self = this;
        charImage.onload = function () {
        
            for (var i=0; i < 256; i++) {
                var newcan = document.createElement('canvas');
                newcan.width = 8;
                newcan.height = 16;
                var newctx = newcan.getContext('2d');
                
                var cx = (i % 32) * 8;
                var cy = Math.floor(i / 32) * 16;
                
                newctx.drawImage(charImage,cx,cy,8,16,0,0,8,16);
                self.charCanvas.push(newcan);
                self.charContext.push(newctx);
            }
            if (self.onLoad != null) {
                self.onLoad();
            }
        }
        
    },
    
    onLoad : null,
    
    toCanvasBlinked : function () {
        endoomDat = this.data;
                    
        var canv = document.createElement('canvas');
        canv.width = 8 * 80;
        canv.height = 16 * 25;
        var ctx = canv.getContext('2d');
        
        for (var i=0; i < 2000; i++) {
            var _c = endoomDat[i].charIndex;
            var _f = endoomDat[i].foreColor;
            if (endoomDat[i].blinking = true) _f = endoomDat[i].backColor;
            var _b = endoomDat[i].backColor;
            this.setTile(ctx,i % 80, Math.floor(i/80),_c,_b,_f);
        }
        
        return canv;
    },
    
    toCanvas : function () {
        endoomDat = this.data;
                    
        var canv = document.createElement('canvas');
        canv.width = 8 * 80;
        canv.height = 16 * 25;
        var ctx = canv.getContext('2d');
        
        for (var i=0; i < 2000; i++) {
            var _c = endoomDat[i].charIndex;
            var _f = endoomDat[i].foreColor;
            var _b = endoomDat[i].backColor;
            this.setTile(ctx,i % 80, Math.floor(i/80),_c,_b,_f);
        }
        
        return canv;
    }
}