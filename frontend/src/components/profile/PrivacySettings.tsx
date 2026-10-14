import { Shield, Bell, ShieldBan } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PrivacySettings = () => (
  <Card className="border border-border shadow-xs bg-card rounded-xl p-0">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="flex items-center gap-2 text-base font-semibold">
        <Shield className="size-4 text-primary" />
        Quyền riêng tư & Bảo mật
      </CardTitle>
      <CardDescription className="text-xs text-muted-foreground">
        Quản lý thiết lập quyền riêng tư và an toàn tài khoản
      </CardDescription>
    </CardHeader>

    <CardContent className="p-5 pt-0 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Đổi mật khẩu</p>
              <p className="text-xs text-muted-foreground">Cập nhật mật khẩu đăng nhập định kỳ</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Sắp ra mắt
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <Bell className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Cài đặt thông báo</p>
              <p className="text-xs text-muted-foreground">Âm thanh và thông báo đẩy khi có tin nhắn mới</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Sắp ra mắt
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <ShieldBan className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Chặn & Báo cáo</p>
              <p className="text-xs text-muted-foreground">Quản lý danh sách người dùng bị hạn chế</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Sắp ra mắt
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <h4 className="text-xs font-semibold mb-2 text-destructive uppercase tracking-wider">
          Khu vực nguy hiểm
        </h4>
        <Button
          variant="destructiveOutline"
          className="w-full text-xs"
          disabled
        >
          Xoá tài khoản (Liên hệ Quản trị viên)
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default PrivacySettings;
