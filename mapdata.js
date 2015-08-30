var MapData = {
    
    things : null,
    vertexes : null,
    linedefs : null,
    sidedefs : null,
    segs : null,
    ssectors : null,
    nodes : null,
    sectors : null,
    reject : null,
    blockmap : null,
    wad : null,
    
    //boundaries
    
    top : null,
    left : null,
    bottom : null,
    right : null,
    
    //functions
    
    load : function(wad,mapname) {
        var mapLumpIndex = wad.getLumpIndexByName(mapname);
        
        this.wad = wad;
        this.things = [];
        this.segs = [];
        this.ssectors = [];
        this.nodes = [];
        this.reject = null;
        this.blockmap = null;
        
        //this.parseThings(wad.getLump(mapLumpIndex + 1));
        this.parseLinedefs(wad.getLump(mapLumpIndex + 2));
        this.parseSidedefs(wad.getLump(mapLumpIndex + 3));
        this.parseVertexes(wad.getLump(mapLumpIndex + 4));
        //this.parseSegs(wad.getLump(mapLumpIndex + 5));
        //this.parseSsectors(wad.getLump(mapLumpIndex + 6));
        //this.parseNodes(wad.getLump(mapLumpIndex + 7));
        this.parseSectors(wad.getLump(mapLumpIndex + 8));
        //this.parseReject(wad.getLump(mapLumpIndex + 9));
        //this.parseBlockmap(wad.getLump(mapLumpIndex + 10));
        
        this.calculateBoundaries();
    },
    
    calculateBoundaries : function() {
        this.top = this.vertexes[0].y;
        this.left = this.vertexes[0].x;
        this.bottom = this.vertexes[0].y;
        this.right = this.vertexes[0].x;
        for (var i = 1; i < this.vertexes.length; i++) {
            if (this.vertexes[i].x < this.left) this.left = this.vertexes[i].x;
            if (this.vertexes[i].x > this.right) this.right = this.vertexes[i].x;
            if (this.vertexes[i].y < this.top) this.top = this.vertexes[i].y;
            if (this.vertexes[i].y > this.bottom) this.bottom = this.vertexes[i].y;
        }
    },
    
    parseVertexes : function(lump) {
        this.vertexes = [];
        var dv = new DataView(lump);
        var len = dv.byteLength / 4;
        for (var i = 0; i < len; i++) {
            r = Object.create(Vertex);
            r.x = dv.getInt16((i * 4) + 0,true);
            r.y = dv.getInt16((i * 4) + 2,true);
            this.vertexes.push(r);
        }
    },
    
    parseLinedefs : function(lump) {
        this.linedefs = [];
        var dv = new DataView(lump);
        var len = dv.byteLength / 14;
        for (var i = 0; i < len; i++) {
            r = Object.create(Linedef);
            r.vx1 = dv.getUint16((i * 14) + 0,true);
            r.vx2 = dv.getUint16((i * 14) + 2,true);
            r.flags = dv.getUint16((i * 14) + 4,true);
            r.action = dv.getUint16((i * 14) + 6,true);
            r.tag = dv.getUint16((i * 14) + 8,true);
            r.right = dv.getUint16((i * 14) + 10,true);
            r.left = dv.getUint16((i * 14) + 12,true);
            this.linedefs.push(r);
        }
    },
    
    parseSidedefs : function(lump) {
        this.sidedefs = [];
        var dv = new DataView(lump);
        var j;
        var len = dv.byteLength / 30;
        for (var i = 0; i < len; i++) {
            r = Object.create(Sidedef);
            r.xOffset = dv.getUint16((i * 30) + 0,true);
            r.yOffset = dv.getUint16((i * 30) + 2,true);
            r.upper = readName(dv,(i * 30) + 4);
            r.lower = readName(dv,(i * 30) + 12);
            r.middle = readName(dv,(i * 30) + 20);
            r.sector = dv.getUint16((i * 30) + 28,true);
            this.sidedefs.push(r);
        }
    },
    
    parseSectors : function(lump) {
        this.sectors = [];
        var dv = new DataView(lump);
        var len = dv.byteLength / 26;
        for (var i = 0; i < len; i++) {
            r = Object.create(Sector);
            r.zFloor = dv.getUint16((i * 26) + 0,true);
            r.zCeil = dv.getUint16((i * 26) + 2,true);
            r.floorFlat = readName(dv,(i*26)+4);
            r.ceilFlat = readName(dv,(i*26)+12);
            r.light = dv.getUint16((i * 26) + 20,true);
            r.type = dv.getUint16((i * 26) + 22,true);
            r.tag = dv.getUint16((i * 26) + 24,true);
            this.sectors.push(r);
        }
    },
    
    toCanvas : function(width,height) {
        
        var canvas = document.createElement("canvas");
        
        var mwidth = this.right - this.left;
        var mheight = this.bottom - this.top;
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
        for (var i = 0; i < this.linedefs.length; i++) {
            //draw every linedef
            l = this.linedefs[i];
            
            var x1 = l.getVx1(this).x;
            var y1 = l.getVx1(this).y;
            var x2 = l.getVx2(this).x;
            var y2 = l.getVx2(this).y;
            
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
            context.strokeStyle = this.wad.playpal.palettes[0][96]; //default
            //check if it's 2 sided
            if (l.left != 65535) {
                //it is
                var s1 = this.sidedefs[l.right];
                var s2 = this.sidedefs[l.left];
                //floor height diff
                if (this.sectors[s1.sector].zFloor != this.sectors[s2.sector].zFloor) {
                    context.strokeStyle = this.wad.playpal.palettes[0][64];
                } else if (this.sectors[s1.sector].zCeil != this.sectors[s2.sector].zCeil) {
                    context.strokeStyle = this.wad.playpal.palettes[0][231];
                }
            } else {
                context.strokeStyle = this.wad.playpal.palettes[0][176];
            }
            
            
            //context.translate(0.5,0.5);
            context.beginPath();
            context.moveTo(Math.floor(x1) + 5.5, Math.floor(canvas.height - y1 - 5) + 0.5);
            context.lineTo(Math.floor(x2) + 5.5, Math.floor(canvas.height - y2 - 5) + 0.5);
            context.stroke();
        }
        
        return canvas;
    }
    
    
}

var Thing = {
    x : null,
    y : null,
    angle : null,
    type : null,
    flags : null
}

var Vertex = {
    x : null,
    y : null
}

var Linedef = {
    vx1 : null,
    vx2 : null,
    flags : null,
    action : null,
    tag : null,
    right : null,
    left : null,
    
    getVx1 : function(mapdata) {
        return mapdata.vertexes[this.vx1];
    },
    
    getVx2 : function(mapdata) {
        return mapdata.vertexes[this.vx2];
    }
}

var Sidedef = {
    xOffset : null,
    yOffset : null,
    upper : null,
    lower : null,
    middle : null,
    sector : null
}

var Seg = {
    
}

var Subsector = {

}

var Node = {

}

var Sector = {
    zFloor : null,
    zCeil : null,
    floorFlat : null,
    ceilFlat : null,
    light : null,
    type : null,
    tag : null
}

var Reject = {

}

var Blockmap = {

}