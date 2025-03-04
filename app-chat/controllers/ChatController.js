import { Controller, RequestMapping, ResponseBody, ResponseView } from "@bootloader/core/decorators";

@Controller("/")
export default class ChatController {
  constructor() {
    console.log("===ChatController instantsiated:", this.constructor);
  }

  @ResponseView
  @RequestMapping({ path: "/home", method: "get" })
  async homePage() {
    return "home";
  }

  @ResponseBody
  @RequestMapping({ path: "/api/messages", method: "get" })
  async getMessage() {
    return [{ id: 1, name: "John Doe" }];
  }

 
  @RequestMapping({ path: "/api/messages", method: "post" })
  @ResponseBody
  async postMessage() {
    return [{ id: 1, name: "John Doe" }];
  }

  @ResponseView
  @RequestMapping({ path: "/*", method: "get" })
  async defaultPage() {
    return "home";
  }
}
