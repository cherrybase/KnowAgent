const mongon = require("@bootloader/mongon");
const { QueryBuilder } = require("@bootloader/mongon");
const MasterAgentSchema = require("../model/MasterAgentSchema");
const MasterTemplateSchema = require("../model/MasterTemplateSchema");
const MasterKnowbaseSchema = require("../model/MasterKnowbaseSchema");

module.exports = {
  async getAgents(props) {
    let { domain, tnt } = props;
    let _domain = domain || tnt;

    let { code, name, email, isDefault, enabled, admin } = props;

    let qb = new QueryBuilder();
    qb.where("agent_code", code);
    qb.where("agent_name", name);
    qb.where("agent_email", email);
    qb.where("isDefaultValue", isDefault);
    qb.where("isactive", enabled === undefined ? undefined : enabled ? "Y" : { $not: { $eq: "Y" } });
    qb.where({ admin });

    let MasterAgent = mongon.model(MasterAgentSchema, { domain: _domain });
    let agents = await MasterAgent.find(qb.query()).exec();

    return agents;
  },

  async getTemplates(props) {
    let { domain, tnt } = props;
    let _domain = domain || tnt;

    let { code, name, lang, category } = props;

    let qb = new QueryBuilder();
    qb.where("code", code);
    qb.where("name", name);
    qb.where("lang", lang);
    qb.where("category", category);

    let MasterTemplate = mongon.model(MasterTemplateSchema, { domain: _domain });
    let templates = await MasterTemplate.find(qb.query()).exec();

    return templates;
  },

  async getKnowbase(props) {
    let { domain, tnt } = props;
    let _domain = domain || tnt;

    let { code, title, lang, category } = props;

    let qb = new QueryBuilder();
    qb.where("code", code);
    qb.where("title", title);
    qb.where("lang", lang);
    qb.where("category", category);

    let MasterKnowbase = mongon.model(MasterKnowbaseSchema, { domain: _domain });
    let knowbase = await MasterKnowbase.find(qb.query()).exec();

    return knowbase;
  },
};
