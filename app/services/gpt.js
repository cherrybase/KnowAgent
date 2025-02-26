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

module.exports = { generateEmbedding }