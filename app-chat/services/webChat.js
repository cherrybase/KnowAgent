const { WebChat } = require("./../models/collections");
const { openai } = require("./../models/openai");
/**
 * Retrieves the 5 most recent web chats for a specific contact
 * @param {string} contactId - The ID of the contact to retrieve chats for
 * @returns {Promise<Array>} Array of recent web chats with selected fields
 */
async function getRecentWebChats(contactId) {
  try {
    const recentChats = await WebChat.find({ contactId }, {
      // Explicitly select only the desired fields
      contactId: 1,
      messages: 1,
      timestamp: 1,
      _id: 0
    })
    .sort({ timestamp: -1 }) // Sort by most recent first
    .limit(5); // Limit to 5 most recent chats

    return recentChats;
  } catch (error) {
    console.error('Error retrieving recent web chats:', error);
    throw error; // Re-throw to allow caller to handle
  }
}
/**
 * Formats chat history into a string for context
 * @param {Array} chats - Array of chat objects
 * @returns {string} Formatted chat history
 */
function formatChatHistory(chats) {
  return chats.map((chat, index) => {
    const date = new Date(chat.timestamp).toLocaleString();
    return `Conversation ${index + 1} (${date}):\nUser: ${chat.messages.user}\nAssistant: ${chat.messages.assistant}\n`;
  }).join('\n');
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
    if(recentChats.length === 0) return currentQuestion;
    // Format chat history as string
    const chatHistoryString = formatChatHistory(recentChats);
    
    // Construct the system and user messages
    const systemPrompt = `Based on the chat history provided below as context, rephrase the user's current question according to the chat history context.\n
<Chat History>\n
${chatHistoryString}\n
</Chat History>

Only output the rephrasd question nothing else.`;

    const userPrompt = `Current user question: ${currentQuestion}`;
    
    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or another model like gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more focused output
      max_tokens: 150, // Limit tokens for concise rephrasing
    });
    
    // Extract the rephrased question
    const rephrasedQuestion = completion.choices[0].message.content.trim();
    console.log(`Original: "${currentQuestion}"\nRephrased: "${rephrasedQuestion}"`);
    
    return rephrasedQuestion;
  } catch (error) {
    console.error('Error rephrasing question:', error);
    return currentQuestion; // Fall back to original question on error
  }
}


module.exports = { getRecentWebChats , rephraseWithContext };