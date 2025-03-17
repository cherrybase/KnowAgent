const MasterStore = require("../store/MasterStore");

module.exports = function ($, { server, tnt, app_id, domain, contact_id, channel_id, session, userData, execute }) {
  function master(options) {
    return {};
  }

  master.agents = async function (arg = {}) {
    let agents = await MasterStore.getAgents({ ...arg, domain, tnt });
    return agents.map(function ({ code, name, email, isactive, isDefaultValue, isEnabled, admin }) {
      return {
        code,
        name,
        email,
        isDefault: isDefaultValue,
        enabled: isEnabled || isactive == "Y" || isEnabled === null || isEnabled === undefined,
        admin,
      };
    });
  };

  master.agents.enabled = async function (arg = {}) {
    return master.agents({
      ...arg,
      enabled: true,
    });
  };

  master.teams = async function (arg = {}) {
    return {};
  };

  master.templates = async function (arg = {}) {
    let templates = await MasterStore.getTemplates({ ...arg, domain, tnt });
    return templates;
  };

  master.knowbase = async function (arg = {}) {
    let knowbase = await MasterStore.getKnowbase({ ...arg, domain, tnt });
    return knowbase;
  };

  return master;
};
