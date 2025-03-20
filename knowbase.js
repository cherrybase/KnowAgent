const { KnowBase } = require("./app-chat/models/collections");
const { connectDB } = require("./app-chat/models/mongo");
async function getDocs() {
  try {
    const docs = await KnowBase.find().select({ _id: 1, type: 1, title: 1, category: 1, content: 1 });
    return docs;
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}

async function main() {
  const res = await getDocs()
  for(let i=0;i<res.length;i++){
    console.log(`Doc No. ${i+1} id : ${res[i]._id} content_length : ${res[i].content.length}`);
  }
} 
connectDB()
main()