const config = require("@bootloader/config")

const clientId = config.get("client.id");
const clientApiKey = config.get("client.apikey");

const mongoUri = config.get("mongo.uri");
const mongoDbName = config.get("mongo.db")
const secrets = {
  client : {
    id : clientId,
    apiKey : clientApiKey
  },
  mongo : {
    uri : mongoUri,
    dbName : mongoDbName
  }
}
module.exports = { secrets };