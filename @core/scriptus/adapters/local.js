import { redis, RQueue, waitForReady } from "@bootloader/redison";

function LocalAdapeter({ message, contact_id, sessionId, appCode = "my_bot", domain = "default" }) {
  //{ author: "Bot", type: "text", data: { text: `Response(${$.inbound.data.text})` }

  this.toContext = function () {
    var context = {
      meta: {},
      //Meta
      isDebug: true,
      server: null,
      tnt: domain,
      domain: domain,
      app_id: "0",
      appCode: appCode,
      appType: "bot",
      //Contact
      contact_id: contact_id,
      channel_id: "demo_web_chat",

      //Ibound
      inbound: {
        //Original
        contact: { id: contact_id },
        //Derived
        getText() {
          return message?.data?.text;
        },
        getCode() {
          return message?.data?.text;
        },
      },
    };

    if (message?.data?.text) {
      context = {
        ...context,
        text: message?.data?.text,
        inputCode: message?.data?.text,
        session_id: sessionId,
        routing_id: sessionId,
        inbound: {
          ...context.inbound,
          //Original
          message: message,
        },
      };
    } else if (message?.event?.text) {
      var event = message.event;
      var eventCode = event.eventCode;
      if (eventCode == "SESSION_ROUTED") {
        let params = event.sessionRouted?.params || {};
        context = {
          ...context,
          session_id: event.sessionId,
          routing_id: event.session.routingId,
          text: "",
          inputCode: "",
          params: params,
          inbound: {
            ...context.inbound,
            //Original
            event: event,
            //Derived
            getEvent() {
              return event.type || eventCode;
            },
            params: JSON.parse(JSON.stringify(params)),
          },
        };
      }
    }
    return context;
  };

  this.sendMessage = function (options) {
    RQueue({ key: contact_id }).push({ author: "Bot", type: "text", data: { text: options?.text?.body } });
  };
}
module.exports = LocalAdapeter;
