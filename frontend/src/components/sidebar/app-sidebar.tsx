import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectMessageList";
import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import { useChatStore } from "@/stores/useChatStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { convoLoading } = useChatStore();

  return (
    <Sidebar variant="sidebar" className="border-r border-sidebar-border bg-sidebar" {...props}>
      {/* Header with Brand & Theme Switch (No nested interactive <a>) */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs select-none">
              CA
            </div>
            <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight select-none">
              ChatApp
            </h1>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/40">
            <Sun className="size-3.5 text-muted-foreground" />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              aria-label="Chuyển đổi giao diện sáng/tối"
            />
            <Moon className="size-3.5 text-muted-foreground" />
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar px-1">
        {/* New Chat */}
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <CreateNewChat />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat */}
        <SidebarGroup className="py-1">
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nhóm chat
            </SidebarGroupLabel>
            <NewGroupChatModal />
          </div>

          <SidebarGroupContent className="mt-1">
            {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Direct Message */}
        <SidebarGroup className="py-1">
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tin nhắn trực tiếp
            </SidebarGroupLabel>
            <SidebarGroupAction title="Kết bạn mới" className="cursor-pointer">
              <AddFriendModal />
            </SidebarGroupAction>
          </div>

          <SidebarGroupContent className="mt-1">
            {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
