const { openai } = require("./../models/openai")
const { getExeTime } = require("./util")

async function generateEmbedding(text,dims=512) {
  try {
    let start = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // You can replace with your preferred embedding model
      input: text,
      encoding_format: "float",
      dimensions: dims
    });
    await getExeTime("getEmbedding",start);
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function getModelResponse(topMatches,userQuestion){
  let start = Date.now();
    
  let relevantInfo = ""
  for(let i=0;i<topMatches.length;i++){
    relevantInfo+=`${i+1}. Question : ${topMatches[i].question} \n Answer : ${topMatches[i].answer} \n`
  }
  const systemPrompt = `You are Question and answer bot for al mulla exchange. \n NEVER invent details. \n
  Please use the following relevant information to help answer the user's question:
  ${relevantInfo}
  If information provided isnt related to users question. Respond saying service user is asking for isnt provided by Al Mulla Exchange.Maintain context of user question while you respond`
  const completion = await openai.chat.completions.create({
    model: "ft:gpt-4o-mini-2024-07-18:personal:remittance-bot-v2:B4QmFVQU",
    messages: [{ role: "system", content: systemPrompt},{ role: "user", content: `${userQuestion}`}]
  })
  console.log(`answer final : ${completion.choices[0].message.content}`)
  await getExeTime("GPT",start);
  return completion.choices[0].message.content;
}

module.exports = { generateEmbedding , getModelResponse }