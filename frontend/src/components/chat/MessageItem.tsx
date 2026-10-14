import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, MoreVertical, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const { deleteMessage, editMessage } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;

  const isShowTime =
    index === 0 ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 5 phút

  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString(),
  );

  const handleDelete = async () => {
    try {
      await deleteMessage(message._id);
      toast.success("Đã thu hồi tin nhắn");
    } catch {
      toast.error("Không thể thu hồi tin nhắn");
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      setIsSubmitting(true);
      await editMessage(message._id, editText.trim());
      setIsEditing(false);
      toast.success("Đã cập nhật tin nhắn");
    } catch {
      toast.error("Không thể chỉnh sửa tin nhắn");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* time */}
      {isShowTime && (
        <span className="flex justify-center text-xs text-muted-foreground px-1 my-2">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        className={cn(
          "group relative flex gap-2 message-bounce mt-1 items-end",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        {/* avatar */}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "ChatApp"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}

        {/* Nút tác vụ (Thu hồi/Sửa) cho người gửi */}
        {message.isOwn && !message.isDeleted && !isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {message.content && (
                  <DropdownMenuItem
                    onClick={() => {
                      setEditText(message.content || "");
                      setIsEditing(true);
                    }}
                    className="cursor-pointer gap-2"
                  >
                    <Pencil className="size-3.5" />
                    <span>Sửa</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>Thu hồi</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Bong bóng tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          {isEditing ? (
            <div className="flex items-center gap-1.5 w-full bg-card p-1.5 rounded-xl border border-primary/30 shadow-sm">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="h-8 text-sm"
                autoFocus
                disabled={isSubmitting}
              />
              <Button
                size="icon"
                className="size-8 shrink-0"
                onClick={handleSaveEdit}
                disabled={isSubmitting || !editText.trim()}
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <Card
              className={cn(
                "p-3 space-y-2",
                message.isDeleted
                  ? "bg-muted/40 border border-dashed border-border"
                  : message.isOwn
                    ? "chat-bubble-sent border-0"
                    : "chat-bubble-received",
              )}
            >
              {/* Trích dẫn tin nhắn trả lời */}
              {message.replyTo && (
                <div className="border-l-2 border-primary/70 pl-2 py-0.5 text-xs text-muted-foreground/90 bg-background/20 rounded-r mb-1">
                  <span className="font-semibold text-foreground/80">
                    {message.replyTo.senderId?.displayName || "Người dùng"}
                  </span>
                  :{" "}
                  <span>
                    {message.replyTo.isDeleted
                      ? "Tin nhắn đã được thu hồi"
                      : message.replyTo.content || "Hình ảnh"}
                  </span>
                </div>
              )}

              {message.imgUrl && !message.isDeleted && (
                <img
                  src={message.imgUrl}
                  alt="Tin nhắn ảnh"
                  className="max-h-80 w-full rounded-xl object-cover"
                />
              )}

              {message.isDeleted ? (
                <p className="text-xs italic text-muted-foreground flex items-center gap-1.5 py-0.5">
                  <RotateCcw className="size-3" />
                  <span>Tin nhắn đã được thu hồi</span>
                </p>
              ) : (
                message.content && (
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                    {message.isEdited && (
                      <span className="text-[10px] ml-1.5 opacity-60 italic">
                        (đã sửa)
                      </span>
                    )}
                  </p>
                )
              )}
            </Card>
          )}

          {/* seen/ delivered */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
