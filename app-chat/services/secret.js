const config = require("@bootloader/config")

const clientId = config.get("client.id");
const clientApiKey = config.get("client.apikey");
const secrets = {
  client : {
    id : clientId,
    apiKey : clientApiKey
  }
}
module.exports = { secrets };