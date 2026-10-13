import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  }
);

const lastMessageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    group: {
      type: groupSchema,
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    // Chỉ dùng cho direct conversation: "<userIdNhỏ>_<userIdLớn>" — làm khoá unique.
    // Được sinh tự động bởi pre-validate hook, không nhận từ client.
    directKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Sửa typo cũ: index trước đây khai trên "participant.userId" (thiếu 's')
// nên không khớp field thật → mọi query theo thành viên đều COLLSCAN.
conversationSchema.index({
  "participants.userId": 1,
  lastMessageAt: -1,
});

// Chống race condition tạo 2 conversation direct trùng nhau cho cùng một cặp user.
// directKey được set ở pre-validate hook bên dưới.
// LƯU Ý partialFilterExpression phải kèm directKey $exists: các document cũ (tạo
// trước khi có field này) chưa có directKey — nếu không loại trừ, chúng cùng
// index thành null và vi phạm unique ngay khi MongoDB build index.
conversationSchema.index(
  { directKey: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "direct", directKey: { $exists: true } },
  }
);

conversationSchema.pre("validate", function () {
  if (this.type === "direct" && Array.isArray(this.participants)) {
    const ids = this.participants
      .map((p) => p.userId?.toString())
      .filter(Boolean)
      .sort();
    if (ids.length === 2) {
      this.directKey = ids.join("_");
    }
  }
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
