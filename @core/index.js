const config = require("@bootloader/config");
const http = require("http");

const { loadApp } = require("./router");
const { initJobs } = require("./jobs");
const coreutils = require("./coreutils");

const DEFAULT_APP = 'default'
const APP = process.env.APP || DEFAULT_APP;

function BootLoader(...args) {
  let mappings = [];
  let options = { name: DEFAULT_APP, context: "/", path: "app" };
  let app = null;

  this.map = function (o) {
    o.name = o.name || DEFAULT_APP;
    o.path = o.path || coreutils.getAppPath(o.name);
    mappings.push(o);
    return this;
  };

  for (let arg of args) {
    this.map(arg);
  }

  this.create = function (onCreate) {
    //console.log("mappings",mappings)
    options =
      mappings.filter(function (arg) {
        return arg.name == APP;
      })[0] || options;
    let { name = "default", path, context } = options;
    coreutils.options(options);
    coreutils.log(`Creating on ${context}`);
    app = require(`./../${path}/app.js`);
    // Auto-load controllers
    loadApp({ name: name, context: context, app, path });
    if (onCreate && typeof onCreate == "function") onCreate({ ...options, app });
    return this;
  };

  this.launch = function (onLaunch) {
    const port = process.env.PORT || config.get("server.port");
    console.log(`APP[${options.name}]: Launching on ${port}:/${options.context}`);
    //Create a server
    var server = http.createServer(app);
    //Lets start our server
    server.listen(port, function () {
      //console.log("NGROK_URL",config.getIfPresent("NGROK_URL"))
      //console.log("ngrok.url",config.store("ngrok").url)
      //Callback triggered when server is successfully listening. Hurray!
      coreutils.log(`Listening on http://localhost:${port}${options.context}`);
      //noway.emit('noway.started', null)
      if (onLaunch && typeof onLaunch == "function") onLaunch({ ...options, app, server, config });
    });
    return this;
  };

  this.initJobs = function () {
    initJobs(options);
    return this;
  };
}

module.exports = {
  BootLoader,
};
