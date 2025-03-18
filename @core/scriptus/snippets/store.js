const {
  setUserData,
  /* clearUserData, clearSession */
} = require("../store/BotContextStore");
/* const { getGlobalVars } = require("../store/GlobalVarsStore"); */

module.exports = function ($, { server, tnt, app_id, domain, contact_id, channel_id, session, userData, execute }) {
  function store() {
    return {
      __info__: {
        type: "snippet",
        snippet: "store",
      },
    };
  }

  store.local = function () {
    return userData;
  };

  store.local.get = function (key) {
    return userData[key];
  };

  store.local.set = function (key, value) {
    userData[key] = value;
    setUserData({ contact_id, app_id, tnt, domain, key, value });
    return this;
  };

  /*
  store.global = async function (...keys) {
    return getGlobalVars({keys, domain, tnt});
  };

  store.clearUserData = function () {
    clearUserData({ contact_id, app_id, tnt, domain });
    return this;
  };

  store.clearSession = function () {
    clearSession({ contact_id, app_id, tnt, domain });
    return this;
  };
  */

  return store;
};
