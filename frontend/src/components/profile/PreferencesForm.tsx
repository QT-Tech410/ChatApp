import { Sun, Moon, Palette } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/stores/useThemeStore";
import { useState } from "react";

const PreferencesForm = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [onlineStatus, setOnlineStatus] = useState(true);

  return (
    <Card className="border border-border shadow-xs bg-card rounded-xl p-0">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Palette className="size-4 text-primary" />
          Giao diện & Hiển thị
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Tùy chỉnh chủ đề sáng/tối và trải nghiệm sử dụng
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-5">
        {/* Dark Mode */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="theme-toggle"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Chế độ tối (Dark Mode)
            </Label>
            <p className="text-xs text-muted-foreground">
              Chuyển đổi giao diện sang tông màu Slate trầm sâu, thân thiện với mắt
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Sun className="size-4 text-muted-foreground" />
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
            <Moon className="size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="space-y-0.5">
            <Label
              htmlFor="online-status"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Hiển thị trạng thái hoạt động
            </Label>
            <p className="text-xs text-muted-foreground">
              Cho phép bạn bè biết khi bạn đang trực tuyến trên hệ thống
            </p>
          </div>
          <Switch
            id="online-status"
            checked={onlineStatus}
            onCheckedChange={setOnlineStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
