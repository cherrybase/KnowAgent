const { WebChat } = require("./../models/collections");
const { openai } = require("./../models/openai");
/**
 * Retrieves the 5 most recent web chats for a specific contact
 * @param {string} contactId - The ID of the contact to retrieve chats for
 * @returns {Promise<Array>} Array of recent web chats with selected fields
 */
async function getRecentWebChats(contactId) {
  try {
    const recentChats = await WebChat.find(
      { contactId },
      {
        // Explicitly select only the desired fields
        contactId: 1,
        messages: 1,
        timestamp: 1,
        rephrasedQuestion : 1,
        _id: 0,
      }
    )
      .sort({ timestamp: 1 }) // Sort by most recent first
      .limit(5); // Limit to 5 most recent chats

    return recentChats;
  } catch (error) {
    console.error("Error retrieving recent web chats:", error);
    throw error; // Re-throw to allow caller to handle
  }
}
/**
 * Formats chat history into a string for context
 * @param {Array} chats - Array of chat objects
 * @returns {string} Formatted chat history
 */
function formatChatHistory(chats) {
  return chats
    .map((chat, index) => {
      const date = new Date(chat.timestamp).toLocaleString();
      return `Conversation ${index + 1} (${date}):\nUser: ${chat.rephrasedQuestion}\nAssistant: ${chat.messages.assistant}\n`;
    })
    .join("\n");
}
/**
 * Rephrases the current user question using OpenAI based on chat history
 * @param {string} contactId - User's contact ID
 * @param {string} currentQuestion - The current question from the user
 * @returns {Promise<string>} The rephrased question
 */
async function rephraseWithContext(contactId, currentQuestion) {
  try {
    // Get recent chat history
    const recentChats = await getRecentWebChats(contactId);
    if (recentChats.length === 0) return currentQuestion;
    // Format chat history as string
    const chatHistoryString = formatChatHistory(recentChats);

    // Construct the system and user messages
    const systemPrompt = `
    Your task is to rephrase the user's current question in a context-aware manner using the provided chat history.
    
    ### Rephrasing Rules:
    - If the question is about sending money (charges, deductions, transfer, etc.), always infer the **latest country** from chat history — even if earlier contexts mention a different country.
    - Ignore frequency of mentions; always prioritize the **most recent country** in context.
    - If the user's question is about services, products, or remittance methods (like Visa card, bank deposit), do NOT inject any country unless explicitly mentioned.
    - Avoid hallucinating or assuming context beyond chat history.
    - Never provide an answer — only output the rephrased question.
    
    ### Conflict Resolution:
    - If multiple countries appear in the chat history, always default to the **latest mentioned country**.
    - If no country is mentioned, leave the question unchanged.
    
    ### Examples:
    - Q: What are the charges for sending money?  
      ✅ Rephrased: What are the charges for sending money to Bhutan?
    
    - Q: What is Visa card remittance service?  
      ✅ Rephrased: What is Visa card remittance service? (Do not inject any country)
    `;

//     const userPrompt = `
// ### Chat History
// ${chatHistoryString}

// ### Current User Question
// ${currentQuestion}

// Rephrase the user question based on the context provided.
// - If the chat history contains a clear target country, add it to the question.
// - If the chat history contains multiple target countries add the latest one to the question.
// - If the chat history contains relevant transfer fees, charges, or deductions, maintain that context.
// - If the context is unclear, leave the question unchanged.
// - Focus on making the question clear and concise without adding assumptions.
// `;
const userPrompt = `
### Chat History
${chatHistoryString}

### Current User Question
${currentQuestion}

Rephrase the user's question using the provided context.

- If the question is about sending money (charges, deductions, transfer, etc.), use the most recent country in context — even if older countries exist.
- If the question is about services, products, or remittance methods (like Visa card, bank deposit), do NOT inject any country unless explicitly mentioned.
- Always prioritize the user's intent and keep the question clear and concise.
- Avoid fabricating information or assuming context where none exists.
- In case of conflicting countries, default to the latest mentioned country.
`;
    console.log(`rephrase user prompt : ${userPrompt}`);
    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or another model like gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more focused output
      max_tokens: 150, // Limit tokens for concise rephrasing
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rephrase_question_response",
          schema: {
            type: "object",
            properties: {
              rephrasedQuestion: { type: "string" },
            },
            required: ["rephrasedQuestion"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    // Extract the rephrased question
    // const rephrasedQuestion = completion.choices[0].message.content.trim();
    
    const rephrasedQuestion = JSON.parse(completion.choices[0].message.content).rephrasedQuestion;
    console.log(`Original: "${currentQuestion}"\nRephrased: "${rephrasedQuestion}"`);
    console.log(completion.usage);
    return rephrasedQuestion;
  } catch (error) {
    console.error("Error rephrasing question:", error);
    return currentQuestion; // Fall back to original question on error
  }
}

module.exports = { getRecentWebChats, rephraseWithContext };
