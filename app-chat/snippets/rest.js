const fetch = require("node-fetch");
const AbortController = globalThis.AbortController || require('abort-controller')

const REQUEST_TIMOUT = 5000;

function createTimeout(time){
  const controller = new AbortController();
  controller.timeout = setTimeout(() => {
    controller.abort();
  }, time || REQUEST_TIMOUT);
  return controller;
}

module.exports = function ($, { session, execute }) {
  $.rest = function (options) {
    if (typeof options == "string") {
      options = { url: options };
    }
    options.headers = options.headers || {};

    return {
      __info__: {
        type: "snippet",
        snippet: "rest",
      },
      post: function (json) {
        let timer = createTimeout();
        this.promise = fetch(options.url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type" : "application/json",
            ...options.headers
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(json), // body data type must match "Content-Type" header
        },{ signal : timer.signal}).catch(
          (e) => { $.console.error("PostError",e) }
        ).then(function(res){
          clearTimeout(timer.timeout);
          return res;
        });
        return this;
      },
      put: function (json) {
        let timer = createTimeout();
        this.promise = fetch(options.url, {
          method: "PUT", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type" : "application/json",
            ...options.headers
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(json), // body data type must match "Content-Type" header
        },{ signal : timer.signal}).catch(
          (e) => { $.console.error("PostError",e) }
        ).then(function(res){
          clearTimeout(timer.timeout);
          return res;
        });
        return this;
      },
      get: function (query) {
        let timer = createTimeout();
        //console.log("GET",options.url,query)
        this.promise = fetch(options.url, {
          method: "GET", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: options.headers,
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // body data type must match "Content-Type" header
        },{ signal : timer.signal}).then(function(resp){
          //console.log("GET:RESPONSE:THEN",resp);
          return resp;
        }).catch(function(e) { 
            //console.log("GET:RESPONSE:CATCH",e);
            $.console.error("GetError",e) 
          }
        ).then(function(res){
          clearTimeout(timer.timeout);
          return res;
        });
        return this;
      },
      delete: function (query) {
        let timer = createTimeout();
        this.promise = fetch(options.url, {
          method: "DELETE", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: options.headers,
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // body data type must match "Content-Type" header
        },{ signal : timer.signal}).then((resp)=>resp).catch(
          (e) => { $.console.error("GetError",e) }
        ).then(function(res){
          clearTimeout(timer.timeout);
          return res;
        });
        return this;
      },
      submit: function (formData) {
        return this;
      },
      then(callback) {
        this.promise = this.promise.then(callback);
        return this;
      },
      catch(callback) {
        this.promise = this.promise.catch(callback);
        return this;
      },
      json(callback) {
        this.promise = this.promise.then(function(res){ 
            return res.json();
        }).then(callback).catch(
          (e) => { $.console.error("JsonError",e) }
        );
        return this;
      },
      text(callback) {
        this.promise = this.promise.then((res) => res.text()).then(callback).catch(
          (e) => { $.console.error("TextError",e) }
        );
        return this;
      },
    };
  };
};
