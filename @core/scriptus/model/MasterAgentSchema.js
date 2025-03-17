const mongon = require("@bootloader/mongon");

const Schema = mongon.Schema(
  {
    agent_code: { type: String, alias: "code" },
    agent_name: { type: String, alias: "name" },
    agent_email: { type: String, alias: "email" },
    isactive: { type: String },
    isEnabled: { type: Boolean },
    isDefaultValue: { type: Boolean },
    admin: Boolean,
  },
  {
    minimize: false,
    collection: "AGENTS",
  }
);

module.exports = Schema;
