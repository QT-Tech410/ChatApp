import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Conversation, Participant } from "@/types/chat";
import type { Friend } from "@/types/user";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import UserAvatar from "./UserAvatar";
import { Crown, LogOut, Pencil, Settings, UserMinus, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface GroupManagementModalProps {
  chat: Conversation;
}

export const GroupManagementModal = ({ chat }: GroupManagementModalProps) => {
  const { user } = useAuthStore();
  const { friends, getFriends } = useFriendStore();
  const {
    removeMemberFromGroup,
    addMembersToGroup,
    updateGroupInfo,
    setActiveConversation,
  } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(chat.group?.name || "");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreator = chat.group?.createdBy?.toString() === user?._id?.toString();
  const currentMemberIds = new Set(chat.participants.map((p) => p._id.toString()));
  const availableFriends = friends.filter((f) => !currentMemberIds.has(f._id));

  const handleOpenModal = async () => {
    setIsOpen(true);
    setNewName(chat.group?.name || "");
    setIsEditingName(false);
    setIsAddingMember(false);
    setSelectedFriendIds([]);
    await getFriends();
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim() === chat.group?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      setIsSubmitting(true);
      await updateGroupInfo(chat._id, newName.trim());
      setIsEditingName(false);
      toast.success("Đã đổi tên nhóm");
    } catch {
      toast.error("Không thể đổi tên nhóm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeMemberFromGroup(chat._id, memberId);
      toast.success(`Đã xoá ${memberName} khỏi nhóm`);
    } catch {
      toast.error("Không thể xoá thành viên");
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    try {
      await removeMemberFromGroup(chat._id, user._id);
      setIsOpen(false);
      setActiveConversation(null);
      toast.success("Bạn đã rời nhóm");
    } catch {
      toast.error("Không thể rời nhóm");
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriendIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await addMembersToGroup(chat._id, selectedFriendIds);
      setSelectedFriendIds([]);
      setIsAddingMember(false);
      toast.success("Đã thêm thành viên mới vào nhóm");
    } catch {
      toast.error("Không thể thêm thành viên");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenModal}
          className="hover:bg-primary/10 transition-smooth"
          title="Cài đặt nhóm"
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Quản lý nhóm</span>
            <Badge variant="outline" className="text-xs">
              {chat.participants.length} thành viên
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Tên nhóm */}
        <div className="py-2 border-b">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Tên nhóm
          </label>
          {isEditingName ? (
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="icon"
                className="size-8 shrink-0"
                onClick={handleUpdateName}
                disabled={isSubmitting || !newName.trim()}
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                onClick={() => setIsEditingName(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium text-foreground">{chat.group?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditingName(true)}
              >
                <Pencil className="size-3" />
                <span>Đổi tên</span>
              </Button>
            </div>
          )}
        </div>

        {/* Danh sách thành viên */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 beautiful-scrollbar max-h-60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Thành viên ({chat.participants.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => setIsAddingMember(!isAddingMember)}
            >
              <UserPlus className="size-3.5" />
              <span>{isAddingMember ? "Đóng" : "Thêm bạn"}</span>
            </Button>
          </div>

          {/* Form thêm bạn bè vào nhóm */}
          {isAddingMember && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
              <span className="text-xs font-medium text-foreground">
                Chọn bạn bè để thêm vào nhóm:
              </span>
              {availableFriends.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Không còn bạn bè nào khác ngoài nhóm để thêm.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto beautiful-scrollbar">
                  {availableFriends.map((friend: Friend) => {
                    const isSelected = selectedFriendIds.includes(friend._id);
                    return (
                      <div
                        key={friend._id}
                        onClick={() => toggleSelectFriend(friend._id)}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={friend.displayName}
                            avatarUrl={friend.avatarUrl || undefined}
                            type="chat"
                          />
                          <span>{friend.displayName}</span>
                        </div>
                        {isSelected && <Check className="size-3.5" />}
                      </div>
                    );
                  })}
                </div>
              )}
              {availableFriends.length > 0 && (
                <Button
                  size="sm"
                  className="w-full h-8 text-xs mt-2"
                  onClick={handleAddMembers}
                  disabled={isSubmitting || selectedFriendIds.length === 0}
                >
                  Thêm {selectedFriendIds.length > 0 ? `(${selectedFriendIds.length})` : ""} vào nhóm
                </Button>
              )}
            </div>
          )}

          {/* Danh sách thành viên hiện tại */}
          <div className="space-y-1.5">
            {chat.participants.map((participant: Participant) => {
              const isMemberCreator =
                chat.group?.createdBy?.toString() === participant._id.toString();
              const isSelf = participant._id.toString() === user?._id?.toString();

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={participant.displayName}
                      avatarUrl={participant.avatarUrl || undefined}
                      type="chat"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {participant.displayName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] text-muted-foreground">
                            (Bạn)
                          </span>
                        )}
                      </div>
                      {isMemberCreator && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                          <Crown className="size-3" />
                          <span>Trưởng nhóm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quyền kích thành viên cho trưởng nhóm */}
                  {isCreator && !isSelf && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleRemoveMember(participant._id, participant.displayName)
                      }
                      title="Xoá khỏi nhóm"
                    >
                      <UserMinus className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút rời nhóm */}
        <div className="pt-3 border-t flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveGroup}
            className="gap-1.5 text-xs h-8"
          >
            <LogOut className="size-3.5" />
            <span>Rời nhóm</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
