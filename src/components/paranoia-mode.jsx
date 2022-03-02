import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
// my imports
import { theDoc, view } from "../editor.js";

export function ParanoiaMode() {
  // we need two state variables: A boolean to track whether this mode is on or off...
  const [enabled, setEnabled] = useState(false);
  // ...and a string to remember the last downloaded state of the document, since we only want to download if it's changed.
  const [lastDocText, setLastDocText] = useState("");

  // and here we set an Effect Hook to put the download function on a timer.
  // the paranoiaDownload interval function always runs, even when paranoia mode is
  // not enabled. Every five minutes, it checks to see if enabled is true and if the document
  // has changed since the last autosave. If both are true, it generates a download.
  useEffect(() => {
    let paranoiaDownload = setInterval(() => {
      // If Paranoia mode is enabled and the doc has changed since our last download
      if (enabled === true && theDoc.text != lastDocText) {
        theDoc.downloadAsText(
          `${document.getElementById("docname").textContent} (Auto)`,
          theDoc.text
        );
        setLastDocText(theDoc.text);
      }
    }, 300000);
    return function cleanUp() {
      clearInterval(paranoiaDownload);
    };
  });

  return (
    <>
      <input
        type="checkbox"
        id="paranoia"
        name="paranoia"
        onClick={() => {
          console.log("toggling paranoia...");
          setEnabled(!enabled);
        }}
      />
      <label htmlFor="paranoia">Paranoia Mode</label>
    </>
  );
}
