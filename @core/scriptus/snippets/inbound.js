import { redis, RQueue, waitForReady } from "@bootloader/redison";

module.exports = function (
  $,
  {
    meta,
    server,
    tnt,
    app_id,
    appCode,
    domain,
    contact_id,
    channel_id,
    session_id,
    routing_id,
    session,
    inbound,
    execute,
    has,
  }
) {
  return {
    ...inbound,
    getContactType() {
      return this.contact?.contactType;
    },
    intentions: null,
    getIntentions() {
      return this.intentions;
    },
  };
};
