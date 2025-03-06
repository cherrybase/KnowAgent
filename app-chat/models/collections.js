const mongoose = require('mongoose');

const webChatSchema = new mongoose.Schema({
  contactId: {
    type: String,
    required: true,
    index: true  // Create an index on contactId for faster querying
  },
  rephrasedQuestion : {
    type : String, required : true
  },
  messages: {
    user: {
      type: String,
      required: true
    },
    assistant: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true  // Create an index on timestamp for efficient time-based queries
  },
  matches: [{
    knowledgebase: {
      type: String
    },
    score: {
      type: Number
    }
  }]
}, {
  // Add createdAt and updatedAt timestamps automatically
  timestamps: true
});

// Create and export the model
const WebChat = mongoose.model('WebChat', webChatSchema);

module.exports = { WebChat };