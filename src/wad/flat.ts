import { hexToRgb } from "./util";
import { Wad } from "../wad";

export class Flat {
    data: number[];

    constructor() {
        this.data = [];
    }

    load(lumpData: ArrayBuffer): void {
        var dv = new DataView(lumpData);
        this.data = [];
        for (var j = 0; j < 4096; j++) {
            this.data.push(dv.getUint8(j));
        }
    }

    toCanvas(wad: Wad): HTMLCanvasElement {
        var scaleSize = 3;
        var canvas = document.createElement("canvas");
        canvas.width = 64 * scaleSize;
        canvas.height = 64 * scaleSize;
        var context = canvas.getContext("2d");
        if (context === null) {
            throw new Error("Could not obtain 2d context");
        }
        var imageData = context.createImageData(64, 64);
        for (var i = 0; i < 4096; i++) {
            const col = hexToRgb(wad.playpal.palettes[0][this.data[i]]);
            if (col === null) {
                continue;
            }
            imageData.data[i * 4 + 0] = col.r;
            imageData.data[i * 4 + 1] = col.g;
            imageData.data[i * 4 + 2] = col.b;
            imageData.data[i * 4 + 3] = 255;
        }
        var newCanvas = document.createElement("canvas");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        const newctx = newCanvas.getContext("2d");
        if (newctx === null) {
            throw new Error("Could not obtain 2d context");
        }
        newctx.putImageData(imageData, 0, 0);
        context.scale(scaleSize, scaleSize);
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);
        return canvas;
    }
}
