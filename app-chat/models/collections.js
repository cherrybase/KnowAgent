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

const knowBaseSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    idNumber: {
      type: Number,
      required: false,
    },
    parentId: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    created: {
      stamp: {
        type: Number,
        required: true,
      },
      hour: {
        type: Number,
        required: true,
      },
      day: {
        type: Number,
        required: true,
      },
      week: {
        type: Number,
        required: true,
      },
      byUser: {
        type: String,
        required: true,
      },
    },
    updated: {
      stamp: {
        type: Number,
        required: true,
      },
      hour: {
        type: Number,
        required: true,
      },
      day: {
        type: Number,
        required: true,
      },
      week: {
        type: Number,
        required: true,
      },
      byUser: {
        type: String,
        required: true,
      },
    },
    _class: {
      type: String,
      required: true,
      default: "KnowBase",
    },
  },
  { collection: "DICT_KNOW_BASE" }
);

const KnowBase = mongoose.model("KnowBase", knowBaseSchema);


// Create and export the model
const WebChat = mongoose.model('WebChat', webChatSchema);

module.exports = { WebChat , KnowBase };