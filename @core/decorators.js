let counter = 0;
const mappings = {
  controller: [],
  jobs: [],
  _controller_: null,
  addController() {
    this._controller_ = {
      maps: [],
    };
    this.controller.push(this._controller_);
  },
  updateController(meta) {
    this._controller_ = this.controller[this.controller.length - 1];
    this._controller_ = {
      ...this._controller_,
      ...meta,
    };
    this.controller[this.controller.length - 1] = this._controller_;
  },
  addHandler(handler, context) {
    let map = this._controller_.maps.find((m) => m.handler === handler);
    if (map) return map;

    if (handler.__index !== undefined) {
      return this._controller_.maps[handler.__index];
    }

    map = this._controller_.maps.find((m) => m.context.name === context.name);
    if (map) return map;

    handler.__index = this._controller_.maps.length;
    context.access.__index = this._controller_.maps.length;
    map = { context };
    this._controller_.maps.push(map);
    return map;
  },
  updateHandler(handler, context, meta) {
    let map = this.addHandler(handler, context);
    Object.assign(map, meta);
  },
  addJob() {
    this.jobs.push({
      maps: [],
    });
  },
  updateJob(meta) {
    let job = this.jobs[this.jobs.length - 1];
    this.jobs[this.jobs.length - 1] = {
      ...job,
      ...meta,
    };
  },
};

function Controller(basePathOption) {
  let options =
    (typeof basePathOption == "string"
      ? {
          path: basePathOption,
        }
      : basePathOption) || {};
  mappings.addController();
  return function (originalMethod, context) {
    //console.log(`@Controller:IN ${basePath}`,context)
    mappings.updateController({ ...options, controller: originalMethod });
  };
}

function RequestMapping(requestOptions) {
  return function (handler, context) {
    //console.log(`@RequestMapping:IN ${method}:${path}`,context)
    if (context.kind !== "method" || !context.access) {
      throw new Error("@RequestMapping can only be used on methods!");
    }
    mappings.updateHandler(handler, context, {
      ...requestOptions,
      handler,
      name: context.name,
    });
  };
}

function ResponseType(handler, context, meta) {
  if (
    typeof handler == "function" &&
    context?.kind == "method" &&
    context?.access
  ) {
    mappings.updateHandler(handler, context, meta);
  } else if (context && context.kind !== "method") {
    throw new Error("@ResponseView can only be used on methods!");
  }
}

function ResponseBody(handler, context) {
  let meta = { responseType: "json" };
  ResponseType(handler, context, meta);
  return function (handler, context) {
    ResponseType(handler, context, meta);
  };
}

function ResponseView(handler, context) {
  let meta = { responseType: "view" };
  ResponseType(handler, context, meta);
  return function (handler, context) {
    ResponseType(handler, context, meta);
  };
}

function AuthRequired(handler, context) {
  let auth = typeof handler == "function" ? {} : handler;
  let meta = { auth: auth || {} };
  ResponseType(handler, context, meta);
  return function (handler, context) {
    ResponseType(handler, context, meta);
  };
}

function Job(baseJobOptions) {
  let options =
    (typeof baseJobOptions == "string"
      ? {
          name: baseJobOptions,
        }
      : baseJobOptions) || {};
  mappings.addJob();
  return function (originalMethod, context) {
    //console.log(`@Controller:IN ${basePath}`,context)
    mappings.updateJob({ ...options, job: originalMethod });
  };
}

module.exports = {
  Controller,
  RequestMapping,
  ResponseBody,
  ResponseView,
  AuthRequired,
  Job,
  mappings,
};
