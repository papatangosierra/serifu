import React from "react";
import ReactDOM from "react-dom";

import { EditorView } from "@codemirror/view";
import { showPanel } from "@codemirror/panel";
import { Text } from "@codemirror/text";

import { view, theDoc } from "../editor.js";

function saveSlots(view) {
  let dom = document.createElement("div");
  dom.id = "saveslotsbar";
  dom.textContent = `Save slots go here, and if they're not here, something's wrong.`;
  return {
    dom: dom,
  };
}

export function saveSlotPanel() {
  return showPanel.of(saveSlots);
}

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

// SaveSlots are the individual tab-buttons that indicate the available save slots slot as well as setting the current active slot
class SaveSlot extends React.Component {
  constructor(props) {
    super(props);
    this.handleActiveChange = this.handleActiveChange.bind(this); //
  }

  handleActiveChange(e, slot) {
    console.log(`handling click on ${slot}`);
    this.props.onUpdateActiveSlot(slot);
  }

  render() {
    const slotName = this.props.slot;
    const theDocName = this.props.docName;
    return (
      <div
        className={this.props.open ? "slot-active" : "slot"}
        // Using this arrow function to pass this.props.slot was CRUCIAL
        onClick={(e) => {
          this.handleActiveChange(e, this.props.slot);
        }}
      >
        {this.props.slot}
        <span>{this.props.docName}</span>
      </div>
    );
  }
}

export class SaveSlotBar extends React.Component {
  constructor(props) {
    super(props);
    // Define our save slot labels
    this.slots = ["♥︎", "★", "✿"];
    // initialize the active slot to whatever's specified in localStorage
    this.state = {
      activeSlot: this.slots.indexOf(
        localStorage.getItem("current-active-slot")
      ),
      docNames: [],
    };
    // initalize any localStorage save slots that don't already exist
    this.slots.forEach((slot) => {
      if (localStorage.getItem(`slot-${slot}-name`) === null) {
        theDoc.saveToSlot(slot, slot, "-Empty-");
      }
    });
    // add localStorage docNames to state
    this.slots.forEach((slot) => {
      this.state.docNames.push(localStorage.getItem(`slot-${slot}-name`));
    });
    this.updateActiveSlot = this.updateActiveSlot.bind(this);
  }

  componentDidMount() {
    // Set up autosave timer here.
    this.autoSaveTimer = setInterval(() => {
      // FIXME: Add a clearInterval() here! probably in componentWillUnmount() or something
      this.saveToCurrentSlot();
    }, 10000); // autosave every 10 seconds

    // set up "save button clicked" event listener here
    document.addEventListener("saveRequested", (e) => {
      console.log("manual save!!!");
      this.saveToCurrentSlot();
    });
  }

  // saveToCurrentSlot saves the current document to the current active save slot
  saveToCurrentSlot() {
    console.log(`SaveSlotBar saving to: ${this.slots[this.state.activeSlot]}`);
    // update state with current document name
    let newDocNames = this.state.docNames; // start with current docNames
    newDocNames[this.state.activeSlot] = id("docname").textContent; // update the name of the currently selected slot
    console.log(`current docNames: ${JSON.stringify(this.state.docNames)}`);
    console.log(`new docNames: ${JSON.stringify(newDocNames)}`);
    this.setState({
      docNames: newDocNames,
    });
    theDoc.saveToSlot(
      this.slots[this.state.activeSlot],
      view.state.doc.toString(),
      id("docname").textContent
    );
  }

  updateActiveSlot(newActiveSlot) {
    let newSlotIndex = this.slots.indexOf(newActiveSlot);
    this.setState({
      activeSlot: newSlotIndex,
    });
    // if the slot that was selected isn't the current slot
    if (newSlotIndex != this.state.activeSlot) {
      // Fetch new editor state from slot
      const newText = {
        docName: localStorage.getItem(`slot-${newActiveSlot}-name`),
        docText: theDoc.textFromSlot(this.slots[newSlotIndex]),
      };
      // build the slot change event
      const event = new CustomEvent("saveSlotChange", { detail: newText });
      // emit slot change event
      document.dispatchEvent(event);
      // record current slot in localStorage
      localStorage.setItem("current-active-slot", this.slots[newSlotIndex]);
    }
  }

  render() {
    const barSlots = this.slots.map((slot, index) => {
      return (
        <SaveSlot
          key={slot}
          slot={slot}
          docName={this.state.docNames[index]}
          open={this.state.activeSlot === index} // true if we're on the active slot, false otherwise.
          // onUpdateActiveSlot={this.updateActiveSlot(this.slots.indexOf(slot))}
          onUpdateActiveSlot={this.updateActiveSlot}
        />
      );
    });
    return <div id="saveslots">{barSlots}</div>;
  }
}

export function manualSave() {
  const event = new CustomEvent("saveRequested");
  document.dispatchEvent(event);
}
