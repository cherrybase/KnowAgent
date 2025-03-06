const { openai } = require("./../models/openai");
const { getExeTime } = require("./util");
const { pipeline } = require("@huggingface/transformers");
async function generateEmbeddingAllMini(text) {
  try {
    let start = Date.now();
    // const { pipeline } = await import('@xenova/transformers');
    // const extractor = await pipeline(
    //   "feature-extraction",
    //   "Xenova/all-MiniLM-L6-v2"
    // );
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor([text], { pooling: 'mean', normalize: true });
    await getExeTime("AllMini",start)
    // console.log(Array.from(response.data));
    return Array.from(output.data);
  } catch (error) {
    console.error("Error while generating embedding with all mini : ", error);
    throw error;
  }
}

async function generateEmbeddingOpenAi(text, dims = 512) {
  try {
    let start = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // You can replace with your preferred embedding model
      input: text,
      encoding_format: "float",
      dimensions: dims,
    });
    await getExeTime("getEmbeddingOpenAi", start);
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding with open ai:", error);
    throw error;
  }
}



async function getModelResponse(relevantInfo, userQuestion, rephrasedQuestion, isOpenAi) {
  let start = Date.now();
  const systemPrompt = `You are Question and answer bot for al mulla exchange. \n NEVER invent details. \n
  Please use the following relevant information to help answer the user's question:
  <Relevant Info> \n
  ${relevantInfo} \n
  <Relevant Info> \n 
  <Contact Info> \n
    For more information: You can WhatsApp or Call us: +965 1840 123. \n 
    For more information, please contact us on 1840123 . \n 
    You can reach out to us on email: Help@almullaexchange.com .\n 
  <Contact Info>`;
  console.log(`SYStem prompt : ${systemPrompt}`);
  console.log(`user prompt  : ${rephrasedQuestion}`)
  const completion = await openai.chat.completions.create({
    model: "ft:gpt-4o-mini-2024-07-18:personal:remittance-bot-v2:B4QmFVQU",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `User Question : ${rephrasedQuestion} \n If information provided in relevant info section isnt about country mentioned in users question. Respond saying <Insert service or information user is asking for> isnt provided by Al Mulla Exchange. Then attach entirity of contact info section.\n 
      \n Maintain context of user question while you respond` },
    ],
  });
  console.log(completion.usage);
  console.log(`answer final : ${completion.choices[0].message.content}`);
  await getExeTime("GPT", start);
  return completion.choices[0].message.content;
}

module.exports = { generateEmbeddingOpenAi , generateEmbeddingAllMini , getModelResponse };
