/* squeeze-worker.js is a web worker that takes the document text as its input, 
runs the squeeze compression on it, and returns the compressed data structure
to the main script */

import { Squeezer } from "./squeeze.js";

// actual web worker code starts here
onmessage = (e) => {
  console.log(`squeeze worker got message from main script: ${e.data}`);
  if (typeof e.data === "string" && e.data.length > 0) {
    let s = new Squeezer(e.data.replace(/\u001f/g, "")).squozed; // strip out \u001f if it's there (it probably isn't, but if it is, for some reason, we'll lose data, because it's the separator for Squeezer dictionary fields.
    postMessage([s.uniques, s.seq]); // send uniques and sequence back to main thread
  } else {
    console.log(
      "squeeze worker not given string to compress; returning empty strings."
    );
    postMessage(["", ""]);
  }
};
