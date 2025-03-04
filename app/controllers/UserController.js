import { Controller, RequestMapping, ResponseBody, ResponseView } from "@bootloader/core/decorators";

@Controller("/users")
export default class UserController {
  constructor() {
    console.log("===UserController instantiated:", this.constructor);
  }

  @ResponseBody
  @RequestMapping({ path: "/", method: "get" })
  async getUsers() {
    return [{ id: 1, name: "John Doe" }];
  }

  @ResponseView
  @RequestMapping({ path: "/welcome", method: "get" })
  async welcomePage() {
    console.log("Welcom pagessss");
    return "welcome";
  }

  @RequestMapping({ path: "/get", method: "get" })
  @ResponseBody
  async getUsersGet() {
    return [{ id: 1, name: "John Doe" }];
  }
}
