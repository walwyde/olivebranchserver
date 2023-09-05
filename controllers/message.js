const { Conversation, Message } = require("../models/Message");
const User = require("../models/Users");

// Controller to store a new message
exports.createMessage = async (req, res) => {
  try {
    const { sender, conversation, timeStamp, content } = req.body;

    let message = {};

    if (sender) message.sender = sender;
    if (!sender) message.sender = req.user.id;
    if (conversation) message.conversation = conversation;
    if (!conversation) message.conversation = req.params.conversationId;
    if (timeStamp) message.timeStamp = timeStamp;
    if (!timeStamp) message.timestamp = Date.now();
    if (content) message.content = content;

    const newMessage = new Message(message);

    newMessage.seen.push(req.user.id);

    // Save the message

    const savedMessage = await newMessage.save();

    const user = await User.findById(req.user.id).select("-password");

    if (!user)
      return res.status(404).json({ errors: [{ msg: "User not found" }] });

    const convo = await Conversation.findOne({
      _id: savedMessage.conversation,
    });

    if (!convo)
      return res
        .status(404)
        .json({ errors: [{ msg: "Conversation not found" }] });

    convo.messages.push(savedMessage._id);
    convo.unReadMessages = true;

    await convo.save();

    // Send the message to the client

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

// Controller to retrieve all messages
exports.getAllMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Failed to fetch messages" }] });
  }
};

// Controller to get a single message by ID
// exports.getConversationById = async (req, res) => {
//   console.log(req.body, "convo")
//   try {
//     const { conversationId } = req.params;
//     const { sender, content } = req.body;

//     // Check if the conversation exists
//     const conversation = await Conversation.findById(conversationId).populate(
//       "messages"
//     );
//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     // Create a new message
//     const message = new Message({
//       conversation: conversation._id,
//       sender,
//       content,
//     });

//     // Save the message
//     await message.save();

//     res.json(message);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };

exports.newConversation = async (req, res) => {
  try {
    const participants = [req.user.id, req.body._id];
    const existing = await Conversation.findOne({
      participants: { $all: participants },
    });
    if (existing) {
      const convo = await Conversation.findOne({
        participants: { $all: participants },
      })
        .populate("messages")
        .populate("participants");

      convo.messages.length > 0 &&
        convo.messages.map(async (msg) => {
          if (!msg.seen.find((s) => s.toString() === req.user.id)) {
            msg.seen.push(req.user.id);
            // const message = await Message.findById(msg._id);
            // message.seen.push(req.user.id);
            await msg.save();
            // msg.seen.push(req.user.id);
          }
        });

      const read = await convo.save();

      return res.status(200).json(read);
    }

    const newConversation = new Conversation({
      participants,
    });

    await newConversation.save();
    const populatedConversation = await Conversation.findOne({
      participants: { $all: participants },
    })
      .populate("messages")
      .populate("participants");

    res.status(200).json(populatedConversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

exports.getConversations = async (req, res) => {
  try {
    // const userConversations = await Conversation.find({
    //   user: req.user.id,
    // })
    //   .populate("messages")
    //   .populate("participants");

    // if (userConversations.length > 0) return res.json(userConversations);

    const correspondentConvos = await Conversation.find({
      participants: req.user.id,
    })
      .populate("messages")
      .populate("participants");

    res.status(200).json(correspondentConvos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    const conversation = await Conversation.findOne({
      messages: { $in: messageId },
    });
    convoMessages = [...conversation.messages];
    conversation.messages = convoMessages.filter(
      (m) => m.toString() !== messageId
    );

    await conversation.save();
    await Message.findOneAndDelete({ _id: messageId });

    res.status(200).json({ msg: "message deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const deleted = await Conversation.findByIdAndRemove(req.body.convoId);

    if (deleted) return res.status(200).json({ msg: "conversation deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getNewMessages = async (req, res) => {
  try {
    let messages = [];
    let unseenMessages = [];

    const userConversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("messages")
      .populate("participants");

    if (!userConversations)
      return res
        .status(404)
        .json({ errors: [{ msg: "Conversation not found" }] });

    for (let i = 0; i < userConversations.length; i++) {
      messages = [...messages, ...userConversations[i].messages];
    }

    if (messages.length > 0) {
      messages.map((msg) => {
        // console.log(msg)
        if (!msg.seen.find((s) => s.toString() === req.user.id)) {
          console.log("unseen")
          unseenMessages = [...unseenMessages, msg];
        }
      });
    }

    console.log(unseenMessages)

    res.status(200).json(unseenMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};
