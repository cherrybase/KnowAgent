const fs = require("fs");
const path = require("path");
const coreutils = require("../utils/coreutils");
var vm = require("vm");

const ROOT_DIR = null; //path.resolve(__dirname);
const STORE = {};

function ScriptBox({ name, name_fallback = [], code, load }) {
  if (!code) {
    code = STORE[name];

    if (!code) {
      name_fallback = typeof name_fallback === "string" ? [name_fallback] : name_fallback;
      for (let index = 0; index < name_fallback.length; index++) {
        const fname = name_fallback[index];
        code = STORE[fname];
        if (code) break;
      }

      if (!code) {
        code = load({ name });
      }
    }
  }

  let script;
  if (code) {
    script = new vm.Script(code);
  } else {
    throw Error("Failed to load script", name);
  }

  var VM;

  this.context = function (context) {
    VM = context;
    return this;
  };

  this.execute = function (method, ...args) {
    return VM[method](...args);
  };

  this.has = function (method) {
    return !!VM[method];
  };

  this.hasFunction = function (method) {
    return !!VM[method] && typeof VM[method] == "function";
  };

  this.setting = function (key) {
    return VM[key];
  };

  this.run = function ({ contextName, timeout = 10000 }) {
    script.runInNewContext(VM, {
      contextName: contextName,
      timeout: timeout, // default : 10000 milliseconds
    });
  };
}

const readFiles = function ({ scriptsDir }) {
  if (!scriptsDir) return;

  if (!fs.existsSync(scriptsDir)) {
    console.warn(`Warning: Directory "${scriptsDir}" does not exist.`);
    return;
  }

  coreutils.log("scripts from ", scriptsDir);
  const filenames = fs.readdirSync(scriptsDir);
  filenames.forEach((filename) => {
    if (filename !== "index.js") {
      const content = fs.readFileSync(`${scriptsDir}/${filename}`, "utf-8");
      STORE[filename.split(".")[0]] = content;
      console.log("Loaded script", filename);
    }
  });
};

/**
 *
 * @param {*} { root="Root directory", dir="relative path to scripts directory", scriptsDir="absolute path to scripts directory"}
 * @returns
 */
ScriptBox.load = function ({ root = ROOT_DIR, dir, scriptsDir }) {
  try {
    if (!root) {
      root = coreutils.getCallerDir();
    }
    if (!scriptsDir) scriptsDir = path.resolve(root, dir);
    readFiles({ scriptsDir });
  } catch (error) {
    console.error("Failed to read scripts", error);
  } finally {
    return ScriptBox;
  }
};

module.exports = ScriptBox;
