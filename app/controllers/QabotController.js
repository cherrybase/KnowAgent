import { Controller, RequestMapping, ResponseView, AuthRequired } from "@bootloader/core/decorators";
// import { ResponseBody } from "./../../@core/decorators";
import { performRagAllMini, performRagopenAi } from "../services/rag";
import { getModelResponse } from "../services/gpt";
import { getExeTime } from "../services/util";
import { secrets } from "../services/secret";
// const fs = require('fs');
@Controller({ path: "/qabot", middleware: "ClassLevelMiddleware" })
export default class QabotController {
  constructor() {
    console.log("===QabotController instantiated:", this.constructor);
  }

  @RequestMapping({ path: "/test", method: "post" })
  async respond({ request }) {
    let start = Date.now();
    const body = request.body;
    // console.log(body);
    // try {
    //   fs.writeFileSync("./req.json", JSON.stringify(body, null, 2), 'utf8')
    //   console.log('Data successfully saved to disk')
    // } catch (error) {
    //   console.log('An error has occurred ', error)
    // }

    const isOpenAi = false;
    const userQuestion = body.messages[0].text.body;
    // const userQuestion = body.userMessage
    let answer = "Something went wrong please try again later.";

    const matches = isOpenAi
      ? await performRagopenAi(userQuestion, "qaSchema")
      : await performRagAllMini(userQuestion, "fast_semantic_search");
    console.log(matches);
    answer = await getModelResponse(matches, userQuestion, isOpenAi);
    const botReply = {
      channelId: body.contacts[0].channelId,
      contacts: body.contacts,
      location : null,
      mask:false,
      to: {
        contactId: body.contacts[0].contactId,
        name: body.contacts[0].profile.name,
        email: body.contacts[0].profile.email,
        phone: body.contacts[0].profile.phone,
      },
      type: "text",
      text: {
        body: answer,
      }
    };
    // console.log(botReply);
    const headers = {
      'Content-Type': 'application/json',
      Accept: "*/*",
      'x-api-key': secrets.client.apiKey,
      'x-api-id': secrets.client.id,
    };
    // console.log(headers);
    const response = await fetch("https://kedar.mehery.xyz/xms/api/v1/message/send", {
      method: "POST",
      body: JSON.stringify( botReply ),
      headers
    });
    // console.log("Status : ", await response.json());
    await getExeTime("qabot", start);
    return { answer };
  }
}