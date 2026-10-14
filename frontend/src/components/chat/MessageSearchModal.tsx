import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Loader2, Calendar } from "lucide-react";
import { chatService } from "@/services/chatService";
import type { Message } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { formatMessageTime } from "@/lib/utils";

interface MessageSearchModalProps {
  conversationId: string;
}

export const MessageSearchModal = ({ conversationId }: MessageSearchModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await chatService.searchMessages(conversationId, searchTerm.trim());
        setResults(data.messages || []);
        setSearched(true);
      } catch (err) {
        console.error("Lỗi tìm kiếm tin nhắn:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, conversationId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-smooth"
          title="Tìm kiếm tin nhắn trong cuộc trò chuyện"
        >
          <Search className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Search className="size-4 text-primary" />
            <span>Tìm kiếm tin nhắn</span>
          </DialogTitle>
        </DialogHeader>

        {/* Input tìm kiếm */}
        <div className="relative my-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập nội dung cần tìm..."
            className="pr-9"
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Kết quả tìm kiếm */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 max-h-72 beautiful-scrollbar">
          {searched && (
            <p className="text-xs text-muted-foreground px-1">
              Tìm thấy {results.length} tin nhắn phù hợp
            </p>
          )}

          {searched && results.length === 0 && !isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Không tìm thấy tin nhắn nào khớp với &quot;{searchTerm}&quot;
            </div>
          )}

          {results.map((msg) => {
            const sender = msg.senderId as unknown as { displayName?: string; avatarUrl?: string };
            const displayName = sender?.displayName || "Người dùng";
            const avatarUrl = sender?.avatarUrl;

            return (
              <div
                key={msg._id}
                className="p-2.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={displayName} avatarUrl={avatarUrl || undefined} type="chat" />
                    <span className="text-xs font-semibold text-foreground">{displayName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatMessageTime(new Date(msg.createdAt))}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 pl-8 break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
