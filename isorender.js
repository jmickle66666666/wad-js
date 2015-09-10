var IsoRender = {
    
    wad : null,
    mapdata : null,
    top : null,
    left : null,
    bottom : null,
    right : null,
    
    calculateBoundaries : function() {
        
        map = this.mapdata;
        
        this.top = map.vertexes[0].y;
        this.left = map.vertexes[0].x;
        this.bottom = map.vertexes[0].y;
        this.right = map.vertexes[0].x;
        this.topHeight = 0;
        this.bottomHeight = 0;
        
        for (var i = 0; i < map.sectors.length; i++){
            if (map.sectors[i].zCeil > this.topHeight) this.topHeight = map.sectors[i].zCeil;
            if (map.sectors[i].zFloor > this.bottomHeight) this.bottomHeight = map.sectors[i].zFloor;
        }
        
        for (var i = 1; i < map.vertexes.length; i++) {
            if (map.vertexes[i].x < map.left) map.left = map.vertexes[i].x;
            if (map.vertexes[i].x > map.right) map.right = map.vertexes[i].x;
            if (map.vertexes[i].y < map.top) map.top = map.vertexes[i].y;
            if (map.vertexes[i].y > map.bottom) map.bottom = map.vertexes[i].y;
        }
    },
    
    rotateVertexes : function(angle) {
        
        rverts = map.vertexes;
        centerX = (this.mapdata.left + this.mapdata.right)/2;
        centerY = (this.mapdata.top + this.mapdata.bottom)/2;
        
        for (var i = 0; i < rverts.length; i++) {
            px = rverts[i].x;
            py = rverts[i].y;

            theta = angle;
            ox = centerX;
            oy = centerY;
            tmpX = Math.cos(theta) * (px-ox) - Math.sin(theta) * (py-oy) + ox
            tmpY = Math.sin(theta) * (px-ox) + Math.cos(theta) * (py-oy) + oy
            rverts[i].x = tmpX;
            rverts[i].y = tmpY;
        }
        
        return rverts;
    },
    
    toCanvas : function (width,height,angle) {
        
        if (angle < 0) angle = Math.random() * Math.PI;
        
        var rverts = this.rotateVertexes(angle);
        this.calculateBoundaries(); //we gotta do this after rotation. for OBVIOUS dang reasons
        
        var canvas = document.createElement("canvas");
        
        var mwidth = this.mapdata.right - this.mapdata.left;
        var mheight = this.mapdata.bottom - this.mapdata.top;
        var r;
        
        if ((height/width) < (mwidth/mheight)) {
            canvas.height = height + 10;
            r = height / mheight;
            canvas.width = (r * mwidth) + 10;
        } else {
            canvas.width = width + 10;
            r = width / mwidth;
            canvas.height = (r * mheight) + 10;
        }
        
        var context = canvas.getContext("2d");
        context.fillStyle = this.wad.playpal.palettes[0][0];
        context.fillRect(0,0,canvas.width,canvas.height);
        context.imageSmoothingEnabled = false;
        for (var i = 0; i < this.mapdata.linedefs.length; i++) {
            //draw every linedef
            l = this.mapdata.linedefs[i];
            
            var x1 = l.getVx1(this.mapdata).x;
            var y1 = l.getVx1(this.mapdata).y;
            var x2 = l.getVx2(this.mapdata).x;
            var y2 = l.getVx2(this.mapdata).y;
            
            //scale to fit the shit ok
            x1 -= this.mapdata.left;
            x2 -= this.mapdata.left;
            y1 -= this.mapdata.top;
            y2 -= this.mapdata.top;
            
            x1 *= r;
            x2 *= r;
            y1 *= r;
            y2 *= r;
            
            //color checking 
            context.strokeStyle = '#33dd33'; //default
            
            
            //context.translate(0.5,0.5);
            context.beginPath();
            context.moveTo(Math.floor(x1) + 5.5, Math.floor(canvas.height - y1 - 5) + 0.5);
            context.lineTo(Math.floor(x2) + 5.5, Math.floor(canvas.height - y2 - 5) + 0.5);
            context.stroke();
        }
        
        return canvas;
    }
}