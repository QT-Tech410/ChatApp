import "dotenv/config";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const RETENTION_DAYS = parseInt(process.env.ARCHIVE_RETENTION_DAYS || "180", 10);

const log = (...args) => console.log("[archive]", ...args);

// Schema cho tin nhắn lưu trữ lâu dài (Cold Storage Collection)
const archivedMessageSchema = new mongoose.Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    content: String,
    imgUrl: String,
    fileUrl: String,
    fileName: String,
    fileType: String,
    isDeleted: Boolean,
    isEdited: Boolean,
    replyTo: mongoose.Schema.Types.ObjectId,
    originalCreatedAt: Date,
    archivedAt: { type: Date, default: Date.now },
  },
  { collection: "archived_messages" }
);

archivedMessageSchema.index({ conversationId: 1, originalCreatedAt: -1 });

const ArchivedMessage = mongoose.model("ArchivedMessage", archivedMessageSchema);

const runArchive = async () => {
  log("Đang kết nối CSDL MongoDB...");
  await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  log(`Bắt đầu quy trình nén và lưu trữ tin nhắn cũ hơn ${RETENTION_DAYS} ngày (trước ngày ${cutoffDate.toISOString().slice(0, 10)})`);

  const oldMessages = await Message.find({
    createdAt: { $lt: cutoffDate },
  }).lean();

  log(`Tìm thấy ${oldMessages.length} tin nhắn thuộc diện lưu trữ lâu dài.`);

  if (oldMessages.length === 0) {
    log("Không có tin nhắn nào cần lưu trữ. Hoàn tất.");
    await mongoose.disconnect();
    return;
  }

  // Chuyển sang collection ArchivedMessage theo từng batch 500 bản ghi
  const BATCH_SIZE = 500;
  let totalArchived = 0;

  for (let i = 0; i < oldMessages.length; i += BATCH_SIZE) {
    const batch = oldMessages.slice(i, i + BATCH_SIZE);
    const docs = batch.map((m) => ({
      originalId: m._id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      imgUrl: m.imgUrl,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileType: m.fileType,
      isDeleted: m.isDeleted,
      isEdited: m.isEdited,
      replyTo: m.replyTo,
      originalCreatedAt: m.createdAt,
    }));

    await ArchivedMessage.insertMany(docs);
    const ids = batch.map((m) => m._id);
    await Message.deleteMany({ _id: { $in: ids } });

    totalArchived += batch.length;
    log(`Đã chuyển lưu trữ và giải phóng ${totalArchived}/${oldMessages.length} tin nhắn...`);
  }

  log(`Đã lưu trữ thành công tổng cộng ${totalArchived} tin nhắn vào Cold Storage.`);
  await mongoose.disconnect();
  log("Hoàn tất quy trình Archive.");
};

runArchive().catch((error) => {
  console.error("[archive] THẤT BẠI:", error);
  process.exit(1);
});
