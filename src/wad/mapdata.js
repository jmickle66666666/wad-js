var MapData = {
    
    // internal data

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
    
    thingTable : null,

    // map information

    name : null,
    music : null,
    format : null,
    
    //boundaries
    
    top : null,
    left : null,
    bottom : null,
    right : null,
    
    //functions
    
    load : function(wad,mapname) {
        var mapLumpIndex = wad.getLumpIndexByName(mapname);
        
        this.wad = wad;
        this.reject = null;
        this.blockmap = null;
        this.nodesExist;

        // Detect the format of the map first
        if (wad.lumps[mapLumpIndex + 1].name == "TEXTMAP") this.format = "UDMF";
        else {
            // Get a list of the map lumps associated with this map
            var pos = 1;
            mapdatalumps = [];
            nextLump = wad.lumps[mapLumpIndex + pos].name;
            while (MAPLUMPS.indexOf(nextLump) > -1) {
                mapdatalumps.push(nextLump);
                pos += 1;
                if (wad.lumps.length == pos + mapLumpIndex) break;
                nextLump = wad.lumps[mapLumpIndex + pos].name;
            }

            if (mapdatalumps.indexOf("BEHAVIOR") > -1) this.format = "Hexen";
            else this.format = "Doom";

            function getMapLump(lumpName) {
                return wad.getLump(mapLumpIndex + mapdatalumps.indexOf(lumpName) + 1);
            }
        }

        if (this.format == "Doom") {
            this.parseThings(getMapLump("THINGS"));
            this.parseLinedefs(getMapLump("LINEDEFS"));
            this.parseSidedefs(getMapLump("SIDEDEFS"));
            this.parseVertexes(getMapLump("VERTEXES"));
            this.parseSegs(getMapLump("SEGS"));
            this.parseSsectors(getMapLump("SSECTORS"));
            this.parseNodes(getMapLump("NODES"));
            this.parseSectors(getMapLump("SECTORS"));
            //this.parseReject(wad.getLump(mapLumpIndex + 9));
            //this.parseBlockmap(wad.getLump(mapLumpIndex + 10));
            this.calculateBoundaries();
        }
        if (this.format == "Hexen") {
            this.parseHexenThings(getMapLump("THINGS"));
            this.parseHexenLinedefs(getMapLump("LINEDEFS"));
            this.parseSidedefs(getMapLump("SIDEDEFS"));
            this.parseVertexes(getMapLump("VERTEXES"));
            this.parseSegs(getMapLump("SEGS"));
            this.parseSsectors(getMapLump("SSECTORS"));
            this.parseNodes(getMapLump("NODES"));
            this.parseSectors(getMapLump("SECTORS"));
            //this.parseReject(wad.getLump(mapLumpIndex + 9));
            //this.parseBlockmap(wad.getLump(mapLumpIndex + 10));
            this.calculateBoundaries();
        }

        this.name = mapname;

        // When MAPINFO parsing is done there can be more accurate checks
        if (/^E\dM\d/.test(mapname)) {
            if (wad.lumpExists("MUS_"+mapname)) this.music = "MUS_"+mapname; // Heretic
            if (wad.lumpExists("D_"+mapname)) this.music = "D_"+mapname; // Doom 1
        }
        if (Doom2DefaultMusic[mapname]!= null) this.music = Doom2DefaultMusic[mapname];
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
    
    parseThings : function(lump) {
        this.things = [];
        var entryLen = 10;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Thing);
            r.x = dv.getInt16((i * entryLen) + 0, true);
            r.y = dv.getInt16((i * entryLen) + 2, true);
            r.angle = dv.getInt16((i * entryLen) + 4, true);
            r.type = dv.getInt16((i * entryLen) + 6, true);
            r.flags = dv.getInt16((i * entryLen) + 8, true);
            this.things.push(r);
        }
    },
    
    parseVertexes : function(lump) {
        this.vertexes = [];
        var entryLen = 4;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Vertex);
            r.x = dv.getInt16((i * entryLen) + 0,true);
            r.y = dv.getInt16((i * entryLen) + 2,true);
            this.vertexes.push(r);
        }
    },
    
    parseLinedefs : function(lump) {
        this.linedefs = [];
        var entryLen = 14;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Linedef);
            r.vx1 = dv.getUint16((i * entryLen) + 0,true);
            r.vx2 = dv.getUint16((i * entryLen) + 2,true);
            r.flags = dv.getUint16((i * entryLen) + 4,true);
            r.action = dv.getUint16((i * entryLen) + 6,true);
            r.tag = dv.getUint16((i * entryLen) + 8,true);
            r.right = dv.getUint16((i * entryLen) + 10,true);
            r.left = dv.getUint16((i * entryLen) + 12,true);
            this.linedefs.push(r);
        }
    },
    
    parseSidedefs : function(lump) {
        this.sidedefs = [];
        var entryLen = 30;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Sidedef);
            r.xOffset = dv.getUint16((i * entryLen) + 0,true);
            r.yOffset = dv.getUint16((i * entryLen) + 2,true);
            r.upper = readName(dv,(i * entryLen) + 4);
            r.lower = readName(dv,(i * entryLen) + 12);
            r.middle = readName(dv,(i * entryLen) + 20);
            r.sector = dv.getUint16((i * entryLen) + 28,true);
            this.sidedefs.push(r);
        }
    },
    
    parseSectors : function(lump) {
        this.sectors = [];
        var entryLen = 26;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Sector);
            r.zFloor = dv.getUint16((i * entryLen) + 0,true);
            r.zCeil = dv.getUint16((i * entryLen) + 2,true);
            r.floorFlat = readName(dv,(i*entryLen)+4);
            r.ceilFlat = readName(dv,(i*entryLen)+12);
            r.light = dv.getUint16((i * entryLen) + 20,true);
            r.type = dv.getUint16((i * entryLen) + 22,true);
            r.tag = dv.getUint16((i * entryLen) + 24,true);
            this.sectors.push(r);
        }
    },
    
    parseSegs : function(lump) {
        this.segs = [];
        var entryLen = 12;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Seg);
            r.vx1 = dv.getUint16((i * entryLen) + 0,true);
            r.vx2 = dv.getUint16((i * entryLen) + 2,true);
            r.angle = dv.getUint16((i * entryLen) + 4,true);
            r.linedef = dv.getUint16((i * entryLen) + 6,true);
            r.direction = dv.getUint16((i * entryLen) + 8,true);
            r.offset = dv.getUint16((i * entryLen) + 10,true);
            this.segs.push(r);
        }
    },
    
    parseSsectors : function(lump) {
        this.ssectors = [];
        var entryLen = 4;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Subsector);
            r.segCount = dv.getUint16((i * entryLen) + 0,true);
            r.first = dv.getUint16((i * entryLen) + 2,true);
            this.ssectors.push(r);
        }
    },
    
    parseNodes : function(lump) {
        this.nodes = [];
        var entryLen = 28;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(Node);
            r.partitionX = dv.getUint16((i * entryLen) + 0,true);
            r.partitionY = dv.getUint16((i * entryLen) + 2,true);
            r.changeX = dv.getUint16((i * entryLen) + 4,true);
            r.changeY = dv.getUint16((i * entryLen) + 6,true);
            r.boundsRight = {
                "top":dv.getUint16((i * entryLen) + 8,true),
                "bottom":dv.getUint16((i * entryLen) + 10,true),
                "left":dv.getUint16((i * entryLen) + 12,true),
                "right":dv.getUint16((i * entryLen) + 14,true)
            };
            r.boundsLeft = {
                "top":dv.getUint16((i * entryLen) + 16,true),
                "bottom":dv.getUint16((i * entryLen) + 18,true),
                "left":dv.getUint16((i * entryLen) + 20,true),
                "right":dv.getUint16((i * entryLen) + 22,true)
            };
            r.childRight = dv.getUint16((i * entryLen) + 24,true);
            r.childLeft = dv.getUint16((i * entryLen) + 26,true);
            this.nodes.push(r);
        }
    },

    parseHexenThings : function(lump) {
        this.things = [];
        var entryLen = 20;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(HexenThing);
            r.tid = dv.getInt16((i * entryLen) + 0, true);
            r.x = dv.getInt16((i * entryLen) + 2, true);
            r.y = dv.getInt16((i * entryLen) + 4, true);
            r.z = dv.getInt16((i * entryLen) + 6, true);
            r.angle = dv.getInt16((i * entryLen) + 8, true);
            r.type = dv.getInt16((i * entryLen) + 10, true);
            r.flags = dv.getInt16((i * entryLen) + 12, true);
            r.special = dv.getInt8((i * entryLen) + 14);
            for (var j = 0; j < 5; j++) {
                r.args[j] = dv.getInt8((i * entryLen) + 15 + j);
            }
            this.things.push(r);
        }
    },

    parseHexenLinedefs : function(lump) {
        this.linedefs = [];
        var entryLen = 16;
        var dv = new DataView(lump);
        var len = dv.byteLength / entryLen;
        for (var i = 0; i < len; i++) {
            r = Object.create(HexenLinedef);
            r.vx1 = dv.getUint16((i * entryLen) + 0,true);
            r.vx2 = dv.getUint16((i * entryLen) + 2,true);
            r.flags = dv.getUint16((i * entryLen) + 4,true);
            r.action = dv.getUint8((i * entryLen) + 6);
            for (var j = 0; j < 5; j++) {
                r.args[j] = dv.getInt8((i * entryLen) + 7 + j);
            }
            r.right = dv.getUint16((i * entryLen) + 12,true);
            r.left = dv.getUint16((i * entryLen) + 14,true);
            this.linedefs.push(r);
        }
    },
        
    toCanvas : function(width,height) {
          
        // Early-out if it is not a Doom format map.
        if (this.format == "UDMF") {
           var output = document.createElement("div");
           output.innerHTML = "Unable to render "+this.format+" format maps.";
           return output;
        }

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
        context.imageSmoothingEnabled = false;
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
    },
    
    getDoomThingName : function(id) {
        for (var prop in DoomThingTable) {
            if (DoomThingTable.hasOwnProperty(prop)) {
                if (DoomThingTable[prop] === id) {
                    return prop;
                }
            }
        }
    },
    
    getThingTable : function() {
        this.thingTable = [];
        for (var i = 0; i < this.things.length; i++) {
            if (this.thingTable[this.things[i].type] == undefined) {
                this.thingTable[this.things[i].type] = 1;
            } else {
                this.thingTable[this.things[i].type] += 1;
            }
        }
        return this.thingTable;
    },
    
    getThingCount : function(type) {
        var output = 0;
        for (var i = 0; i < this.things.length; i++) {
            if (this.things[i].type == type) output += 1;
        }
        return output;
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
    vx1 : null,
    vx2 : null,
    angle : null,
    linedef : null,
    direction : null,
    offset : null
}

var Subsector = {
    segCount : null,
    first : null
}

var Node = {
    partitionX : null,
    partitionY : null,
    changeX : null,
    changeY : null,
    boundsRight : null,
    boundsLeft : null,
    childRight : null,
    childLeft : null
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

var HexenThing = {
    tid : null,
    x : null,
    y : null,
    z : null,
    angle : null,
    type : null,
    flags : null,
    special : null,
    args : []
}

var HexenLinedef = {
    vx1 : null,
    vx2 : null,
    flags : null,
    action : null,
    args : [],
    right : null,
    left : null,
    
    getVx1 : function(mapdata) {
        return mapdata.vertexes[this.vx1];
    },
    
    getVx2 : function(mapdata) {
        return mapdata.vertexes[this.vx2];
    }
}

var DoomThingGroups = {
    "Monsters" : [68,64,3003,3005,65,72,16,3002,3004,9,69,3001,67,71,66,58,7,84],
    "Powerups" : [2023,2026,2014,2024,2022,2045,83,2013,2015,2019,2018,2012,2025,2011],
    "Weapons" : [2006,2002,2005,2004,2003,2001,82],
    "Ammunition" : [2007,2048,2046,2049,2047,17,2010,2008,8],
    "Keys" : [5,40,13,38,6,39]
}

var DoomThingTable = {
  "zombie":3004,
  "sergeant":9,
  "commando":65,
  "imp":3001,
  "demon":3002,
  "spectre":58,
  "lost soul":3006,
  "cacodemon":3005,
  "hell knight":69,
  "baron of hell":3003,
  "revenant":66,
  "mancubus":67,
  "arachnotron":68,
  "pain elemental":71,
  "archvile":64,
  "cyberdemon":16,
  "spider mastermind":7,
  "ss guy":84,
  "spawn target":87,
  "spawn shooter":89,
  "romero head":88,
  "commander keen":72,
  "shotgun":2001,
  "super shotgun":82,
  "chaingun":2002,
  "rocket launcher":2003,
  "plasma gun":2004,
  "chainsaw":2005,
  "bfg 9000":2006,
  "ammo clip":2007,
  "ammo box":2048,
  "shells":2008,
  "shell box":2049,
  "rocket":2010,
  "rocket box":2046,
  "cell charge":2047,
  "cell pack":17,
  "backpack":8,
  "stimpack":2011,
  "medikit":2012,
  "supercharge":2013,
  "health bonus":2014,
  "armor bonus":2015,
  "green armor":2018,
  "blue armor":2019,
  "invulnerability":2022,
  "berserk":2023,
  "invisibility":2024,
  "radiation suit":2025,
  "computer map":2026,
  "goggles":2048,
  "megasphere":83,
  "red keycard":13,
  "yellow keycard":6,
  "blue keycard":5,
  "red skull key":38,
  "yellow skull key":39,
  "blue skull key":40,
  "player 1 start":1,
  "player 2 start":2,
  "player 3 start":3,
  "player 4 start":4,
  "deathmatch start":11,
  "teleport destination":14,
  "gibs 1":10,
  "gibs 2":12,
  "dead marine":15,
  "dead zombie":18,
  "dead sergeant":19,
  "dead imp":20,
  "dead demon":21,
  "dead cacodemon":22,
  "dead lost soul":23,
  "pool of blood":24,
  "impaled human 1":25,
  "impaled human 2":26,
  "skull on pole":27,
  "five skulls":28,
  "skull pile":29,
  "hangman 1":49,
  "hangman 2":50,
  "hangman 3":51,
  "hangman 4":52,
  "hangman 5":53,
  "hangman 2 (passable)":59,
  "hangman 4 (passable)":60,
  "hangman 3 (passable)":61,
  "hangman 5 (passable)":62,
  "hangman 1 (passable)":63,
  "green pillar":30,
  "short green pillar":31,
  "red pillar":32,
  "short red pillar":33,
  "candle":34,
  "candelabra":35,
  "green pillar with heart":36,
  "red pillar with skull":37,
  "eye":41,
  "skull rock":42,
  "gray tree":43,
  "blue torch":44,
  "green torch":45,
  "red torch":46,
  "scrub":47,
  "tech column":48,
  "brown tree":54,
  "short blue torch":55,
  "short green torch":56,
  "short red torch":57,
  "floor lamp":2028,
  "barrel":2035
}

var Doom2DefaultMusic = {
    "MAP01":"D_RUNNIN",
    "MAP02":"D_STALKS",
    "MAP03":"D_COUNTD",
    "MAP04":"D_BETWEE",
    "MAP05":"D_DOOM",
    "MAP06":"D_THE_DA",
    "MAP07":"D_SHAWN",
    "MAP08":"D_DDTBLU",
    "MAP09":"D_IN_CIT",
    "MAP10":"D_DEAD",
    "MAP11":"D_STLKS2",
    "MAP12":"D_THE_DA2",
    "MAP13":"D_DOOM2",
    "MAP14":"D_DDTBL2",
    "MAP15":"D_RUNNI2",
    "MAP16":"D_DEAD2",
    "MAP17":"D_STLKS3",
    "MAP18":"D_ROMERO",
    "MAP19":"D_SHAWN2",
    "MAP20":"D_MESSAG",
    "MAP21":"D_COUNT2",
    "MAP22":"D_DDTBL3",
    "MAP23":"D_AMPIE",
    "MAP24":"D_THEDA3",
    "MAP25":"D_ADRIAN",
    "MAP26":"D_MESSG2",
    "MAP27":"D_ROMER2",
    "MAP28":"D_TENSE",
    "MAP29":"D_SHAWN3",
    "MAP30":"D_OPENIN",
    "MAP31":"D_EVIL",
    "MAP32":"D_ULTIMA"
}
