const mongon = require("@bootloader/mongon");
const TokenKeysSchema = require("../model/TokenKeysSchema");

const { cachebox } = require("@bootloader/redison");

module.exports = {
  async get({ domain, type, key }) {
    let cb = new cachebox({
      domain,
      name: "tokenKeys",
      type,
      ttl: 60,
    });
    try {
      let config = await cb.get(key);
      if (config) {
        return config;
      }
    } catch (e) {}
    let tokenKeys = mongon.model(TokenKeysSchema, { domain });
    let q = { disabled: false };
    if (type !== undefined) {
      q.type = type;
    }
    if (key !== undefined) {
      q.key = key;
    }
    let doc = await tokenKeys.findOne(q);
    if (doc) {
      await cb.set(key, doc);
    }
    return doc;
  },
};
