const fs = require("fs");
const path = require("path");
const coreutils = require("../../utils/coreutils");

const ROOT_DIR = null; //path.resolve(__dirname);
const STORE = {};

function Snippets(context) {
  let $ = this;
  this.context = function (context) {
    let _context = {
      ...context,
    };
    Object.keys(STORE).map(function (name) {
      let snippet = STORE[name];
      $[name] = snippet($, _context);
    });
    return $;
  };
  if (context) this.context(context);
}

const readSnippets = function ({ snippetsDir }) {
  if (!snippetsDir) return;
  coreutils.log("snippets from ", snippetsDir);
  const filenames = fs.readdirSync(snippetsDir);
  filenames.forEach((filename) => {
    if (filename !== "index.js") {
      let snippet = require(path.join(snippetsDir, filename));
      STORE[filename.split(".")[0]] = snippet;
      //console.log("Loaded snippet", snippet);
    }
  });
};

/**
 *
 * @param {*} { root="Root directory", dir="relative path to scripts directory", scriptsDir="absolute path to scripts directory"}
 * @returns
 */
Snippets.load = function ({ root = ROOT_DIR, dir, snippetsDir }) {
  try {
    readSnippets({ snippetsDir: path.resolve(__dirname, "./") });

    if (!root) {
      root = coreutils.getCallerDir();
    }
    if (!snippetsDir) snippetsDir = path.resolve(root, dir);
    readSnippets({ snippetsDir });
  } catch (error) {
    console.error("Failed to read scripts", error);
  } finally {
    return Snippets;
  }
};

module.exports = Snippets;
