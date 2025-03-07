import { Controller, RequestMapping, ResponseView, AuthRequired } from "@bootloader/core/decorators";
// import { ResponseBody } from "./../../@core/decorators";
import { performRagAllMini, performRagopenAi } from "../services/rag";
import { getModelResponse } from "../services/gpt";
import { getExeTime } from "../services/util";
import { secrets } from "../services/secret";
import { WebChat } from "../models/collections";
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

    const isOpenAi = true;
    const userQuestion = body.messages[0].text.body;
    // const userQuestion = body.userMessage
    let answer = "Something went wrong please try again later.";
    const contactId = body.contacts[0].contactId;
    const ragOutput = isOpenAi
      ? await performRagopenAi(userQuestion, "qaSchema", contactId)
      : await performRagAllMini(userQuestion, "fast_semantic_search", contactId);
    const topMatches = ragOutput.topMatches;
    let relevantInfo = "";
    const matches = [];
    for (let i = 0; i < topMatches.length; i++) {
      const newInfo = isOpenAi
        ? `${i + 1}. Question : ${topMatches[i].question} \n Answer : ${topMatches[i].answer} \n`
        : `${i + 1}. ${topMatches[i].knowledgebase} \n`;
      matches.push({ knowledgebase : newInfo , score : topMatches[i].score })
      relevantInfo += newInfo;
    }
    answer = await getModelResponse(relevantInfo, userQuestion, ragOutput.rephrasedQuestion, isOpenAi);
    const newWebChat = new WebChat({
      contactId,
      rephrasedQuestion : ragOutput.rephrasedQuestion,
      messages: {
        user: userQuestion,
        assistant: answer
      },
      // timestamp will default to current time
      matches
    });
    
    // Save the document to the database
    const savedChat = await newWebChat.save();
    const botReply = {
      channelId: body.contacts[0].channelId,
      contacts: body.contacts,
      location: null,
      mask: false,
      to: {
        contactId,
        name: body.contacts[0].profile.name,
        email: body.contacts[0].profile.email,
        phone: body.contacts[0].profile.phone,
      },
      type: "text",
      text: {
        body: answer,
      },
    };
    // console.log(botReply);
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "x-api-key": secrets.client.apiKey,
      "x-api-id": secrets.client.id,
    };
    // console.log(headers);
    const response = await fetch("https://kedar.mehery.xyz/xms/api/v1/message/send", {
      method: "POST",
      body: JSON.stringify(botReply),
      headers,
    });
    // console.log("Status : ", await response.json());
    await getExeTime("qabot", start);
    return { answer };
  }
}
