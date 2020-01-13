import { Playpal } from "./playpal";
import { detectLumpType } from "./detectlump";

export interface LumpEntry {
    pos: number;
    size: number;
    name: string;
}

export class Wad {
    onProgress: (() => void) | null;
    onLoad: (() => void) | null;
    ident: string;
    numlumps: number;
    dictpos: number;
    data: ArrayBuffer;
    lumps: LumpEntry[];
    playpal: Playpal;
    errormsg: string;

    detectLumpType: typeof detectLumpType;
    chunkReaderBlock: ((x: number, y: number, z: File) => void) | null;

    constructor() {
        this.onProgress = null;
        this.onLoad = null;
        this.ident = "";
        this.numlumps = 0;
        this.dictpos = 0;
        this.data = new ArrayBuffer(0);
        this.lumps = [];
        this.playpal = new Playpal();
        this.errormsg = "";

        this.detectLumpType = detectLumpType;
        this.chunkReaderBlock = null;
    }

    error(msg: string): void {
        this.errormsg = msg;
    }

    loadURL(url: string): void {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        var self = this;
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = this.response;
                self.load(blob);
            }
        };
        xhr.send();
    }

    load(blob: File): void {
        var self = this;

        self.lumps = [];

        var offset = 0;
        var chunkSize = -1;

        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onprogress = self.onProgress;

        reader.onload = function(e) {
            if (e.target === null) {
                throw new Error("Missing target");
            } else if (e.target.result === null) {
                throw new Error("Target result is null");
            } else if (typeof e.target.result === "string") {
                throw new Error("Target result is string");
            }
            self.data = e.target.result;

            // header reading
            var headerReader = new DataView(e.target.result);
            for (var i = 0; i < 4; i++)
                self.ident += String.fromCharCode(headerReader.getUint8(i));
            if (self.ident != "IWAD" && self.ident != "PWAD") {
                self.error("Not a valid WAD file.");
                if (self.onLoad !== null) {
                    self.onLoad();
                }
            } else {
                self.numlumps = headerReader.getInt32(4, true);
                self.dictpos = headerReader.getInt32(8, true);
                offset = self.dictpos;
                chunkSize = 128;

                if (self.chunkReaderBlock === null) {
                    throw new Error("chunkReaderBlock is missing");
                }
                self.chunkReaderBlock(self.dictpos, chunkSize, blob);
            }
        };

        var nextChunk = function(e: ProgressEvent) {
            if (e.target === null) {
                throw new Error("Target is null");
            }
            const result = (e.target as typeof FileReader["prototype"]).result;
            if (!(result instanceof ArrayBuffer)) {
                throw new Error("Result is not of proper type");
            }
            offset += result.byteLength;

            var dataReader = new DataView(result);

            for (var i = 0; i < dataReader.byteLength / 16; i++) {
                var p = i * 16;
                var lumpPos = dataReader.getInt32(p, true);
                var lumpSize = dataReader.getInt32(p + 4, true);
                var lumpName = "";
                for (let j = p + 8; j < p + 16; j++) {
                    if (dataReader.getUint8(j) != 0) {
                        lumpName += String.fromCharCode(dataReader.getUint8(j));
                    }
                }

                const lumpEntry = {
                    pos: lumpPos,
                    size: lumpSize,
                    name: lumpName
                };
                self.lumps.push(lumpEntry);
            }

            if (offset >= blob.size) {
                if (self.onProgress !== null) {
                    self.onProgress();
                }
                if (self.onLoad !== null) {
                    self.onLoad();
                }
                self.playpal = new Playpal();
                const playpal = self.getLumpByName("PLAYPAL");
                if (playpal !== null) {
                    self.playpal.load(playpal);
                }
                return;
            }

            if (self.chunkReaderBlock === null) {
                throw new Error("chunkReaderBlock is missing");
            }
            self.chunkReaderBlock(offset, chunkSize, blob);
        };

        self.chunkReaderBlock = function(_offset, chunkSize, data) {
            var r = new FileReader();
            var b = data.slice(_offset, _offset + chunkSize);
            r.onload = nextChunk;
            r.onprogress = self.onProgress;
            r.readAsArrayBuffer(b);
        };
    }

    save(): void {
        var name = prompt("Save as...", "output.wad");
        if (name !== null && this.data != null) {
            var toDownload = new Blob([this.data], { type: "octet/stream" });
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            var url = window.URL.createObjectURL(toDownload);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }

    saveLump(index: number): void {
        var name = this.lumps[index].name + ".lmp";
        var toDownload = new Blob([this.getLump(index)], {
            type: "octet/stream"
        });
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        var url = window.URL.createObjectURL(toDownload);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    lumpExists(name: string): boolean {
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                return true;
            }
        }
        return false;
    }

    getLumpByName(name: string): ArrayBuffer | null {
        for (var i = 0; i < this.numlumps; i++) {
            if (this.lumps[i].name == name) {
                const l = this.lumps[i];
                return this.data.slice(l.pos, l.pos + l.size);
            }
        }
        return null;
    }

    getLumpIndexByName(name: string) {
        for (var i = this.numlumps - 1; i >= 0; i--) {
            if (this.lumps[i].name == name) {
                return i;
            }
        }
        return null;
    }

    getLumpAsText(index: number): string {
        var dat = this.getLump(index);
        return Wad.lumpDataToText(dat);
    }

    static lumpDataToText(data: ArrayBuffer): string {
        let output = "";
        var dv = new DataView(data);
        for (let i = 0; i < data.byteLength; i++)
            output += String.fromCharCode(dv.getUint8(i));
        return output;
    }

    getLump(index: number): ArrayBuffer {
        const l = this.lumps[index];
        return this.data.slice(l.pos, l.pos + l.size);
    }
}
