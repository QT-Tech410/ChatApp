import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
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
import {
  Check,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
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
            <div className="flex items-center gap-1.5 w-full bg-card p-1.5 rounded-xl border border-primary/40 shadow-xs">
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
            <div
              className={cn(
                "px-3.5 py-2.5 space-y-1.5 text-sm",
                message.isDeleted
                  ? "bg-muted/40 border border-border/60 text-muted-foreground rounded-xl"
                  : message.isOwn
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-xs shadow-xs"
                    : "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-xs border border-border/50 shadow-xs",
              )}
            >
              {/* Trích dẫn tin nhắn trả lời */}
              {message.replyTo && (
                <div className="border-l-2 border-current/40 pl-2 py-0.5 text-xs opacity-90 rounded-r mb-1">
                  <span className="font-semibold">
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
                  className="max-h-72 w-full rounded-xl object-cover border border-border/20"
                />
              )}

              {/* Tệp tin đính kèm */}
              {message.fileUrl && !message.isDeleted && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg transition-colors border group/file my-1",
                    message.isOwn
                      ? "bg-black/10 border-white/20 text-primary-foreground hover:bg-black/20"
                      : "bg-background/70 border-border/60 hover:bg-background text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded flex items-center justify-center shrink-0",
                      message.isOwn ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}
                  >
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-medium truncate group-hover/file:underline">
                      {message.fileName || "Tệp đính kèm"}
                    </p>
                    <p className="text-[10px] opacity-75 uppercase">
                      {message.fileType || "Tài liệu"}
                    </p>
                  </div>
                  <Download className="size-3.5 opacity-75 group-hover/file:opacity-100 shrink-0" />
                </a>
              )}

              {message.isDeleted ? (
                <p className="text-xs italic text-muted-foreground flex items-center gap-1.5 py-0.5">
                  <RotateCcw className="size-3" />
                  <span>Tin nhắn đã được thu hồi</span>
                </p>
              ) : (
                message.content && (
                  <p className="leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                    {message.isEdited && (
                      <span className="text-[10px] ml-1.5 opacity-75 italic">
                        (đã sửa)
                      </span>
                    )}
                  </p>
                )
              )}
            </div>
          )}

          {/* Trạng thái gửi / xem tin nhắn */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none select-none",
                lastMessageStatus === "seen"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
