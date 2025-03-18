const path = require("path");

let OPTIONS = null;
module.exports = {
  options(options) {
    if (options) {
      OPTIONS = options;
    }
    return OPTIONS;
  },
  getAppPath(appName) {
    return ["default", "app"].indexOf(appName) >= 0 ? "app" : `app-${appName}`;
  },
  log() {
    console.log(`APP[${OPTIONS.name}]:`, ...arguments);
  },
  error() {
    console.error(`APP[${OPTIONS.name}]:`, ...arguments);
  },
  getCallerScript(_err, stackIndex = 2) {
    let err = _err;
    if (!err) {
      err = new Error();
      stackIndex++;
    }
    //console.error(err);
    const stack = err.stack.split("\n");

    // The 3rd line in the stack trace usually contains the caller
    const callerLine = stack[stackIndex];

    const match = callerLine.match(/\((.*):\d+:\d+\)/);
    return match ? match[1] : "Unknown caller";
  },
  getCallerDir(_err) {
    return path.dirname(this.getCallerScript(_err, 3));
  },
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  toFunction(executer) {
    return typeof executer === "function" ? executer : () => executer;
  },
};
