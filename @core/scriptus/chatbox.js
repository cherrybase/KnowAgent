const ScriptBox = require("./scriptbox");
const Snippets = require("./snippets");
const BotContextStore = require("./store/BotContextStore");

const path = require("path");
const coreutils = require("../utils/coreutils");
const { cachebox } = require("@bootloader/redison");

const ROOT_DIR = null; //path.resolve(__dirname);

function ChatBox({ isSessionStart, isSessionRouted, handler = [], message }) {
  const context = message.toContext();
  context.domain = context.tnt || context.domain;
  context.tnt = context.domain;
  const { appCode, app_id, contact_id, session_id, meta, server, tnt, domain, inbound } = context;

  this.init = function ({ contact: { userData, session } }) {
    const sb = new ScriptBox({
      name: appCode,
      id: app_id,
    });

    //Create Snippets Context
    const $ = new Snippets({
      //Meta
      ...context,
      // Session
      session: session, //??
      userData: userData,
      config: {}, //scriptConfig ???
      domainbox: cachebox({
        name: "domainbox",
        domain: domain,
        ttl: 60 * 60 * 24 * 1,
      }),
      sessionbox: cachebox({
        name: "sessionbox",
        domain: tnt,
        context: session_id,
        ttl: 60 * 60 * 24 * 3,
      }),
      has: sb.has,
      hasFunction: sb.hasFunction,
      execute: sb.execute,
      setting: sb.setting,
    });

    //Create ScriptBox Context and Run it
    sb.context({
      // inbound: inbound,
      // message: text,
      // userData: userData,
      // inputCode: inputCode,
      setTimeout: setTimeout,
      $: $,
      console: console,

      // setResolver: function (resolverName) {
      //   dbservice.setResolver(app_id, resolverName, contact_id, tnt);
      // },
      // data: function (key, value) {
      //   return $.store.data(key, value);
      // },
      // clearSession: function () {
      //   var contactDetails = { contact_id: contact_id, app_id: app_id, tnt: tnt };
      //   dbservice.clearSession(contactDetails);
      //   contact.session.handler = [];
      //   contact.session.promise = [];
      // },
      // clearUserData: function () {
      //   var contactDetails = { contact_id: contact_id, app_id: app_id, tnt: tnt };
      //   dbservice.clearUserData(contactDetails);
      //   contact.session.userData = {};
      // },
    }).run({
      contextName: `${domain} ${app_id}`,
      timeout: 10000,
    });
    return sb;
  };

  this.context = async function () {
    let botContext = await BotContextStore.get(context);
    if (!botContext.contact) {
      console.warn(
        "Contact not Found in Mongo context.session_id=" + context.session_id + " contact_id=" + context.contact_id
      );
      return false;
    }
    let contact = botContext.contact;

    let diff = Date.now() - contact.session_timeStamp;
    let handler = contact.nextHandler;

    if (diff > 1800000 || context.routing_id != contact.session?.routingId) {
      handler = "";
      // dbservice.clearResolver(contact_id);
      BotContextStore.clearSession(context);
      BotContextStore.clearUserData(context);
      contact.session = {
        promise: [],
        handler: [],
      };
      contact.userData = {};
    }
    //<@Deprecated
    // if (context.params != null) {
    //   var userData = new Object();
    //   for (const key of Object.keys(context.params)) {
    //     userData.key = context.params[key];
    //   }
    //   if (context.params.lang != null) {
    //     context.params.userLang = context.params.lang;
    //   }
    //   contact.userData = context.params;
    // }
    //@Deprecated>

    //
    contact.session = contact.session || {
      promise: [],
      handler: [],
    };
    BotContextStore.updateSessionTimeStamp(context);
    context.contact = contact;

    //<@Deprecated
    // context.userData = contact.userData;
    //@Deprecated>
    return context;
  };

  this.execute = async function () {
    const { contact } = await this.context();
    const sb = this.init({ contact });

    //Execute Function
    var returnValue = null;
    if (coreutils.toFunction(isSessionStart)()) {
      console.log(inbound?.event?.sessionRouted?.sourceQueue, "===>", inbound?.event?.sessionRouted?.targetQueue);
      try {
        if (sb.has("onSessionStart")) returnValue = await sb.execute("onSessionStart");
      } catch (e) {
        console.error("onSessionStartException", e);
      }
    } else if (coreutils.toFunction(isSessionRouted)()) {
      try {
        if (sb.has("onSessionRouted")) returnValue = await sb.execute("onSessionRouted");
      } catch (e) {
        console.error("onSessionRoutedException", e);
      }
    } else if (handler?.length > 0) {
      try {
        returnValue = await $.reply_handle();
      } catch (e) {
        console.error("onMessageListenException", e);
      }
    } else {
      try {
        if (sb.has("onMessageReceive")) returnValue = await sb.execute("onMessageReceive");
      } catch (e) {
        console.error("onMessageReceiveException", e);
      }
    }

    var commitDetails = {
      app_id: app_id,
      tnt: tnt,
      contact_id: contact_id,
      contact: contact,
    };

    // console.log("commitDetails", JSON.stringify(commitDetails.contact))

    if (returnValue && returnValue.then) {
      returnValue.then(function () {
        BotContextStore.commit(commitDetails);
      });
    } else {
      let now = Date.now();
      let expired = now + 10000;
      while (returnValue != null && now < expired) {
        if (
          returnValue.__info__ != null &&
          returnValue.__info__.type == "snippet" &&
          returnValue.__info__.snippet == "promise"
        ) {
          var promise = contact.session.promise[contact.session.promise.length - 1];
          try {
            returnValue = await VM[promise.resolver]();
          } catch (e) {
            $.console.error("onPromiseResolveException", e);
          }
        } else {
          returnValue = null;
        }
        now = Date.now();
      }
      await BotContextStore.commit(commitDetails);
    }
    //
  };
}

ChatBox.load = function ({ root = ROOT_DIR, dir, appDir }) {
  if (!root) {
    root = coreutils.getCallerDir();
  }
  if (!appDir) appDir = path.resolve(root, dir);

  console.log("appDir:", appDir);

  ScriptBox.load({
    root: appDir,
    dir: "./scripts/",
  });

  Snippets.load({
    root: appDir,
    dir: "./snippets/",
  });
  return ScriptBox;
};

module.exports = ChatBox;
