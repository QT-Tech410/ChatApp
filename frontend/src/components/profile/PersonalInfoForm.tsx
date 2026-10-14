import { User as UserIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types/user";

type EditableField = {
  key: keyof Pick<User, "displayName" | "username" | "email" | "phone">;
  label: string;
  type?: string;
};

const PERSONAL_FIELDS: EditableField[] = [
  { key: "displayName", label: "Tên hiển thị" },
  { key: "username", label: "Tên người dùng" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Số điện thoại" },
];

type Props = {
  userInfo: User | null;
};

const PersonalInfoForm = ({ userInfo }: Props) => {
  if (!userInfo) return null;

  return (
    <Card className="border border-border shadow-xs bg-card rounded-xl p-0">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <UserIcon className="size-4 text-primary" />
          Thông tin chi tiết
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Xem thông tin cá nhân và tài khoản của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PERSONAL_FIELDS.map(({ key, label, type }) => (
            <div
              key={key}
              className="space-y-1.5"
            >
              <Label htmlFor={key} className="text-xs font-medium text-foreground">
                {label}
              </Label>
              <Input
                id={key}
                type={type ?? "text"}
                value={userInfo[key] ?? ""}
                readOnly
                className="bg-muted/40 border-border text-foreground text-xs cursor-default"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-xs font-medium text-foreground">
            Tiểu sử
          </Label>
          <Textarea
            id="bio"
            rows={2}
            value={userInfo.bio ?? "Chưa cập nhật tiểu sử."}
            readOnly
            className="bg-muted/40 border-border text-foreground text-xs resize-none cursor-default"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
