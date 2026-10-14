import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import { MessageSquareText } from "lucide-react";

const ChatWelcomeScreen = () => {
  return (
    <SidebarInset className="flex flex-col w-full h-full bg-background overflow-hidden">
      <ChatWindowHeader />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div className="size-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <MessageSquareText className="size-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Chọn một cuộc hội thoại
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chọn một người bạn hoặc nhóm từ danh sách bên trái để bắt đầu trao đổi tin nhắn.
          </p>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWelcomeScreen;
