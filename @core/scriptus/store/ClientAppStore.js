const mongon = require("@bootloader/mongon");

const { cachebox } = require("@bootloader/redison");

module.exports = {
  async get({ domain, type, id, code }) {
    let key = [id, code].join("#");
    let cb = new cachebox({
      domain,
      name: "clientapps",
      type,
      ttl: 60,
    });
    try {
      let config = await cb.get(key);
      if (config) {
        return config;
      }
    } catch (e) {}

    //console.log(`MISSS====id(${id}) code(${code})`);
    let $ors = [];
    if (id && mongon.Types.ObjectId.isValid(id)) {
      $ors.push({ _id: mongon.Types.ObjectId(id) });
    } else if (code) {
      $ors.push({ queue: code });
    }
    const ConfigClientApp = mongon.getCollection(domain, `CONFIG_CLIENT_KEY`);
    const docs = await ConfigClientApp.find({
      $or: $ors,
    }).toArray();

    //console.log("doc::::",docs)

    if (!docs || docs.length == 0) {
      return docs;
    }

    let doc = null;
    if (docs.length == 1) {
      doc = docs[0];
    } else {
      doc = docs.find((doc) => doc._id == id) || docs[0];
    }

    if (doc) {
      doc = JSON.parse(JSON.stringify(doc));
      await cb.set(key, doc);
    }
    return doc;
  },
};
