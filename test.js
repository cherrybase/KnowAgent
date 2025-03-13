const { vectorDb } = require("./app-chat/models/milvus");
const { generateEmbeddingOpenAi } = require("./app-chat/services/gpt");
const { readTextFile, splitTextIntoChunks, generateQuestions , generateAnswers } = require("./app-chat/services/qa-generator");
const fs = require('fs');
function readQAPairsFromJsonl(filename = "qaPairs.jsonl") {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.trim().split('\n'); // Trim to remove trailing newline, split into lines.
    const qaPairs = lines.map(line => JSON.parse(line));
    return qaPairs;
  } catch (error) {
    console.error("Error reading QA pairs:", error);
    return []; // Return an empty array in case of an error.
  }
}
async function insert(collectionName , data){
  const res = await vectorDb.insert({
    collection_name : collectionName,
    data: [data],
  });
  console.log(JSON.stringify(res));
}
async function searchTest(collection_name){
  const qts = "What are the three main components of a vector database as mentioned in the text?"
  const embedding = await generateEmbeddingOpenAi(qts,512);
  const park = "kedar.mehery.xyz";
  const searchResult = await vectorDb.search({
    collection_name,
    vector : embedding,
    filter : `tenant_partition_key == "${park}"`,
    limit : 2,
    output_fields : ["knowledgebase"],
    metric_type: "COSINE"
  });
  console.log(JSON.stringify(searchResult));
}
async function main() {
  const inputfilePath = "./public/input/vectordb.txt";
  const outputfilePath = "./public/output/qapairs.jsonl"
  const collectionName = "fast_semantic_search_qa"
  const text = readTextFile(inputfilePath);
  // console.log(text);
  const chunks = splitTextIntoChunks(text);
  console.log(`Text split into ${chunks.length} chunks`);

  // Process each chunk` to generate Q&A pairs
  const allQAPairs = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const chunk = chunks[i];
    // console.log(chunk);
    // Generate questions for this chunk
    const questions = await generateQuestions(chunk, 5);
    console.log(`Generated ${questions.length} questions for chunk ${i + 1}`);

    // Generate answers for these questions
    for (const question of questions) {
      const answer = await generateAnswers(chunk, question.question);
      allQAPairs.push({ question : question.question, answer });
    }
  }
  let jsonlString = "";
  for (const qaPair of allQAPairs) {
    jsonlString += JSON.stringify(qaPair) + "\n";
  }
  console.log(JSON.stringify(allQAPairs));
  fs.writeFileSync(outputfilePath, jsonlString, "utf8");
  const qaPairs = readQAPairsFromJsonl(outputfilePath);
  for(let i=0;i<qaPairs.length;i++){
    console.log(qaPairs[i]);
    const embedding = await generateEmbeddingOpenAi(qaPairs[i].question , 512);
    const data = {
      tenant_partition_key: "kedar.mehery.xyz",
      fast_dense_vector : embedding,
      knowledgebase: `Question : ${qaPairs[i].question} \n Answer : ${qaPairs[i].answer}`,
    }
    await insert(collectionName,data);
  }
  await searchTest(collectionName);
}

main(); // Call the async main function
