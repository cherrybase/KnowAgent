const mongon = require("@bootloader/mongon");
const GlobalVarsSchema = require("../model/GlobalVarsSchema");

module.exports = {
  async getGlobalVars({ keys, domain, tnt }) {
    let _domain = domain || tnt;
    let GlobalVars = mongon.model(GlobalVarsSchema, { domain: _domain });
    return GlobalVars.find()
      .or(
        keys.map(function (key) {
          return {
            key: key,
          };
        })
      )
      .then(function (docs) {
        const result = {};
        return docs.reduce(function (result, doc) {
          result[doc.key] = doc.value;
          return result;
        }, result);
      });
  },
};
