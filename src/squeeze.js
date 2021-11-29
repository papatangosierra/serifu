// my home-rolled dictionary compression algorithm

export class Squeezer {
  constructor(str) {
    if (typeof str === "string") {
      this.squeezeObj = this.squeeze(str);
    } else {
      this.squeezeObj = str;
    }
  }
  squeeze(str) {
    let origtext = str.split(/\b/); // split text on word/nonword boundary
    let uniques = origtext.filter(trueIfUnique).join("\u001f"); // build uniques list
    let seq = "";

    function trueIfUnique(val, i, self) {
      return self.indexOf(val) === i; // true if this is the first time
    } // we've seen val, false otherwise

    for (let i = 0; i < origtext.length; i++) {
      // TODO: replace with forEach
      seq += String.fromCodePoint(uniques.split("\u001f").indexOf(origtext[i]));
    }

    return { uniques, seq };
  }

  get squozed() {
    return this.squeezeObj;
  }

  sizeOfSquozed() {
    // from https://stackoverflow.com/questions/1248302/how-to-get-the-size-of-a-javascript-object
    let objectList = [];
    let stack = [this.squeezeObj];
    let bytes = 0;
    while (stack.length) {
      let value = stack.pop();

      if (typeof value === "boolean") {
        bytes += 4;
      } else if (typeof value === "string") {
        bytes += value.length * 2;
      } else if (typeof value === "number") {
        bytes += 8;
      } else if (
        typeof value === "object" &&
        objectList.indexOf(value) === -1
      ) {
        objectList.push(value);
        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  }

  // *inflate() returns an ITERATABLE that yields the next uncompressed element
  // in the given string. To get the entire uncompressed text as a single
  // string, use [...Squeeze.inflate()].join("")
  *inflate() {
    let i = 0;
    let uniquesList = this.squeezeObj.uniques.split("\u001f"); // rebuild array from string.
    while (i < this.squeezeObj.seq.length) {
      //      yield this.squeezeObj.uniques[this.squeezeObj.seq[i].charCodeAt(0)];
      yield uniquesList[this.squeezeObj.seq.charCodeAt(i)];
      i++;
    }
  }
}
