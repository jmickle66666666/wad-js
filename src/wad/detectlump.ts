/*

Description:

Utility for detecting what type a lump is.

*/

import * as CONST from "./constants";

export const detectLumpType = function(index) {
    //TODO: get patches from pnames

    function headerCheck(dataView, header) {
        var chrs = header.split("");
        for (var i = 0; i < header.length; i++) {
            if (header.charCodeAt(i) != dataView.getUint8(i)) return false;
        }
        return true;
    }

    //data-based detection
    if (this.lumps[index].size != 0) {
        var dv = new DataView(this.data, this.lumps[index].pos);
        if (headerCheck(dv, "MThd")) return CONST.MIDI;
        if (headerCheck(dv, "ID3")) return CONST.MP3;
        if (headerCheck(dv, "MUS")) return CONST.MUS;
        if (headerCheck(dv, String.fromCharCode(137) + "PNG")) return CONST.PNG;
    }

    //name-based detection
    var name = this.lumps[index].name;
    if (CONST.TEXTLUMPS.indexOf(name) >= 0) return CONST.TEXT;
    if (CONST.MAPLUMPS.indexOf(name) >= 0) return CONST.MAPDATA;
    if (CONST.DATA_LUMPS.indexOf(name) >= 0) return name;
    if (/^MAP\d\d/.test(name)) return CONST.MAP;
    if (/^E\dM\d/.test(name)) return CONST.MAP;
    if (/_START$/.test(name)) return CONST.MARKER;
    if (/_END$/.test(name)) return CONST.MARKER;

    if (this.lumps[index].size == 0) return CONST.MARKER;

    //between markers
    for (var i = index; i >= 0; i--) {
        if (/_END$/.test(this.lumps[i].name)) break;
        if (/_START$/.test(this.lumps[i].name)) {
            let pre = this.lumps[i].name.substr(
                0,
                this.lumps[i].name.indexOf("_") + 1
            );
            if (CONST.GRAPHIC_MARKERS.indexOf(pre) >= 0) return CONST.GRAPHIC;
            if (CONST.FLAT_MARKERS.indexOf(pre) >= 0) return CONST.FLAT;
        }
    }

    //shitty name-based detection
    if (/^D_/.test(name)) return MUSIC;

    // Doom GFX check
    function isDoomGFX(dv, lump) {
        // first check the dimensions aren't ridiculous
        if (dv.getUint16(0, true) > 4096) return false; // width
        if (dv.getUint16(2, true) > 4096) return false; // height
        if (dv.getInt16(4, true) > 2000 || dv.getInt16(4, true) < -2000)
            return false; // offsets
        if (dv.getInt16(6, true) > 2000 || dv.getInt16(6, true) < -2000)
            return false;

        // then check it ends in 0xFF
        if (dv.getUint8(lump.size - 1) != 0xff) {
            // sometimes the graphics have up to 3 garbage 0x00 bytes at the end
            var found = false;
            for (var b = 1; b <= 4; b++) {
                if (found == false) {
                    if (dv.getUint8(lump.size - b) == 0xff) {
                        found = true;
                    } else if (dv.getUint8(lump.size - b) != 0x00) {
                        return false;
                    }
                }
            }
            if (found == false) return false;
        }
        // I think this is enough for now. If I get false positives, I'll look into more comprehensive checks.
        return true;
    }

    if (isDoomGFX(dv, this.lumps[index])) return CONST.GRAPHIC;

    return "...";
};
