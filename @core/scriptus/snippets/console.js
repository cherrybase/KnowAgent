const mongon = require("@bootloader/mongon");
const BotLogSchema = require("../model/BotLogSchema");

var log = Function.prototype.bind.call(console.log, console);
var debug = Function.prototype.bind.call(console.debug, console);
var warn = Function.prototype.bind.call(console.warn, console);
var error = Function.prototype.bind.call(console.error, console);

async function logger({ app_id, contact_id, domain }, { level, type, logs }) {
  try {
    let BotLog = mongon.model(BotLogSchema, { domain });
    const botLog = new BotLog({
      domain: domain,
      app_id: app_id,
      contact_id: contact_id,
      timestamp: Date.now(),
      level: level,
      type: type,
      logs: (logs || []).map(function (_log) {
        if (_log instanceof Error || (_log && _log.stack && _log.message)) {
          return _log.stack.split("    at Object.execute")[0];
        } else if (typeof _log == "object") {
          return JSON.stringify(_log);
        }
        return _log;
      }),
    });
    return await botLog.save();
  } catch (e) {
    console.log("LOG SAVE EXCEPTION", e);
  }
}

module.exports = function (
  $,
  { server, tnt, app_id, domain, contact_id, channel_id, session_id, isDebug, session, userData, execute }
) {
  function Console(options) {
    return {
      __info__: {
        type: "snippet",
        snippet: "console",
      },
    };
  }
  Console.log = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
        },
        {
          type: "script",
          level: "log",
          logs: theArgs,
        }
      );
    }
    log.apply(console, arguments);
    return this;
  };
  Console.debug = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
        },
        {
          type: "script",
          level: "debug",
          logs: theArgs,
        }
      );
    }
    debug.apply(console, arguments);
    return this;
  };
  Console.warn = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
        },
        {
          type: "script",
          level: "warn",
          logs: theArgs,
        }
      );
    }
    warn.apply(console, arguments);
    return this;
  };
  Console.error = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
        },
        {
          type: "script",
          level: "error",
          logs: theArgs,
        }
      );
    }
    error.apply(console, arguments);
    return this;
  };

  return Console;
};
