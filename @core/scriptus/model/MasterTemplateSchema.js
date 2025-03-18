const mongon = require("@bootloader/mongon");

const Schema = mongon.Schema(
  {
    code: { type: String },
    name: { type: String },
    contactType: { type: String },
    lang: { type: String },
    category: { type: String },
    categoryType: { type: String },
    desc: { type: String },
    formatType: { type: String },
  },
  {
    minimize: false,
    collection: "DICT_HSM_TEMPLATES",
  }
);

module.exports = Schema;
