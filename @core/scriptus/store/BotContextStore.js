const mongon = require("@bootloader/mongon");
const BotContextSchema = require("../model/BotContextSchema");

module.exports = {
  async get({ app_id, contact_id, domain, tnt }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    let docs = await BotContext.find({ app_id: app_id, tnt: _domain, contactId: contact_id });
    //console.log("docs",docs);
    if (docs.length == 0) {
      const botContext = new BotContext({
        _id: app_id + _domain + contact_id,
        id: app_id + _domain + contact_id,
        tnt: _domain,
        app_id: app_id,
        contactId: contact_id,
        contact: {
          nextHandler: "",
          userData: {},
          lang: "",
          session_timeStamp: Date.now(),
          session: {
            handler: [],
            promise: [],
          },
        },
      });
      try {
        await botContext.save();
        return botContext;
      } catch (err) {
        console.log("!!dbservice.getContact", err);
        return err;
      }
    } else {
      var botContext = docs[0];
      if (botContext.contactId == contact_id) {
        return botContext;
      } else {
        var contact = {
          contactId: contact_id,
          nextHandler: "",
          lang: "",
          userData: {},
          session: {
            handler: [],
            promise: [],
          },
        };
        botContext.contact = {
          ...botContext.contact,
          ...contact,
        };
        try {
          await botContext.save();
          return botContext;
        } catch (err) {
          console.log("!!dbservice.getContact", err);
          return err;
        }
      }
    }
  },

  async commit({ app_id, contact_id, contact, domain, tnt }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    let docs = await BotContext.updateOne(
      { contactId: contact_id, app_id: app_id, tnt: _domain },
      {
        $set: {
          "contact.session.handler": contact.session.handler,
          "contact.session.promise": contact.session.promise,
        },
      }
    );
    //console.log(contact.session.handler);
    //console.log("UpdateDocsCommit", docs);
  },

  async clearSession({ contact_id, app_id, tnt, domain }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    //console.log("clearSession", app_id + contact_id + _domain);
    let docs = await BotContext.updateOne(
      { id: app_id + _domain + contact_id },
      {
        $set: {
          "contact.session.handler": [],
          "contact.session.promise": [],
        },
      }
    );
    ///console.log("clearSession", docs);
  },

  async clearUserData({ contact_id, app_id, tnt, domain }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    let docs = await BotContext.updateOne(
      { id: app_id + _domain + contact_id },
      {
        $set: {
          "contact.userData": {},
        },
      }
    );
    //console.log("clearUserData", docs);
  },

  async setUserData({ contact_id, app_id, tnt, domain, key, value }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    let docs = await BotContext.updateOne(
      { id: app_id + _domain + contact_id },
      {
        $set: {
          ["contact.userData." + key]: value,
        },
      }
    );
    //console.log("setUserData", docs);
  },

  async updateSessionTimeStamp({ contact_id, app_id, tnt, domain, session_id, routing_id }) {
    let _domain = domain || tnt;
    let BotContext = mongon.model(BotContextSchema, { domain: _domain });
    let docs = await BotContext.updateOne(
      { id: app_id + _domain + contact_id },
      {
        $set: {
          "contact.session.routingId": routing_id,
          "contact.session.sessionId": session_id,
          "contact.session_timeStamp": Date.now(),
        },
      }
    );
    // console.log("updateSessionTimeStamp",docs)
  },
};
