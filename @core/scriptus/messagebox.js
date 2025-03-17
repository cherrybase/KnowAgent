function MessageBox({ message: messageBody }) {
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
}
module.exports = MessageBox;
