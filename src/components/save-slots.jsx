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

// theDoc.saveToSlot(slot), theDoc.openFromSlot(view, slot)

class SaveToSaveSlotsButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {}
}

class LoadFromSaveSlotsButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {}
}

class ModalDialogBackground extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    <modal-background></modal-background>;
  }
}

class ModalSelectSaveSlot extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    <modal id="saveslotsmodal">
      <div className="modaltitle">Save Game</div>
      <SaveSlot slot="♥︎" />
      <SaveSlot slot="★" />
      <SaveSlot slot="✿" />
    </modal>;
  }
}

class SaveSlot extends React.Component {
  constructor(props) {
    super(props);
    console.log(
      `constructing SaveSlot. props.slot: ${props.slot}, props.open: ${props.open}`
    );
    this.state = {
      open: props.open, // boolean
      docName: localStorage.getItem(`slot-${props.slot}-name`) // if there's a saved docname corresponding to this slot, pick it up, otherwise "-Empty-"
        ? localStorage.getItem(`slot-${props.slot}-name`)
        : "-Empty-",
    };
    this.handleActiveChange = this.handleActiveChange.bind(this); //
  }

  handleActiveChange(e, slot) {
    console.log(`handling click on ${slot}`);
    // TODO: put codemirror view update code here
    this.props.onUpdateActiveSlot(slot);
  }

  render() {
    const slotName = this.props.slot;
    const theDocName = this.props.docName;
    console.log(
      `rendering slot ${this.props.slot}, open is: ${this.props.open}`
    );
    return (
      <div
        className={this.props.open ? "slot-active" : "slot"}
        onClick={(e) => {
          this.handleActiveChange(e, this.props.slot);
        }}
      >
        {this.props.slot}
        <span>{this.state.docName}</span>
      </div>
    );
  }
}

export class SaveSlotBar extends React.Component {
  constructor(props) {
    super(props);
    // if we have an active save slot specified in local storage, use that, otherwise default to ♥︎
    this.state = {
      activeSlot: 1,
    };
    this.slots = ["♥︎", "★", "✿"];
    this.updateActiveSlot = this.updateActiveSlot.bind(this);
  }

  componentDidMount() {
    // TODO: Set up autosave timer here.
  }

  autoSave() {
    // TODO: Implement autosave that's aware of the current save slot.
  }

  updateActiveSlot(newActiveSlot) {
    this.setState({
      activeSlot: this.slots.indexOf(newActiveSlot),
    });
  }

  render() {
    const barSlots = this.slots.map((slot, index) => {
      return (
        <SaveSlot
          key={slot}
          slot={slot}
          open={this.state.activeSlot === index} // true if we're on the active slot, false otherwise.
          // onUpdateActiveSlot={this.updateActiveSlot(this.slots.indexOf(slot))}
          onUpdateActiveSlot={this.updateActiveSlot}
        />
      );
    });
    return <div id="saveslots">{barSlots}</div>;
  }
}

class SaveSlotSaveButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { slotname: props.slotname };
  }
  render() {
    return (
      <button
        onClick={() => {
          theDoc.saveToSlot(this.state.slotname);
        }}
      >
        Overwrite
      </button>
    );
  }
}

class SaveSlotOpenButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { slotname: props.slotname };
  }
  render() {
    return (
      <button
        onClick={() => {
          theDoc.openFromSlot(view, this.state.slotname);
        }}
      >
        Open
      </button>
    );
  }
}
