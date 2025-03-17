const mongon = require("@bootloader/mongon");
const MessageLogSchema = require("../model/MessageLogsSchema");
const path = require("path");
const config = require("@bootloader/config");

var log = Function.prototype.bind.call(console.log, console);
var debug = Function.prototype.bind.call(console.debug, console);
var warn = Function.prototype.bind.call(console.warn, console);
var error = Function.prototype.bind.call(console.error, console);

const appVenv = config.getIfPresent("app.venv", "branch.service.domain");
//console.log("appVenv=======",appVenv)
async function logger({ appCode, contact_id, domain, session_id }, { level, type, logs }) {
  try {
    let BotLog = mongon.model(MessageLogSchema, { domain });
    const BASE_PATH = process.cwd() + path.sep; // Adds trailing slash

    let httpReq,
      httpResp = {},
      httpStatusCode;
    logs = (logs || []).map(function (_log) {
      if (_log instanceof Error || (_log && _log.stack && _log.message)) {
        //console.log("====isErrro")
        if (_log.status >= 400 && _log.status < 600) {
          httpStatusCode = _log.status;
          httpResp = {
            headers: _log.headers,
            request_id: _log.request_id,
            error: _log.error,
            code: _log.code,
          };
        }
        return _log.stack
          .split("    at Object.execute")[0]
          .split("    at async Object.execute")[0]
          .replaceAll(BASE_PATH, "")
          .split("\n");
      } else if (typeof _log == "object") {
        return JSON.stringify(_log);
      }
      return _log;
    });

    const botLog = new BotLog({
      domain: domain,
      queue: appCode,
      sessionId: session_id,
      contactId: contact_id,
      timestamp: Date.now(),
      type: type,
      logs: logs,
      appVenv,
      appType: "scriptus",
      httpStatusCode,
      httpResp,
    });
    return await botLog.save();
  } catch (e) {
    console.log("LOG SAVE EXCEPTION", e);
  }
}

module.exports = function (
  $,
  { server, tnt, app_id, domain, appCode, contact_id, channel_id, session_id, isDebug, session }
) {
  function Logger(options) {
    return {
      __info__: {
        type: "snippet",
        snippet: "console",
      },
    };
  }
  Logger.log = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
          appCode,
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
  Logger.debug = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
          appCode,
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
  Logger.warn = function (...theArgs) {
    if (isDebug) {
      logger(
        {
          domain,
          app_id,
          contact_id,
          session_id,
          appCode,
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
  Logger.error = function (...theArgs) {
    logger(
      {
        domain,
        app_id,
        contact_id,
        session_id,
        appCode,
      },
      {
        type: "script",
        level: "error",
        logs: theArgs,
      }
    );
    error.apply(console, arguments);
    return this;
  };

  return Logger;
};
