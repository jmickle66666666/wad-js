"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wad = (function () {

    //takes a fileobject as an argument

    function Wad() {
        _classCallCheck(this, Wad);

        this.ident = "";
    }

    _createClass(Wad, [{
        key: "load",
        value: function load(file, onload) {
            var reader = new FileReader();

            reader.onload = function (e) {
                this.data = reader.result;
                var i;
                var headerReader = new DataView(this.data);

                for (i = 0; i < 4; i++) this.ident += String.fromCharCode(headerReader.getUint8(i));
                console.log(this.ident);
                var numlumps = headerReader.getInt32(4, true);
                var dictpos = headerReader.getInt32(4, true);
                // the size of the dictionary is 16 * numlumps so slice that shit then create the obj
                var dictionaryBuffer = this.data.slice(dictpos, dictpos + numlumps * 16);
                this.dictionary = new WadDict(dictionaryBuffer);

                if (onload != null) {
                    onload();
                }
            };

            reader.readAsArrayBuffer(file);
        }
    }]);

    return Wad;
})();

var WadDict =

//takes a dictionary shaped arraybuffer and stores all the lump names and positions
function WadDict(data) {
    _classCallCheck(this, WadDict);

    this.lumps = [];
};

var WadDictEntry = function WadDictEntry(position, size, name) {
    _classCallCheck(this, WadDictEntry);

    this.name = name;
    this.size = size;
    this.position = position;
};