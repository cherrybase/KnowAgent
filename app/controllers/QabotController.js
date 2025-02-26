import { Controller, RequestMapping, ResponseView, AuthRequired } from "@bootloader/core/decorators";
// import { ResponseBody } from "./../../@core/decorators";
import { performRAG } from "../services/rag";
import { getModelResponse } from "../services/gpt";

@Controller({ path: "/qabot", middleware: "ClassLevelMiddleware" })
export default class QabotController {
  constructor() {
    console.log("===QabotController instantiated:", this.constructor);
  }

  @RequestMapping({ path: "/test", method: "post"})
  async respond({request}){
    const body = request.body;
    console.log(body)
    const userQuestion = body.userMessage
    let answer = "yes";
    const matches = await performRAG(userQuestion,"qaSchema");
    console.log(matches)
    answer = await getModelResponse(matches,userQuestion);
    return { answer } ;
  }
}

