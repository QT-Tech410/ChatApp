// Migration một-lần cho Giai đoạn 1. Chạy: node src/scripts/migrate.js
// Idempotent — chạy lại nhiều lần an toàn.
import "dotenv/config";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Session from "../models/Session.js";

const log = (...args) => console.log("[migrate]", ...args);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
  log("đã kết nối CSDL");

  // 1) Xoá index cũ khai sai tên field ("participant.userId" thiếu 's').
  //    Index này vô dụng (không khớp query nào) và gây nhầm lẫn.
  try {
    await Conversation.collection.dropIndex("participant.userId_1_lastMessageAt_-1");
    log("đã xoá index sai 'participant.userId_1_lastMessageAt_-1'");
  } catch (error) {
    if (error.code === 27) log("index sai không tồn tại — bỏ qua");
    else throw error;
  }

  // 2) Backfill directKey cho các conversation direct cũ (tạo trước khi field
  //    này tồn tại). Không backfill thì chúng không được unique index bảo vệ
  //    và helper phải rơi vào nhánh tra cứu chậm.
  //
  //    Cẩn thận: race condition cũ có thể đã tạo ra các cặp conversation trùng
  //    cho cùng một cặp user. Nếu gán cùng directKey cho cả hai, syncIndexes ở
  //    bước 4 sẽ thất bại. Nên chỉ gán cho bản đầu tiên, và BÁO CÁO các bản
  //    trùng để xử lý thủ công (xoá conversation là destructive — không tự làm).
  const directConversations = await Conversation.find({ type: "direct" }).lean();
  const claimed = new Map(); // directKey -> conversationId đầu tiên sở hữu nó
  const duplicates = [];
  let backfilled = 0;

  for (const convo of directConversations) {
    const ids = (convo.participants || [])
      .map((p) => p.userId?.toString())
      .filter(Boolean)
      .sort();

    if (ids.length !== 2) continue;

    const key = ids.join("_");

    if (claimed.has(key)) {
      duplicates.push({ key, kept: claimed.get(key), duplicate: convo._id });
      continue;
    }
    claimed.set(key, convo._id);

    if (convo.directKey === key) continue;

    await Conversation.updateOne({ _id: convo._id }, { $set: { directKey: key } });
    backfilled += 1;
  }
  log(`đã backfill directKey cho ${backfilled} conversation direct`);

  if (duplicates.length > 0) {
    console.warn(
      `[migrate] CẢNH BÁO: phát hiện ${duplicates.length} conversation direct TRÙNG` +
        ` (hậu quả của race condition cũ). Chúng chưa được gán directKey, nên` +
        ` unique index vẫn tạo được, nhưng bạn cần gộp/xoá thủ công:`
    );
    for (const d of duplicates) {
      console.warn(`  - cặp ${d.key}: giữ ${d.kept}, trùng ${d.duplicate}`);
    }
  }

  // 3) Dọn session cũ lưu refresh token PLAINTEXT. Schema mới chỉ lưu hash
  //    (refreshTokenHash), nên các session cũ không còn dùng được — user phải
  //    đăng nhập lại. Đây là chi phí một-lần bắt buộc của việc chuyển sang hash.
  //    Dùng raw collection vì field refreshToken không còn trong schema
  //    (Mongoose có thể strip nó khỏi query filter).
  const stale = await Session.collection.deleteMany({
    refreshToken: { $exists: true },
  });
  log(`đã xoá ${stale.deletedCount} session plaintext cũ (user cần đăng nhập lại)`);

  // 4) Đảm bảo các index mới được tạo (autoIndex có thể tắt ở production).
  await Conversation.syncIndexes();
  await Session.syncIndexes();
  log("đã sync indexes");

  await mongoose.disconnect();
  log("hoàn tất");
};

run().catch((error) => {
  console.error("[migrate] THẤT BẠI:", error);
  process.exit(1);
});
