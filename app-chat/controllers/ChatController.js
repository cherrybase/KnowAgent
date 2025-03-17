import { Controller, RequestMapping, ResponseBody, ResponseView } from "@bootloader/core/decorators";
import { redis, RQueue, waitForReady } from "@bootloader/redison";

import InboundQueue from "../workers/InboundQueue";
import crypto from "crypto";

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

  @RequestMapping({ path: "/api/messages", method: "post" })
  @ResponseBody
  async postMessage({ request: { body, cookies }, response }) {
    let contact_id = cookies.contact_id;
    if (!contact_id) {
      contact_id = crypto.randomUUID();
      response.cookie("contact_id", contact_id, { maxge: 900000, httpOnly: true });
    }
    InboundQueue.queueTask(body, {
      queue: contact_id,
    });
    return { results: [body] };
  }

  @ResponseBody
  @RequestMapping({ path: "/api/messages", method: "get" })
  async getMessage({ request: { body,cookies }, headers }) {
    let contact_id = cookies.contact_id;
    if (!contact_id) {
      contact_id = crypto.randomUUID();
      response.cookie("contact_id", contact_id, { maxge: 900000, httpOnly: true });
    }
    let msg = await RQueue({ key: contact_id }).pop();
    return { results: msg ? [msg] : [] };
  }


  @ResponseView
  @RequestMapping({ path: "/*", method: "get" })
  async defaultPage() {
    return "home";
  }
}
