const mongon = require("@bootloader/mongon");

const schema = mongon.Schema(
  {
    key: String,
    type: String,
    description: String,
    shared: Boolean,
    value: mongon.Schema.Types.Mixed,
    secret: mongon.Schema.Types.Mixed,
  },
  { minimize: false, collection: "CONFIG_TOKEN_KEYS" }
);

module.exports = schema;
