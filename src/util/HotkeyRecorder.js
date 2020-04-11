import * as keycodemap from "keycodemap";

let recorder;

export default class HotkeyRecorder {
  constructor() {}

  record(update, finish) {
    if (recorder) {
      // throw new Error('Other component already recording')
      window.removeEventListener("keydown", recorder.keydown);
      window.removeEventListener("keyup", recorder.keyup);

      recorder.finish(recorder.pressedKeys);
    }
    recorder = this;
    this.pressedKeys = [];
    this.lastCalled = [];
    this.update = update;
    this.finish = finish;

    this.keydown = event => {
      event.preventDefault();

      let alreadyPresent = false;
      for (let i = 0; i < this.pressedKeys.length; i++) {
        if (this.pressedKeys[i] === event.which) {
          alreadyPresent = true;
          break;
        }
      }
      if (!alreadyPresent) {
        this.pressedKeys.push(event.which);
      }
      if (!(this.pressedKeys.length === this.lastCalled.length)) {
        this.lastCalled = this.pressedKeys.slice();
        this.update(this.pressedKeys);
      }
    };

    window.addEventListener("keydown", this.keydown);

    this.keyup = event => {
      event.preventDefault();
      recorder = undefined;
      this.finish(this.pressedKeys);
      window.removeEventListener("keydown", this.keydown);
      window.removeEventListener("keyup", this.keyup);
    };

    window.addEventListener("keyup", this.keyup);
  }

  getNamesFromKeys(location) {
    console.log("keys:");
    if (location) {
      keycodemap.setMap(location);
    }
    const names = new Set();
    for (let i = 0; i < this.pressedKeys.length; i++) {
      const name = keycodemap.map(this.pressedKeys[i]);
      if (name === "" || name === undefined) {
        this.pressedKeys.splice(i, 1);
        i--;
      } else {
        names.add(name);
      }
    }
    return Array.from(names);
  }

  isRecording() {
    return this === recorder;
  }
}
