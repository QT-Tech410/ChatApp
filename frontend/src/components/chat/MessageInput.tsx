import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { chatService } from "@/services/chatService";

import { useSocketStore } from "@/stores/useSocketStore";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const [value, setValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    const socket = useSocketStore.getState().socket;
    if (socket && val.trim().length > 0) {
      socket.emit("typing", { conversationId: selectedConvo._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { conversationId: selectedConvo._id });
      }, 1500);
    }
  };

  const sendMessage = async () => {
    if (!value.trim()) return;
    const currValue = value;
    setValue("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    useSocketStore
      .getState()
      .socket?.emit("stop-typing", { conversationId: selectedConvo._id });

    try {
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue);
      } else {
        await sendGroupMessage(selectedConvo._id, currValue);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const sendImageMessage = async (imgUrl: string) => {
    try {
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, value.trim(), imgUrl);
      } else {
        await sendGroupMessage(selectedConvo._id, value.trim(), imgUrl);
      }
      setValue("");
    } catch (error) {
      console.error(error);
      toast.error("Gửi ảnh không thành công. Vui lòng thử lại.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const imgUrl = await chatService.uploadMessageImage(formData);
      await sendImageMessage(imgUrl);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi upload ảnh. Hãy thử lại sau.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Tệp tin vượt quá 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const fileUrl = await chatService.uploadMessageImage(formData);
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const fileData = {
        fileUrl,
        fileName: file.name,
        fileType: ext,
      };

      if (selectedConvo.type === "direct") {
        const otherUser = selectedConvo.participants.filter(
          (p) => p._id !== user._id
        )[0];
        await sendDirectMessage(
          otherUser._id,
          value.trim(),
          undefined,
          undefined,
          fileData
        );
      } else {
        await sendGroupMessage(
          selectedConvo._id,
          value.trim(),
          undefined,
          undefined,
          fileData
        );
      }
      setValue("");
      toast.success("Đã gửi tệp thành công");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi upload tệp tin. Hãy thử lại sau.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const openDocPicker = () => {
    docInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.pptx"
        className="hidden"
        onChange={handleDocChange}
      />

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 transition-smooth"
        onClick={openImagePicker}
        disabled={isUploading}
        title="Gửi hình ảnh"
      >
        <ImagePlus className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 transition-smooth"
        onClick={openDocPicker}
        disabled={isUploading}
        title="Đính kèm tệp tin tài liệu"
      >
        <Paperclip className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          onKeyPress={handleKeyPress}
          value={value}
          onChange={handleInputChange}
          placeholder="Soạn tin nhắn..."
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              <EmojiPicker
                onChange={(emoji: string) => setValue(`${value}${emoji}`)}
              />
            </div>
          </Button>
        </div>
      </div>

      <Button
        onClick={sendMessage}
        className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
        disabled={!value.trim()}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
