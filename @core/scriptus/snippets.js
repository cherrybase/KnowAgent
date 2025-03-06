const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname);
const STORE = {};

function Snippets(scriptbox) {
  this.context = function (context) {
    let $ = {};
    let _context = {
      ...context,
      has: scriptbox.has,
      hasFunction: scriptbox.hasFunction,
      setting: scriptbox.setting,
    };
    Object.keys(STORE).map(function (name) {
      let snippet = STORE[name];
      $[name] = snippet($, _context);
    });
    return $;
  };
}

const readSnippets = function ({ scriptsDir }) {
  if (!scriptsDir) return;
  const filenames = fs.readdirSync(scriptsDir);
  filenames.forEach((filename) => {
    if (filename !== "index.js") {
      const { default: snippet } = require(join(scriptsDir, filename));
      STORE[filename.split(".")[0]] = snippet;
    }
  });
};

/**
 *
 * @param {*} { root="Root directory", dir="relative path to scripts directory", scriptsDir="absolute path to scripts directory"}
 * @returns
 */
Snippets.load = function ({ root = ROOT_DIR, dir, scriptsDir }) {
  try {
    if (!scriptsDir) scriptsDir = path.resolve(root, dir);
    readSnippets({ scriptsDir });
  } catch (error) {
    console.error("Failed to read scripts", error);
  } finally {
    return Snippets;
  }
};

module.exports = Snippets;
