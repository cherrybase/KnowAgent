let OPTIONS = null;
module.exports = {
  options(options) {
    if (options) {
      OPTIONS = options;
    }
    return OPTIONS;
  },
  getAppPath(appName) {
    return ["default", "app"].indexOf(appName) >= 0 ? "app" : `app-${appName}`;
  },
  log() {
    console.log(`APP[${OPTIONS.name}]:`, ...arguments);
  },
};
