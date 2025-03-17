import { Controller, RequestMapping, ResponseBody, ResponseView, AuthRequired } from "@bootloader/core/decorators";

import SendCampaignJob from "../workers/SendCampaign";

@Controller({ path: "/", middleware: "ClassLevelMiddleware" })
export default class UserController {
  constructor() {
    console.log("===UserController instantiated:", this.constructor);
  }

  @ResponseBody
  @RequestMapping({ path: "/", method: "get", middleware: "PathLevelMiddleware" })
  async getUsers() {
    return [{ id: 1, name: "John Doe" }];
  }

  @ResponseView
  @RequestMapping({ path: "/welcome", method: "get" })
  async welcomePage() {
    console.log("Welcom pagessss");
    return "welcome";
  }

  @AuthRequired
  @RequestMapping({ path: "/get", method: "get" })
  @ResponseBody
  async getUsersGet() {
    return [{ id: 1, name: "John Doe" }];
  }

  @ResponseBody
  @RequestMapping({ path: "/add_job", method: "get" })
  async pushJob() {
    let data = { id: 1, name: "John Doe", time: Date.now() };
    SendCampaignJob.addJob(data);
    return [data];
  }

  @ResponseBody
  @RequestMapping({ path: "/queue_task", method: "get" })
  async queueJob() {
    let data = { id: 1, name: "John Doe", time: Date.now() };
    SendCampaignJob.queueTask(data);
    return [data];
  }
}
