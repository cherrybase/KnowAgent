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
  class ReplyPromise extends Promise {
    constructor(executor = (resolve) => resolve()) {
      let resolver;
      super((resolve, reject) => {
        resolver = resolve;
        executor(resolve, reject);
      });
      this.resolver = resolver;
      this.data = null;
    }

    reply(options) {
      return new ReplyPromise((resolve) => {
        console.log(`To(${contact_id}) Sending:`, options);
        adapter.sendMessage(options);
        resolve(options);
      });
    }

    listen(options) {
      return new ReplyPromise((resolve) => {
        setTimeout(() => {
          console.log("Listing Options:", options);
          resolve(options);
        }, 1000);
      });
    }
  }

  return function (options) {
    return new ReplyPromise().reply(options);
  };
};
