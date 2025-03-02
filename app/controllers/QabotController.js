import { Controller, RequestMapping, ResponseView, AuthRequired } from "@bootloader/core/decorators";
// import { ResponseBody } from "./../../@core/decorators";
import { performRagAllMini , performRagopenAi } from "../services/rag";
import { getModelResponse } from "../services/gpt";
import { getExeTime } from "../services/util";

@Controller({ path: "/qabot", middleware: "ClassLevelMiddleware" })
export default class QabotController {
  constructor() {
    console.log("===QabotController instantiated:", this.constructor);
  }

  @RequestMapping({ path: "/test", method: "post"})
  async respond({request}){
    const body = request.body;
    const isOpenAi = true
    console.log(body)
    const userQuestion = body.userMessage
    let answer = "yes";
    // const matches = ;
    const matches = isOpenAi ? await performRagopenAi(userQuestion,"qaSchema") : await performRagAllMini(userQuestion,"fast_semantic_search");
    console.log(matches)
    answer = await getModelResponse(matches,userQuestion,isOpenAi);
    return { answer } ;
  }
}

