const { DataType, MetricType, IndexType } = require("@zilliz/milvus2-sdk-node");
const fs = require("fs");
const readline = require("readline");
const { vectorDb } = require("./app/models/milvus");



// Example usage:
async function getData(path) {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const insertData = [];
  for await (const line of rl) {
    const data = JSON.parse(line);
    console.log(`Question : ${data.question}`)
    console.log(`Answer : ${data.answer}`)
    insertData.push({
      question: data.question,
      answer: data.answer,
      question_dense_vector: data.embedding
    });
  }
  return insertData
}
async function createCollection(collectionName) {
  try {
    // 1. Create Collection
    const collectionSchema = {
      name: collectionName,
      fields: [
        { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: "question", data_type: DataType.VarChar, max_length: 2048 },
        { name: "answer", data_type: DataType.VarChar, max_length: 4096 },
        { name: "question_dense_vector", data_type: DataType.FloatVector, dim: 512 }, // Assuming 512 dimensions
      ],
    };
    
    await vectorDb.createCollection({
      collection_name: collectionName,
      fields: collectionSchema.fields,
    });
    console.log(`Collection "${collectionName}" created.`);
    await vectorDb.createIndex({
      collection_name: collectionName,
      field_name: "question_dense_vector",
      index_type: IndexType.AUTOINDEX,
      metric_type: MetricType.COSINE,   
      index_name: "qts_dense_vec_index"
    });
    //4. load collection
    console.log(await vectorDb.loadCollection({ collection_name: collectionName }))
    console.log("Collection loaded.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await vectorDb.closeConnection()
  }
}
async function insertData(collectionName,path){
  const insertData = await getData(path)
  await vectorDb.insert({
    collection_name: collectionName,
    fields_data: insertData,
  });
  console.log(`Data inserted into collection.`);
}
async function main() {
  const collectionName = "qaSchema";
  const jsonlFilePath = './embeddingTest.jsonl'; // Replace with your JSONL file path
  // const data = await getData(jsonlFilePath);
  // console.log('data:', data); // Use console.log with an object rather than string interpolation.
  await createCollection(collectionName);
  // await insertData(collectionName,jsonlFilePath);
  // console.log(JSON.stringify(await vectorDb.describeCollection({ collection_name : collectionName })));
}

main(); // Call the async main function


