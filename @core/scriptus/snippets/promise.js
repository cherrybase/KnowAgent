const utils = require("../../utils");

module.exports = function ($, { meta, server, tnt, app_id, appCode, domain, session, inbound, execute, has, adapter }) {
  function promise(options) {
    let nextResolver = utils.toName(options);
    var promise = {
      resolver: nextResolver,
      resolvedCallback: null,
      rejectedCallback: null,
      resolvedParams: null,
      rejectedParams: null,
    };
    session.promise.push(promise);

    return {
      __info__: {
        type: "snippet",
        snippet: "promise",
        name: nextResolver,
      },
      resolved: function (callback, params) {
        promise.resolvedCallback = utils.toName(callback);
        promise.resolvedParams = params;
        return this;
      },
      rejected: function (callback, params) {
        promise.rejectedCallback = utils.toName(callback);
        promise.rejectedParams = params;
        return this;
      },
    };
  }

  promise.resolve = function (options) {
    let promise = utils.toName(options);
    var lastPromise = session.promise.pop();
    if (!lastPromise) return;
    if (lastPromise.resolver == promise) {
      if (lastPromise.resolvedCallback) execute(lastPromise.resolvedCallback);
    } else {
      session.promise.push(lastPromise);
    }
    return {
      __info__: {
        type: "snippet",
        snippet: "promise.resolve",
      },
    };
  };

  promise.reject = function (options) {
    let promise = utils.toName(options);
    var lastPromise = session.promise.pop();
    if (!lastPromise) return;
    if (lastPromise.resolver == promise) {
      if (lastPromise.rejectedCallback) execute(lastPromise.rejectedCallback);
    } else {
      session.promise.push(lastPromise);
    }
    return {
      __info__: {
        type: "snippet",
        snippet: "promise.reject",
      },
    };
  };

  return promise;
};
