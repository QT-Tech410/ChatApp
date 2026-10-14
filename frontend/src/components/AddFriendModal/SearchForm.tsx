import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DialogFooter } from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  register: UseFormRegister<IFormValues>;
  errors: FieldErrors<IFormValues>;
  loading: boolean;
  usernameValue: string;
  isFound: boolean | null;
  searchedUsername: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const SearchForm = ({
  register,
  errors,
  usernameValue,
  loading,
  isFound,
  searchedUsername,
  onSubmit,
  onCancel,
}: SearchFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label
          htmlFor="username"
          className="text-xs font-semibold text-foreground"
        >
          Tìm kiếm theo tên người dùng (@username)
        </Label>

        <Input
          id="username"
          placeholder="Nhập username cần tìm..."
          {...register("username", {
            required: "Tên người dùng không được để trống",
          })}
        />
        {errors.username && (
          <p className="text-destructive text-xs font-medium mt-1">
            {errors.username.message}
          </p>
        )}

        {isFound === false && (
          <p className="text-destructive text-xs font-medium mt-1">
            Không tìm thấy người dùng <span className="font-semibold">@{searchedUsername}</span>
          </p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Hủy
          </Button>
        </DialogClose>

        <Button
          type="submit"
          disabled={loading || !usernameValue?.trim()}
          className="flex-1"
        >
          {loading ? (
            <span>Đang tìm kiếm...</span>
          ) : (
            <>
              <Search className="size-4 mr-2" /> Tìm kiếm
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SearchForm;
