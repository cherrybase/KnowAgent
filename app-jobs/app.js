const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');
const timeout = require("connect-timeout");


const app = express();

global.appRoot = path.resolve(__dirname);
app.set("view engine", "ejs");

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(timeout("10s"));

module.exports = app;