const fetch = require("node-fetch");
const config = require("@bootloader/config");
var secretKey = config.getIfPresent("mry.scriptus.secret");
var messageTypes = ["template", "audio", "document", "image", "location", "text", "video", "voice", "contacts"];

function XMSAdapeter({ message: messageBody }) {
  this.toContext = function () {
    var context = {
      meta: messageBody.meta,
      //Meta
      isDebug: messageBody.meta.debug,
      server: messageBody.meta.server || server,
      tnt: messageBody.meta.domain,
      domain: messageBody.meta.domain,
      app_id: messageBody.meta.appId,
      appCode: messageBody.meta.appCode,
      appType: messageBody.meta.appType,
      //Contact
      contact_id: messageBody.contacts[0].contactId,
      channel_id: messageBody?.contacts[0]?.channelId,

      //Ibound
      inbound: {
        //Original
        contact: messageBody.contacts[0],
        //Derived
        getText() {
          return this.message?.text?.body;
        },
        getCode() {
          return this.message?.input?.reply_id;
        },
      },
    };

    if (messageBody.messages?.length > 0) {
      context = {
        ...context,
        text: messageBody.messages[0]?.text?.body,
        inputCode: messageBody.messages[0]?.input?.reply_id,
        session_id: messageBody.messages[0]?.session?.sessionId,
        routing_id: messageBody.messages[0]?.session?.routingId,
        inbound: {
          ...context.inbound,
          //Original
          message: messageBody.messages[0],
        },
      };
    } else if (messageBody.events?.length > 0) {
      var event = messageBody.events[0];
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

  this.isSessionStart = function () {
    const event = messageBody.events?.[0] || {};
    let result;
    if (
      event.sessionRouted &&
      (event.sessionRouted?.sessionStart ||
        !event.sessionRouted?.sourceQueue ||
        event.sessionRouted?.sourceQueue == event.sessionRouted?.targetQueue)
    ) {
      result = true;
    } else {
      result = false;
    }
    if(result) console.log("isSessionStart", result);
    return result;
  };

  this.isSessionRouted = function () {
    const event = messageBody.events?.[0] || {};
    let result;
    if (
      event.sessionRouted &&
      (!event.sessionRouted?.sessionStart ||
        event.sessionRouted?.sourceQueue ||
        event.sessionRouted?.sourceQueue != event.sessionRouted?.targetQueue)
    ) {
      result = true;
    } else {
      result = false;
    }
    if(result) console.log("isSessionRouted", result);
    return result;
  };

  this.sendMessage = async function (options) {
    if (options.text && typeof options.text == "string") {
      options.text = {
        body: options.text,
      };
    }

    for (var i in messageTypes) {
      let type = messageTypes[i];
      if (options[type]) {
        options.type = type;
        break;
      }
    }

    const formData = {
      channelId: messageBody?.contacts[0]?.channelId,
      to: {
        contactId: messageBody.contacts[0].contactId,
      },
      type: options.type,
      options: options.options,
      image: options.image,
      video: options.video,
      document: options.document,
      audio: options.audio,
      voice: options.voice,
    };
    formData[options.type] = options[options.type];
    const url = `https://${messageBody.meta.domain}.${messageBody.meta.server}/xms/api/v1/message/send`;
    const headers = {
      "x-api-key": secretKey,
      "x-api-id": messageBody.meta.appId,
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    };
    // console.log("===>   POST : ", { url, headers, formData });
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers,
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(formData), // body data type must match "Content-Type" header
    });
    const json = await response.json();
    if (json.statusKey == "SUCCESS") {
      console.log("xms:SUCCESS");
    } else {
      console.log("xms:FAILED" + json.statusKey, json);
    }

    return json;
  };
}
module.exports = XMSAdapeter;
