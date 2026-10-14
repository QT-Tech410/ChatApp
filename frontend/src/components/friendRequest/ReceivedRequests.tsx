import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

const ReceivedRequests = () => {
  const { acceptRequest, declineRequest, loading, receivedList } = useFriendStore();

  if (!receivedList || receivedList.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UserCheck className="size-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Không có lời mời kết bạn nào</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Khi có người gửi lời mời kết bạn, yêu cầu sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      toast.success("Đã đồng ý kết bạn thành công");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId);
      toast.info("Đã từ chối kết bạn");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto beautiful-scrollbar pr-1">
      {receivedList.map((req) => (
        <FriendRequestItem
          key={req._id}
          requestInfo={req}
          type="received"
          actions={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAccept(req._id)}
                disabled={loading}
                className="h-8 text-xs font-medium"
              >
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(req._id)}
                disabled={loading}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
              >
                Từ chối
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ReceivedRequests;
