const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');
const timeout = require("connect-timeout");
const { loadDb } = require("./services/rag")
const { connectDB } = require("./models/mongo")
const { client } = require("./models/redis");

const app = express();
//app.use(express.static("public"));
connectDB()
loadDb()
global.appRoot = path.resolve(__dirname);
app.set("view engine", "ejs");
// async function testMockRedis() {
  
//   await client.set('name', 'kedar');
//   const value = await client.get('name');
//   console.log(`name : ${value}`);
// }
// testMockRedis();
// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(timeout("10s"));

module.exports = app;