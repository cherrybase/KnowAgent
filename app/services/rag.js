const { vectorDb } = require("./../models/milvus")
const { generateEmbedding } = require("./gpt")
async function loadDb(){
  await vectorDb.loadCollection({
    collection_name: "qaSchema"
  });
}
/**
 * Performs semantic search in Milvus using the provided embedding vector
 * @param {string} collectionName - Name of the Milvus collection to search in
 * @param {number[]} embedding - The embedding vector to search with
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function semanticSearch(collectionName, embedding, topK = 3) {
  try {
    
    // Perform vector similarity search
    const searchResult = await vectorDb.search({
      collection_name: collectionName,
      vector: embedding,
      field_name: "question_dense_vector",
      limit: topK,
      output_fields: ["question", "answer"],
      metric_type: "COSINE"
    });
    
    return searchResult.results;
  } catch (error) {
    console.error("Error performing semantic search:", error);
    throw error;
  }
}

/**
 * Main RAG function that processes a user question
 * @param {string} userQuestion - The user's question
 * @param {string} collectionName - Name of the Milvus collection
 * @returns {Promise<Array>} - Top matching context documents
 */
async function performRAG(userQuestion, collectionName) {
  try {
    // 1. Generate embedding for the user question
    console.log("Generating embedding for user question...");
    const questionEmbedding = await generateEmbedding(userQuestion);
    
    // 2. Perform semantic search to find similar questions
    console.log("Performing semantic search...");
    const searchResults = await semanticSearch(collectionName, questionEmbedding);
    
    // 3. Format results for passing to the fine-tuned model
    const topMatches = searchResults.map(result => ({
      question: result.question,
      answer: result.answer,
      score: result.score
    }));
    
    console.log(`Found ${topMatches.length} relevant matches`);
    
    return topMatches;
    
    // The caller can then pass these top matches to their fine-tuned model
  } catch (error) {
    console.error("Error in RAG pipeline:", error);
    throw error;
  }
}

module.exports = { performRAG , semanticSearch , loadDb };