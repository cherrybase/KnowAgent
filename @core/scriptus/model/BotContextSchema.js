const mongon = require("@bootloader/mongon");

const schema = mongon.Schema(
  {
    _id: String,
    id: { type: String, index: true },
    tnt: { type: String, index: true },
    app_id: { type: String, index: true },
    contactId: { type: String, index: true },
    contact: {
      userData: Object,
      nextHandler: String,
      session_timeStamp: { type: Date, default: Date.now },
      lang: String,
      session: {
        sessionId: String,
        routingId: String,
        handler: [{ type: Object }],
        promise: [{ type: Object }],
        sessionData: Object,
      },
    },
  },
  { minimize: false, collection: "AS_BOT_CONTEXT" }
);

module.exports = schema;
