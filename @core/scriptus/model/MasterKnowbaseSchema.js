const mongon = require("@bootloader/mongon");

const Schema = mongon.Schema(
  {
    parentId: { type: String },
    code: { type: String },
    type: { type: String },
    title: { type: String },
    lang: { type: String },
    category: { type: String },
    content: { type: String },
  },
  {
    minimize: false,
    collection: "DICT_KNOW_BASE",
  }
);

module.exports = Schema;
