const fs = require('fs');
const { openai } = require("./../models/openai");
const { z } = require('zod');
const { zodResponseFormat } = require("openai/helpers/zod");

// Function to read text file
function readTextFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    return text;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

// Function to split text into chunks
function splitTextIntoChunks(text, chunkSize = 1500, overlap = 150) {
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = startIndex + chunkSize;
    
    // If not at the end of the text, find a good break point
    if (endIndex < text.length) {
      // Try to find the next period, question mark, or exclamation point after endIndex
      const nextSentenceEnd = text.indexOf('.', endIndex);
      const nextQuestionEnd = text.indexOf('?', endIndex);
      const nextExclamationEnd = text.indexOf('!', endIndex);
      
      // Find the closest sentence-ending punctuation
      const possibleEnds = [nextSentenceEnd, nextQuestionEnd, nextExclamationEnd]
        .filter(pos => pos !== -1)
        .sort((a, b) => a - b);
      
      if (possibleEnds.length > 0) {
        endIndex = possibleEnds[0] + 1; // Include the punctuation
      }
    } else {
      endIndex = text.length;
    }
    
    // Add the chunk
    chunks.push(text.substring(startIndex, endIndex));
    
    // Calculate the next start point with overlap
    startIndex = endIndex - overlap;
    
    // If the remaining text is smaller than the overlap, just end
    if (startIndex >= text.length - overlap) {
      break;
    }
  }
  
  return chunks;
}

// Function to generate questions from text chunk
async function generateQuestions(textChunk, numQuestions = 3) {
  const sysPrompt = `You are an expert educator. Based on the following text, generate ${numQuestions} diverse and meaningful questions
    that would test understanding of key concepts in the text. Focus on important information.
    The questions should be challenging but answerable from the text.`
  const prompt = `
    TEXT:
    ${textChunk}
    
    Generate exactly ${numQuestions} questions. 
    
    Provide only valid JSON without extra text, markdown formatting, or explanations.
  `;
  const question = z.object({
    question : z.string()
  })
  const QuestionsList = z.object({
    questions : z.array(question)
  })
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role : "system" , content : sysPrompt },{ role: "user", content: prompt }],          
      temperature: 0.4,
      response_format: zodResponseFormat(QuestionsList,"questions_list")
    });
    
    const content = response.choices[0].message.content;
    const questionData = JSON.parse(content);
    
    if (!questionData.questions || !Array.isArray(questionData.questions)) {
      throw new Error("Response did not contain a valid questions array");
    }
    
    return questionData.questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

// Function to generate answers to questions based on text
async function generateAnswers(textChunk, question) {
  const sysPrompt = `Based on the following text, provide a concise but comprehensive answer to the question.`
  const prompt = `
    TEXT:
    ${textChunk}
    
    QUESTION: ${question}
    
    Your answer should be factual and directly based on the information provided in the text.
    Provide only valid JSON without extra text, markdown formatting, or explanations.
  `;
  const Answer = z.object({
    answer : z.string()
  });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role:"system",content:sysPrompt},{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: zodResponseFormat(Answer,"answer")
    });
    
    const content = response.choices[0].message.content;
    const answerData = JSON.parse(content);
    
    if (!answerData.answer) {
      throw new Error("Response did not contain a valid answer field");
    }
    
    return answerData.answer;
  } catch (error) {
    console.error(`Error generating answer for question: ${question}`, error);
    throw error;
  }
}

// Main function to process a text file and generate Q&A pairs
async function generateQAPairsFromTextFile(filePath, chunkSize = 2000, overlap = 200, questionsPerChunk = 3) {
  try {
    // Read the text file
    const text = readTextFile(filePath);
    
    // Split text into chunks
    const chunks = splitTextIntoChunks(text, chunkSize, overlap);
    console.log(`Text split into ${chunks.length} chunks`);
    
    // Process each chunk to generate Q&A pairs
    const allQAPairs = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      const chunk = chunks[i];
      
      // Generate questions for this chunk
      const questions = await generateQuestions(chunk, questionsPerChunk);
      console.log(`Generated ${questions.length} questions for chunk ${i + 1}`);
      
      // Generate answers for these questions
      for (const question of questions) {
        const answer = await generateAnswers(chunk, question);
        allQAPairs.push({ question, answer });
      }
    }
    
    // Return all Q&A pairs
    return allQAPairs;
  } catch (error) {
    console.error('Error generating Q&A pairs:', error);
    throw error;
  }
}

// // Example usage
// async function main() {
//   const filePath = './data/sample_text.txt';
//   const chunkSize = 2000; // Adjust this based on your needs
//   const overlap = 200;     // Overlap between chunks
//   const questionsPerChunk = 3;
  
//   const qaPairs = await generateQAPairsFromTextFile(filePath, chunkSize, overlap, questionsPerChunk);
  
//   // Save Q&A pairs to a JSON file
//   fs.writeFileSync('./data/qa_pairs.json', JSON.stringify(qaPairs, null, 2));
//   console.log(`Generated ${qaPairs.length} Q&A pairs and saved to qa_pairs.json`);
  
//   // Here you would add code to create embeddings and store in Zilliz
//   console.log('Next step: Generate embeddings for questions and store in Zilliz');
// }

// main().catch(console.error);

module.exports = { readTextFile , splitTextIntoChunks , generateQuestions , generateAnswers ,generateQAPairsFromTextFile };