//utility functions

export function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          }
        : null;
}

export function readName(dv: DataView, pos: number) {
    let output = "";
    for (let j = pos; j < pos + 8; j++) {
        if (dv.getUint8(j) != 0) {
            output += String.fromCharCode(dv.getUint8(j));
        }
    }
    return output;
}
