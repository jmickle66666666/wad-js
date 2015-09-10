var IsoRender = {
    
    wad : null,
    mapdata : null,
    top : null,
    left : null,
    bottom : null,
    right : null,
    topHeight : null,
    bottomHeight : null,
    rverts : null,
    
    calculateBoundaries : function(verts) {
        
        map = this.mapdata;
        
        this.top = verts[0].y;
        this.left = verts[0].x;
        this.bottom = verts[0].y;
        this.right = verts[0].x;
        this.topHeight = map.sectors[0].zCeil;
        this.bottomHeight = map.sectors[0].zFloor;
        
        for (var i = 0; i < map.sectors.length; i++){
            if (map.sectors[i].zCeil > this.topHeight) this.topHeight = map.sectors[i].zCeil;
            if (map.sectors[i].zFloor < this.bottomHeight) this.bottomHeight = map.sectors[i].zFloor;
        }
        
        for (var i = 1; i < verts.length; i++) {
            if (verts[i].x < map.left) map.left = verts[i].x;
            if (verts[i].x > map.right) map.right = verts[i].x;
            if (verts[i].y < map.top) map.top = verts[i].y;
            if (verts[i].y > map.bottom) map.bottom = verts[i].y;
        }
    },
    
    rotateVertexes : function(angle) {
        
        var rverts = map.vertexes;
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
        
        this.rverts = rverts;
    },
    
    getVx1 : function(line) {
        return this.rverts[line.vx1];
    },
    
    getVx2 : function(line) {
        return this.rverts[line.vx2];
    },
    
    toCanvas : function (width,height,angle) {
        
        if (angle < 0) angle = Math.random() * Math.PI;
        
        this.rotateVertexes(angle);
        this.calculateBoundaries(this.rverts); //we gotta do this after rotation. for OBVIOUS dang reasons
        
        var canvas = document.createElement("canvas");
        
        var mwidth = this.right - this.left;
        var mheight = (this.bottom - this.top) + (this.topHeight - this.bottomHeight);
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
            
            var x1 = this.getVx1(l).x;
            var y1 = this.getVx1(l).y;
            var x2 = this.getVx2(l).x;
            var y2 = this.getVx2(l).y;
            
            //scale to fit the shit ok
            x1 -= this.left;
            x2 -= this.left;
            y1 -= this.top;
            y2 -= this.top;
            
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