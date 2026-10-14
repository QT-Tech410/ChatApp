import { useFriendStore } from "@/stores/useFriendStore";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, Users } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Friend } from "@/types/user";
import IniviteSuggestionList from "../newGroupChat/IniviteSuggestionList";
import SelectedUsersList from "../newGroupChat/SelectedUsersList";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

const NewGroupChatModal = () => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const { friends, getFriends } = useFriendStore();
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const { loading, createConversation } = useChatStore();

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      await getFriends();
    } else {
      setGroupName("");
      setSearch("");
      setInvitedUsers([]);
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  };

  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!groupName.trim()) {
        toast.warning("Vui lòng nhập tên nhóm");
        return;
      }
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất 1 thành viên vào nhóm");
        return;
      }

      await createConversation(
        "group",
        groupName.trim(),
        invitedUsers.map((u) => u._id)
      );

      toast.success("Tạo nhóm trò chuyện thành công");
      setOpen(false);
    } catch (error) {
      console.error("Lỗi xảy ra khi handleSubmit trong NewGroupChatModal:", error);
      toast.error("Không thể tạo nhóm. Vui lòng thử lại!");
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !invitedUsers.some((u) => u._id === friend._id)
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          title="Tạo nhóm chat mới"
          aria-label="Tạo nhóm chat mới"
        >
          <Users className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Tạo nhóm trò chuyện mới
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 mt-2"
          onSubmit={handleSubmit}
        >
          {/* Tên nhóm */}
          <div className="space-y-1.5">
            <Label
              htmlFor="groupName"
              className="text-xs font-semibold text-foreground"
            >
              Tên nhóm
            </Label>
            <Input
              id="groupName"
              placeholder="Nhập tên nhóm trò chuyện..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* Mời thành viên */}
          <div className="space-y-1.5">
            <Label
              htmlFor="invite"
              className="text-xs font-semibold text-foreground"
            >
              Mời thành viên ({invitedUsers.length} đã chọn)
            </Label>

            <Input
              id="invite"
              placeholder="Tìm theo tên bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            {/* Danh sách gợi ý */}
            {search && filteredFriends.length > 0 && (
              <IniviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            {/* Danh sách user đã chọn */}
            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || !groupName.trim() || invitedUsers.length === 0}
              className="w-full font-medium"
            >
              {loading ? (
                <span>Đang tạo nhóm...</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
