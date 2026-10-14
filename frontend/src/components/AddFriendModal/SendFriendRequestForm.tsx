import type { UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

interface SendRequestProps {
  register: UseFormRegister<IFormValues>;
  loading: boolean;
  searchedUsername: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const SendFriendRequestForm = ({
  register,
  loading,
  searchedUsername,
  onSubmit,
  onBack,
}: SendRequestProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          Đã tìm thấy người dùng: <span className="font-semibold">@{searchedUsername}</span>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="message"
            className="text-xs font-semibold text-foreground"
          >
            Lời nhắn kết bạn
          </Label>
          <Textarea
            id="message"
            rows={3}
            placeholder="Xin chào, mình kết bạn nhé!..."
            className="text-sm bg-background border-border resize-none"
            {...register("message")}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Quay lại
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <span>Đang gửi...</span>
            ) : (
              <>
                <UserPlus className="size-4 mr-2" /> Gửi lời mời
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
};

export default SendFriendRequestForm;
