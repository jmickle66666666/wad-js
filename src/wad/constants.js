//constants 
var TEXT = "text";
var MAP = "map";
var MAPDATA = "mapdata";
var MUSIC = "music";
var MIDI = "midi";
var MP3 = "mp3";
var PNG = "png";
var MUS = "mus";
var GRAPHIC = "graphic";
var FLAT = "flat";
var MARKER = "marker";
var PLAYPAL = "PLAYPAL";
var COLORMAP = "COLORMAP";
var ENDOOM = "ENDOOM";
var PNAMES = "PNAMES";
var TEXTUREx = ["TEXTURE1","TEXTURE2"];
var GRAPHIC_MARKERS = ["P_","PP_","P1_","P2_","P3_","S_","S2_","S3_","SS_"];
var FLAT_MARKERS = ["F_","FF_","F1_","F2_","F3_"];
var MAPLUMPS = ["THINGS","LINEDEFS","SIDEDEFS","VERTEXES","SEGS","TEXTMAP",
                "SSECTORS","NODES","SECTORS","REJECT","BLOCKMAP","BEHAVIOR","ZNODES"];
var TEXTLUMPS = [ "DEHACKED", "MAPINFO", "ZMAPINFO", "EMAPINFO", 
                  "DMXGUS", "DMXGUSC", "WADINFO", "EMENUS", "MUSINFO",
                  "SNDINFO", "GLDEFS", "KEYCONF", "SCRIPTS", "LANGUAGE",
                  "DECORATE", "SBARINFO", "MENUDEF" ];
var DATA_LUMPS = [ "PLAYPAL", "COLORMAP", "TEXTURE1", "TEXTURE2", "PNAMES",
                    "ENDOOM"];

var DEFAULT_EXTENSION = "lmp";
var EXTENSIONS = {
    "text" : "txt",
    "mp3" : "mp3",
    "mus" : "mus",
    "midi" : "mid",
    "png" : "png"
};
