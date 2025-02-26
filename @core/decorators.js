const mappings = {
  controller : [],
  addController(){
    this.controller.push({
      maps : []
    })
  },
  updateController(meta){
    let controller = this.controller[this.controller.length-1]
    this.controller[this.controller.length-1] = {
      ...controller,
      ...meta
    }
  },
  addHandler(originalMethod){
    if(originalMethod.__index){
        return
    }
    originalMethod.__index =  true;
    let controller = this.controller[this.controller.length-1]
    controller.maps.push({})
  },
  updateHandler(meta){
    let controller = this.controller[this.controller.length-1]
    let map = controller.maps[controller.maps.length-1]
    controller.maps[controller.maps.length-1] = {
      ...map,
      ...meta
    }
  }
}

function Controller(basePath) {
  mappings.addController()
  return function (originalMethod,context) {
    //console.log(`@Controller:IN ${basePath}`,context)
    mappings.updateController({basePath, controller : originalMethod})
  };
}

function Test(...args){
  console.log("TEST:INSIDE",args)
  return function (originalMethod,context) {
    console.log("TEST:INSIDE",args)
  }
}

function RequestMapping({ path, method }) {
  return function (originalMethod, context) {
    //console.log(`@RequestMapping:IN ${method}:${path}`,context)
    if (context.kind !== "method" || !context.access) {
      throw new Error("@RequestMapping can only be used on methods!");
    }
    mappings.addHandler(originalMethod)
    mappings.updateHandler({path,method, handler : originalMethod, name : context.name})
  };
}

function ResponseBody() {
  let responseType = "json";
  return function (originalMethod, context) {
    console.log(originalMethod)
    console.log(`context : ${context}`)
    if (context?.kind !== "method" || !context?.access) {
      throw new Error("@ResponseBody can only be used on methods!");
    }
    mappings.addHandler(originalMethod)
    mappings.updateHandler({responseType, handler : originalMethod})
  };
}

function ResponseView({  }) {
  let responseType = "view";
  return function (originalMethod, context) {
    
    if (context?.kind !== "method" || !context.access) {
      throw new Error("@ResponseView can only be used on methods!");
    }
    mappings.addHandler(originalMethod)
    mappings.updateHandler({responseType, handler : originalMethod})
  };
}

function AuthRequired(auth) {
  return function (originalMethod, context) {
    mappings.addHandler(originalMethod)
    mappings.updateHandler({auth})
  }
}

module.exports = {
  Controller,
  RequestMapping,
  ResponseBody,
  ResponseView,
  AuthRequired,
  Test,
  mappings
};
