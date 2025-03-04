const { OpenAI } = require("openai");
const config = require("@bootloader/config");

const token = config.get("openai.token")
const openai = new OpenAI({ apiKey: token });
module.exports = { openai };