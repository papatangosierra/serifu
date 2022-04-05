import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { theDoc } from "../editor.js";

// This component is just one item in a menu of available download types
function MenuItem(props) {
  return (
    <option value={props.id} name="{props.name}">
      {props.name}
    </option>
  );
}

// props will contain a "type" (either "Source" or "Script")
export function DownloadScriptAs() {
  // state hook for which menu item is currently selected
  const [selected, setSelected] = useState(0);
  const dlTypes = [
    "Serifu",
    "Viz",
    "Kodansha USA",
    "Yen/Square Enix",
    // "Seven Seas",
  ];
  const menuItems = dlTypes.map((el, i) => {
    return <MenuItem id={i} name={el} key={`${i}-select`} />;
  });

  return (
    <>
      <label htmlFor="dl-select">Download format:</label>
      <select
        onChange={(e) => {
          setSelected(parseInt(e.currentTarget.value)); // the menu item's value will be set to a number, but I'm not certain it'll be typed as an integer or a string.
          console.log(`new selected value is: ${e.currentTarget.value}`);
        }}
        name="dltypes"
        id="dl-select"
      >
        {menuItems}
      </select>
      <button
        onClick={() => {
          console.log(`attempting to download, selected option: ${selected}`);
          theDoc.downloadAsSelectedType(selected);
        }}
      >
        Download
      </button>
    </>
  );
}
