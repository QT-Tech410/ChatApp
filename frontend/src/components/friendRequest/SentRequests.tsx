import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { SendHorizontal } from "lucide-react";

const SentRequests = () => {
  const { sentList } = useFriendStore();

  if (!sentList || sentList.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <SendHorizontal className="size-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Bạn chưa gửi lời mời kết bạn nào</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Các lời mời kết bạn bạn đã gửi sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto beautiful-scrollbar pr-1">
      {sentList.map((req) => (
        <FriendRequestItem
          key={req._id}
          requestInfo={req}
          type="sent"
          actions={
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium select-none">
              Đang chờ trả lời
            </span>
          }
        />
      ))}
    </div>
  );
};

export default SentRequests;
