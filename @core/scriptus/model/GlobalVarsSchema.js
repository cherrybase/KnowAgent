const mongon = require("@bootloader/mongon");

const schema = mongon.Schema(
  {
    key: String,
    description: String,
    shared: Boolean,
    value: mongon.Schema.Types.Mixed,
  },
  { minimize: false, collection: "CONFIG_COMP_VARS" }
);

module.exports = schema;
