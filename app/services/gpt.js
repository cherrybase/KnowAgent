const { openai } = require("./../models/openai")


async function generateEmbedding(text,dims=512) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large", // You can replace with your preferred embedding model
      input: text,
      dimensions: dims
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function getModelResponse(topMatches,userQuestion){
  let relevantInfo = ""
  for(let i=0;i<topMatches.length;i++){
    relevantInfo+=`${i+1}. Question : ${topMatches[i].question} \n Answer : ${topMatches[i].answer} \n`
  }
  const systemPrompt = `You are Question and answer bot for al mulla exchange. \n NEVER invent details. \n
  Please use the following relevant information to help answer the user's question:
  ${relevantInfo}
  If the information provided doesn't fully answer the user's question, please state that you don't have enough information.`
  const completion = await openai.chat.completions.create({
    model: "ft:gpt-4o-mini-2024-07-18:personal:remittance-bot-v2:B4QmFVQU",
    messages: [{ role: "system", content: systemPrompt},{ role: "user", content: userQuestion}]
  })
  return completion.choices[0].message.content;
}

module.exports = { generateEmbedding , getModelResponse }