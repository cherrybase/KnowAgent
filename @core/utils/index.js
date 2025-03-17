const string_utils = require("./string_utils.js");
const coreutils = require("./coreutils.js");

module.exports = {
  toName(arg) {
    if (typeof arg == "function") return arg.name;
    return arg;
  },
  string: string_utils,
  coreutils,
};
