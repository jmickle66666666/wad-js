import { createLumpList } from "./panels/lump_list";
import { Wad } from "./wad";
import * as CONST from "./wad/constants";

var self = this;
var errormsg: string | null = null;
var lumpnames = ["a", "b", "c"];
var fileInput = document.getElementById("fileInput") as HTMLInputElement;
var fileDisplayArea = document.getElementById("test");
var lumpList = null;
var loadingInterval;
var errors = document.getElementById("errors");

$("#preview").hide();
$("#lumpTable").hide();
$("#loading").hide();

var progress = 0;

var wad = new Wad();

function initWad() {
    if (errors === null) {
        throw new Error("Error element is missing");
    }

    errormsg = null;
    $(errors).html("");
    $("#preview").hide();
    $("#lumpTable").hide();
    $("#loading").show();
    progress = 0;

    // [AM] What is this?
    //if (lumpList) lumpList.destructor();
    lumpnames = [];

    wad = new Wad();
    wad.onProgress = updateLoading;

    wad.onLoad = wadOnLoad;
}

function loadURL() {
    initWad();
    const urlInput = document.getElementById("urlInput") as HTMLInputElement;
    wad.loadURL(urlInput.value);
}

fileInput.addEventListener("change", function(e) {
    initWad();
    if (fileInput.files === null) {
        throw new Error("File list is missing files array");
    }
    var file = fileInput.files[0];
    console.log(file);
    wad.load(file);
});

var updateLoading = function() {
    progress++;
    var bar = (36 * progress) / ((wad.numlumps * 16) / 128);
    var loadingbar = "[";
    for (var i = 0; i < bar; i++) loadingbar += ".";
    for (i = bar; i < 36; i++) loadingbar += "&nbsp;";
    const loading = document.getElementById("loading");
    if (loading === null) {
        throw new Error("Loading element is missing");
    }
    loading.innerHTML = loadingbar + "]";
};

export function getIcon(lumpType) {
    if (lumpType == CONST.MAP) return '<img src="icons/map.png">';
    if (lumpType == CONST.MAPDATA) return '<img src="icons/mapdata.png">';
    if (lumpType == CONST.TEXT) return '<img src="icons/text.png">';
    if (lumpType == CONST.PLAYPAL) return '<img src="icons/playpal.png">';
    if (lumpType == CONST.ENDOOM) return '<img src="icons/endoom.png">';
    if (lumpType == CONST.COLORMAP) return '<img src="icons/colormap.png">';
    if (lumpType == CONST.MUSIC) return '<img src="icons/music.png">';
    if (lumpType == CONST.MIDI) return '<img src="icons/midi.png">';
    if (lumpType == CONST.MP3) return '<img src="icons/mp3.png">';
    if (lumpType == CONST.GRAPHIC) return '<img src="icons/graphic.png">';
    if (lumpType == CONST.FLAT) return '<img src="icons/flat.png">';
    if (lumpType == CONST.PNG) return '<img src="icons/png.png">';
    if (lumpType == CONST.MUS) return '<img src="icons/mus.png">';
    if (lumpType == CONST.MARKER) return '<img src="icons/marker.png">';
    if (lumpType == CONST.PNAMES) return '<img src="icons/pnames.png">';
    if (CONST.TEXTUREx.indexOf(lumpType) >= 0)
        return '<img src="icons/texturex.png">';
    else return '<img src="icons/unknown.png">';
}

function wadOnLoad() {
    $("#loading").hide();

    if (errors === null) {
        throw new Error("Error element is missing");
    }
    if (errormsg != null) {
        $(errors).html(errormsg);
    } else {
        createLumpList(wad, lumpnames);
    }
}
