let recorder;

export default class HotkeyRecorder {
  constructor(update, finish, error) {
    this.update = update;
    this.finish = finish;
    this.error = error;
    this.pressedKeys = [];
    this.lastCalled = [];
    this.displayKeys = {};
  }

  async record() {
    if (recorder) {
      window.removeEventListener("keydown", recorder.keydown);
      window.removeEventListener("keyup", recorder.keyup);

      recorder.finish(recorder.pressedKeys);
    }
    recorder = this;
    const keyboardMap = await navigator.keyboard.getLayoutMap();

    this.keydown = (event) => {
      event.preventDefault();
      const keyCode = event.which;
      const localizedKey =
        keyboardMap.get(event.code) || this.getElectronNames([keyCode])[0];

      let alreadyPresent = false;
      for (let i = 0; i < this.pressedKeys.length; i++) {
        if (this.pressedKeys[i] === event.which) {
          alreadyPresent = true;
          break;
        }
      }
      if (!alreadyPresent) {
        this.pressedKeys.push(keyCode);
        this.displayKeys[keyCode] = localizedKey;
      }
      if (
        !this.getElectronNames(this.pressedKeys).every(
          (e) => !!e && e.length > 0
        )
      ) {
        this.error();
        window.removeEventListener("keydown", this.keydown);
        window.removeEventListener("keyup", this.keyup);
        console.log("ERROR");
      }
      if (!(this.pressedKeys.length === this.lastCalled.length)) {
        this.lastCalled = this.pressedKeys.slice();
        this.update(this.pressedKeys);
      }
    };

    window.addEventListener("keydown", this.keydown);

    this.keyup = (event) => {
      event.preventDefault();
      recorder = undefined;
      this.finish(this.pressedKeys);
      window.removeEventListener("keydown", this.keydown);
      window.removeEventListener("keyup", this.keyup);
    };

    window.addEventListener("keyup", this.keyup);
  }

  isRecording() {
    return this === recorder;
  }

  getLocaleNames() {
    return this.pressedKeys.sort().map((key) => {
      return this.displayKeys[key];
    });
  }

  getElectronNames(keys) {
    const electronValues = [
      "", // [0]
      "", // [1]
      "", // [2]
      "", // [3]
      "", // [4]
      "", // [5]
      "", // [6]
      "", // [7]
      "Backspace", // [8]
      "Tab", // [9]
      "", // [10]
      "", // [11]
      "", // [12]
      "Return", // [13]
      "", // [14]
      "", // [15]
      "Shift", // [16]
      "Ctrl", // [17] CmdOrCtrl
      "Alt", // [18]
      "MediaPlayPause", // [19]
      "", // [20]
      "", // [21]
      "", // [22]
      "", // [23]
      "", // [24]
      "", // [25]
      "", // [26]
      "Escape", // [27]
      "", // [28]
      "", // [29]
      "", // [30]
      "", // [31]
      "Space", // [32]
      "PageUp", // [33]
      "PageDown", // [34]
      "End", // [35]
      "Home", // [36]
      "Left", // [37]
      "Up", // [38]
      "Right", // [39]
      "Down", // [40]
      "", // [41]
      "", // [42]
      "", // [43]
      "PrintScreen", // [44]
      "Insert", // [45]
      "Delete", // [46]
      "", // [47]
      "0", // [48]
      "1", // [49]
      "2", // [50]
      "3", // [51]
      "4", // [52]
      "5", // [53]
      "6", // [54]
      "7", // [55]
      "8", // [56]
      "9", // [57]
      "", // [58]
      ";", // [59]
      "", // [60]
      "=", // [61]
      "", // [62]
      "", // [63]
      "", // [64]
      "A", // [65]
      "B", // [66]
      "C", // [67]
      "D", // [68]
      "E", // [69]
      "F", // [70]
      "G", // [71]
      "H", // [72]
      "I", // [73]
      "J", // [74]
      "K", // [75]
      "L", // [76]
      "M", // [77]
      "N", // [78]
      "O", // [79]
      "P", // [80]
      "Q", // [81]
      "R", // [82]
      "S", // [83]
      "T", // [84]
      "U", // [85]
      "V", // [86]
      "W", // [87]
      "X", // [88]
      "Y", // [89]
      "Z", // [90]
      "", // [91] Windows Key (Windows) or Command Key (Mac)
      "", // [92]
      "", // [93]
      "", // [94]
      "", // [95]
      "", // [96]
      "", // [97]
      "", // [98]
      "", // [99]
      "", // [100]
      "", // [101]
      "", // [102]
      "", // [103]
      "", // [104]
      "", // [105]
      "", // [106]
      "", // [107]
      "", // [108]
      "", // [109]
      "", // [110]
      "", // [111]
      "F1", // [112]
      "F2", // [113]
      "F3", // [114]
      "F4", // [115]
      "F5", // [116]
      "F6", // [117]
      "F7", // [118]
      "F8", // [119]
      "F9", // [120]
      "F10", // [121]
      "F11", // [122]
      "F12", // [123]
      "F13", // [124]
      "F14", // [125]
      "F15", // [126]
      "F16", // [127]
      "F17", // [128]
      "F18", // [129]
      "F19", // [130]
      "F20", // [131]
      "F21", // [132]
      "F22", // [133]
      "F23", // [134]
      "F24", // [135]
      "", // [136]
      "", // [137]
      "", // [138]
      "", // [139]
      "", // [140]
      "", // [141]
      "", // [142]
      "", // [143]
      "", // [144]
      "", // [145]
      "", // [146]
      "", // [147]
      "", // [148]
      "", // [149]
      "", // [150]
      "", // [151]
      "", // [152]
      "", // [153]
      "", // [154]
      "", // [155]
      "", // [156]
      "", // [157]
      "", // [158]
      "", // [159]
      "", // [160]
      "", // [161]
      "", // [162]
      "", // [163]
      "", // [164]
      "", // [165]
      "", // [166]
      "", // [167]
      "", // [168]
      "", // [169]
      "", // [170]
      "", // [171]
      "", // [172]
      "", // [173]
      "", // [174]
      "", // [175]
      "", // [176]
      "", // [177]
      "", // [178]
      "", // [179]
      "", // [180]
      "VolumeMute", // [181]
      "VolumeDown", // [182]
      "VolumeUp", // [183]
      "", // [184]
      "", // [185]
      ";", // [186]
      "=", // [187]
      ",", // [188]
      "-", // [189]
      ".", // [190]
      "/", // [191]
      "`", // [192]
      "", // [193]
      "", // [194]
      "", // [195]
      "", // [196]
      "", // [197]
      "", // [198]
      "", // [199]
      "", // [200]
      "", // [201]
      "", // [202]
      "", // [203]
      "", // [204]
      "", // [205]
      "", // [206]
      "", // [207]
      "", // [208]
      "", // [209]
      "", // [210]
      "", // [211]
      "", // [212]
      "", // [213]
      "", // [214]
      "", // [215]
      "", // [216]
      "", // [217]
      "", // [218]
      "[", // [219]
      "\\", // [220]
      "]", // [221]
      "'", // [222]
      "", // [223]
      "", // [224]
      "AltGr", // [225]
      "", // [226]
      "", // [227]
      "", // [228]
      "", // [229]
      "", // [230]
      "", // [231]
      "", // [232]
      "", // [233]
      "", // [234]
      "", // [235]
      "", // [236]
      "", // [237]
      "", // [238]
      "", // [239]
      "", // [240]
      "", // [241]
      "", // [242]
      "", // [243]
      "", // [244]
      "", // [245]
      "", // [246]
      "", // [247]
      "", // [248]
      "", // [249]
      "", // [250]
      "", // [251]
      "", // [252]
      "", // [253]
      "", // [254]
      "", // [255]
    ];

    const names = new Set();
    for (let i = 0; i < keys.length; i++) {
      const name = electronValues[keys[i]];
      if (name === "" || name === undefined) {
        keys.splice(i, 1);
        i--;
      } else {
        names.add(name);
      }
    }
    return Array.from(names);
  }
}
