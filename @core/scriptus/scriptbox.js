const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname);
const STORE = {};

function ScriptBox({ name, code, load }) {
  if (!code) {
    code = STORE[name];
    if (!code) {
      code = load({ name });
    }
  }

  let script;
  if (code) {
    script = new vm.Script(code);
  } else {
    throw Error("Failed to load script", name);
  }

  var VM;

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

  this.run = function ({ contextName, timeout = 10 }) {
    script.runInNewContext(VM, {
      contextName: contextName,
      timeout: timeout, // default : 10 seconds
    });
  };
}

const readFiles = function ({ scriptsDir }) {
  if (!scriptsDir) return;
  const filenames = fs.readdirSync(scriptsDir);
  filenames.forEach((filename) => {
    if (filename !== "index.js") {
      const content = fs.readFileSync(`${scriptsDir}/${filename}`, "utf-8");
      STORE[filename.split(".")[0]] = content;
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
    if (!scriptsDir) scriptsDir = path.resolve(root, dir);
    readFiles({ scriptsDir });
  } catch (error) {
    console.error("Failed to read scripts", error);
  } finally {
    return ScriptBox;
  }
};

module.exports = ScriptBox;
