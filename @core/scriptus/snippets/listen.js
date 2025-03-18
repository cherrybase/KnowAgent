const utils = require("../../utils");

module.exports = function ($, { meta, server, tnt, app_id, appCode, domain, session, inbound, execute, has, adapter }) {
  async function listen() {
    let listener = $.listen._create.apply($.listen, arguments);
    let handler = listener.getInfo();
    await $.listen._handle(handler);

    return {};
  }

  listen._create = function () {
    let handlerInfo = {
      type: "options",
      options: [],
    };
    if (arguments.length > 0) {
      for (var i = 0; i < arguments.length; i++) {
        let option = arguments[i];
        if (typeof option == "string" || typeof option == "function") {
          option = {
            // pattern : /.*/,
            default: true,
            handler: option,
          };
        }

        handlerInfo.options.push({
          code: option.code,
          text: option.text,
          intent: option.intent,
          pattern: option.pattern
            ? {
                string: option.pattern.toString(),
              }
            : undefined,
          default: option.default,
          handler: utils.toName(option.handler),
          handlerProps: option.handlerProps,
          event: option.deliveryTimeout
            ? "DELIVERY_TIMEOUT"
            : option.readTimeout
            ? "READ_TIMEOUT"
            : option.replyTimeout
            ? "REPLY_TIMEOUT"
            : undefined,
          timeout: option.deliveryTimeout || option.readTimeout || option.replyTimeout || undefined,
        });
      }
    }
    return {
      getInfo() {
        return handlerInfo;
      },
    };
  };
  listen._intent = async function () {
    let service = setting(DEFAULT_INTENT_SERVICE_TYPE);
    switch (service) {
      case "google":
      case "gdf":
        return await $.google.dialogflow.intent();
      case "wit":
        return await $.wit.intent();
      default:
        return {};
    }
  };
  listen._handle = async function (handler) {
    if (handler && handler.type == "options") {
      let intentions = null;
      for (var i in handler.options) {
        let option = handler.options[i];
        var handlerName = option.handler;
        if (!has(handlerName)) {
          continue;
        }

        if (option.code && handlerName && option.code == inbound.getCode()) {
          return execute(handlerName, option.handlerProps);
        }

        let text = option.text || option.label;
        if (text && handlerName && inbound.getText() && inbound.getText().length > 0 && text == inbound.getText()) {
          return execute(handlerName, option.handlerProps);
        }

        if (option.pattern && handlerName && inbound.getText()) {
          let str = option.pattern.string;
          let lastSlash = str.lastIndexOf("/");
          let restoredRegex = new RegExp(str.slice(1, lastSlash), str.slice(lastSlash + 1));
          if (restoredRegex.test(inbound.getText())) {
            return execute(handlerName, option.handlerProps);
          }
        }

        if (option.intent && handlerName && inbound.getText()) {
          if (!intentions) {
            intentions = await $.listen._intent();
            $.inbound.intentions = intentions;
            //console.log("intentions",intentions,handlerName)
          }
          if (intentions && intentions.has_intent[option.intent]) {
            return execute(handlerName, {
              intent: intentions,
              ...(option.handlerProps || {}),
            });
          }
        }

        if (option.event && handlerName && inbound.getEvent && option.event == inbound.getEvent()) {
          return execute(handlerName, option.handlerProps);
        }

        if (option.default && handlerName && inbound.message?.type && inbound.message?.[inbound.message?.type]) {
          return execute(handlerName, option.handlerProps);
        }
      }
    }
  };

  return listen;
};
