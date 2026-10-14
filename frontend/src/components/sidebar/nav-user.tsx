import { Bell, ChevronsUpDown, LogOut, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@/types/user";
import { useState } from "react";
import FriendRequestDialog from "../friendRequest/FriendRequestDialog";
import ProfileDialog from "../profile/ProfileDialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { getAvatarColor, getInitials } from "../chat/UserAvatar";

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const [friendRequestOpen, setfriendRequestOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const colorClass = getAvatarColor(user.displayName);
  const initials = getInitials(user.displayName);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg"
              >
                <Avatar className="size-8 rounded-lg">
                  {user.avatarUrl && (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className={`rounded-lg ${colorClass}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium text-sidebar-foreground">
                    {user.displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-1 shadow-md"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                  <Avatar className="size-9 rounded-lg">
                    {user.avatarUrl && (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className={`rounded-lg ${colorClass}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium text-foreground">
                      {user.displayName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span>Tài khoản & Thiết lập</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setfriendRequestOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <Bell className="size-4 text-muted-foreground" />
                  <span>Lời mời kết bạn</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <FriendRequestDialog
        open={friendRequestOpen}
        setOpen={setfriendRequestOpen}
      />

      <ProfileDialog
        open={profileOpen}
        setOpen={setProfileOpen}
      />
    </>
  );
}
