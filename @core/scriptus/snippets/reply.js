const config = require("@bootloader/config");
import ChainedPromise from "../../lib/ChainedPromise";

module.exports = function (
  $,
  {
    meta,
    server,
    tnt,
    app_id,
    appCode,
    domain,
    contact_id,
    channel_id,
    session_id,
    routing_id,
    session,
    inbound,
    execute,
    has,
    adapter,
  }
) {
  async function setSessionEventTimer(params) {
    try {
      const base_url = "https://" + domain + "." + server + "/chrono/session-event-timer";
      const headers = {
        "x-app-auth-token": config.get("app.auth.token"),
      };
      let payload = {
        meta,

        contact: inbound.contact,
        contactId: contact_id,
        sessionId: session_id,
        // messageId, // not applicable in case of outbound
        timestamp: +Date.now(),
        session: {
          mode: meta.appMode,
          queue: appCode,
          routingId: routing_id,
        },
        ...params,
        triggerType: "MESSAGE",
        type: "OUTBOUND",
      };
      console.log("setSessionEventTimer payload", payload);

      let res = await $.rest({
        url: base_url + "/api/v1/message/set",
        headers,
      })
        .post(payload)
        .json();
      console.log("setSessionEventTimer res", res);

      return res;
    } catch (error) {
      console.log("setSessionEventTimer error", error);
    }
  }
  class ReplyPromise extends ChainedPromise {
    constructor(executor = (resolve) => resolve(0)) {
      super(executor);
    }

    reply(options) {
      return this.chain(async (resolve) => {
        console.log(`(${contact_id}) Sending:`, options);

        // let handlerindex = -1;

        if (typeof options == "string") {
          options = {
            text: { body: options },
          };
        }

        if (typeof options.text == "string") {
          options.text = { body: options.text };
        }

        if (options.handler) {
          session.handler.push({
            name: options.handler,
          });
          // handlerindex = session.handler.length - 1;
        }

        if (options.template && options.template.text) {
          template = Handlebars.compile(options.template.text);
          options.text = {
            body: template({
              data: options.template.data,
            }),
          };
          delete options.template;
        } else if (typeof options.template == "string") {
          options.template = { code: options.template };
        }

        if (options.options) {
          if (options.options.buttons) {
            options.options.buttons = options.options.buttons.map(function (button) {
              if (typeof button == "string") {
                return { code: button, label: button };
              }
              button.label = button.label || button.text;
              return button;
            });
          }
        }

        await adapter.sendMessage(options);
        
        return options;
      });
    }

    listen(options) {
      return this.chain(async (parentResp) => {
        console.log(`(${contact_id}) listening:`, options);

        if (!options) return;

        let listener = $.listen._create.apply($.listen, arguments);
        let handlerInfo = listener.getInfo();

        if (handlerInfo.options.length == 0) return;

        // if (handlerindex > -1) {
        //   session.handler[handlerindex] = handlerInfo;
        // } else {
        session.handler.push(handlerInfo);
        // }

        let payload = {};
        (handlerInfo.options || []).map((o) => {
          if (o.event) {
            let e = {
              DELIVERY_TIMEOUT: "deliveryTimeout",
              READ_TIMEOUT: "readTimeout",
              REPLY_TIMEOUT: "replyTimeout",
            }[o.event];
            payload[e] = o.timeout;
          }
        });
        if (Object.keys(payload).length) {
          setSessionEventTimer(payload); // need to await ?
        }

        return options;
      });
    }
  }

  function reply(options) {
    return new ReplyPromise().reply(options);
  }

  reply._handle = async function () {
    var handler = session.handler.pop();
    var handlerName = handler.name;
    //console.log("handler",handler);
    if (handlerName) {
      return execute(handlerName);
    } else if (handler && handler.type == "options") {
      return $.listen._handle(handler);
    }
  };

  return reply;
};
