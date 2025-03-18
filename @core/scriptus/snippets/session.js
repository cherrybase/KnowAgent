const config = require("@bootloader/config");
const mongon = require("@bootloader/mongon");
var secretKey = config.getIfPresent("mry.scriptus.secret");

const ClientAppStore = require("../store/ClientAppStore");

module.exports = function (
  $,
  { server, tnt, app_id, appCode, domain, contact_id, channel_id, session, userData, session_id, execute }
) {
  function session() {
    var base_url = "https://" + domain + "." + server + "/xms";
    var headers = {
      "x-api-key": secretKey,
      "x-api-id": app_id,
    };

    async function saveSessionFeedback(params) {
      const allowedParams = ["score", "tag", "review"];

      let cleanParams = {};
      Object.entries(params).map(([k, v], i) => {
        if (allowedParams.includes(k)) {
          cleanParams[`feedback.${k}`] = v;
        }
      });

      if (Object.keys(cleanParams).length) {
        // return new Promise(async function (resolve, reject) {
        const ChatSession = mongon.getCollection(domain, `CHAT_SESSION`);
        const updateResult = await ChatSession.updateOne(
          { _id: mongon.Types.ObjectId(session_id) },
          {
            $set: cleanParams,
          }
        ); // catch ?

        //   resolve({
        //     success: updateResult.matchedCount ? true : false,
        //   });
        // });
      }
      // else {
      //   return {
      //     success: false,
      //   };
      // }
    }

    async function getAppConfig(params) {
      const result = await ClientAppStore.get({ domain, id: app_id, code: appCode });
      if (result) {
        let config = {};
        let configSetup = {};
        Object.keys(result.config).map((c) => {
          if (c.startsWith("config#")) {
            configSetup[c.replace("config#", "")] = result.config[c];
          } else {
            config[c] = result.config[c];
          }
        });

        result.config = {
          ...config,
          ...configSetup,
        };

        return result;
      }
      return {};
    }

    async function getAppCustom(params) {
      const doc = await ClientAppStore.get({ domain, id: app_id, code: appCode });
      return doc?.custom || {};
    }

    return {
      __info__: {
        type: "snippet",
        snippet: "session",
      },
      close(params) {
        // this.promise = $.rest({
        return $.rest({
          url: base_url + "/api/v1/session/close",
          headers,
        })
          .post({
            ...params,
            sessionId: session_id,
          })
          .json();
        // return this;
      },
      route(params) {
        // this.promise = $.rest({
        return $.rest({
          url: base_url + "/api/v1/session/routing",
          headers,
        })
          .post({
            ...params,
            sessionId: session_id,
          })
          .json();
        // return this;
      },
      feedback(params) {
        // this.promise = saveSessionFeedback(params);
        return saveSessionFeedback(params);
        // return this;
      },
      app({ entity, params }) {
        switch (entity) {
          case "config":
            // this.promise = getAppConfig(params);
            return getAppConfig(params);
          // break;
          case "custom":
            return getAppCustom(params);
          // break;
          default:
            return Promise.resolve({});
        }
        // return this;
      },
      then(callback) {
        this.promise = this.promise.then(callback);
        return this;
      },
    };
  }
  session.close = function (options) {
    return session().close(options);
  };
  session.route = function (options) {
    return session().route(options);
  };
  session.route.to = {
    queue: function (queue, params) {
      return session.route({ queue, params });
    },
    agent: function (agentCode) {
      let options = typeof agentCode == "object" ? agentCode : { agent: agentCode };
      return session.route({
        queue: "agent_desk",
        ...options,
      });
    },
    team: function (teamCode) {
      let options = typeof teamCode == "object" ? teamCode : { team: teamCode };
      return session.route({
        queue: "agent_desk",
        ...options,
      });
    },
    skills: function () {
      return session.route({
        queue: "agent_desk",
        skills: Array.from(arguments),
      });
    },
  };
  session.feedback = function (options) {
    return session().feedback(options);
  };
  session.feedback.set = {
    score: function (value) {
      return session().feedback({
        score: value,
      });
    },
    tag: function (value) {
      return session().feedback({
        tag: value,
      });
    },
    review: function (value) {
      return session().feedback({
        review: value,
      });
    },
  };
  session.app = function (options) {
    return session().app(options);
  };
  session.app = {
    config: function (options) {
      return session().app({ entity: "config", params: options });
    },
  };
  session.app.options = function (options) {
    return session().app({ entity: "custom", params: options });
  };
  return session;
};
