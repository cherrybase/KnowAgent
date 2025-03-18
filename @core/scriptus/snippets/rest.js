import ajax from "../../ajax";

module.exports = function ($, { session, execute }) {
  return function (options) {
    return ajax(options);
  };
};
