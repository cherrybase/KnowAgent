const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const config = require("@bootloader/config")

const address = config.get("milvus.url")
const token = config.get("milvus.token")
// console.log(`milvus url = ${address}`)
// console.log(`milvus token = ${token}`)

const vectorDb = new MilvusClient({address, token});
module.exports = { vectorDb };