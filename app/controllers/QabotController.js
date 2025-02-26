import { Controller, RequestMapping, ResponseBody, ResponseView, AuthRequired } from "@bootloader/core/decorators";
import { patch } from "../app";

@Controller({ path: "/qabot", middleware: "ClassLevelMiddleware" })
export default class UserController {
  constructor() {
    console.log("===QabotController instantiated:", this.constructor);
  }

  @RequestMapping({ path: "/test", method: "post"})
  @ResponseBody
  async respond({ request }){
    const body = request.body;
    return [];
  }
}