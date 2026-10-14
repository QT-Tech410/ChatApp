import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import type { User } from "@/types/user";
import { useFriendStore } from "@/stores/useFriendStore";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SearchForm from "@/components/AddFriendModal/SearchForm";
import SendFriendRequestForm from "@/components/AddFriendModal/SendFriendRequestForm";

export interface IFormValues {
  username: string;
  message: string;
}

const AddFriendModal = () => {
  const [open, setOpen] = useState(false);
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [searchUser, setSearchUser] = useState<User>();
  const [searchedUsername, setSearchedUsername] = useState("");
  const { loading, searchByUsername, addFriend } = useFriendStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: { username: "", message: "" },
  });

  const usernameValue = watch("username");

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;

    setIsFound(null);
    setSearchedUsername(username);

    try {
      const foundUser = await searchByUsername(username);
      if (foundUser) {
        setIsFound(true);
        setSearchUser(foundUser);
      } else {
        setIsFound(false);
      }
    } catch (error) {
      console.error(error);
      setIsFound(false);
    }
  });

  const handleSend = handleSubmit(async (data) => {
    if (!searchUser) return;

    try {
      const message = await addFriend(searchUser._id, data.message.trim());
      toast.success(message || "Đã gửi lời mời kết bạn thành công");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Gửi lời mời kết bạn thất bại");
    }
  });

  const handleClose = () => {
    setOpen(false);
    reset();
    setSearchedUsername("");
    setIsFound(null);
    setSearchUser(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          title="Thêm bạn mới"
          aria-label="Thêm bạn mới"
        >
          <UserPlus className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            Kết bạn mới
          </DialogTitle>
        </DialogHeader>

        {!isFound && (
          <SearchForm
            register={register}
            errors={errors}
            usernameValue={usernameValue}
            loading={loading}
            isFound={isFound}
            searchedUsername={searchedUsername}
            onSubmit={handleSearch}
            onCancel={handleClose}
          />
        )}

        {isFound && (
          <SendFriendRequestForm
            register={register}
            loading={loading}
            searchedUsername={searchedUsername}
            onSubmit={handleSend}
            onBack={() => setIsFound(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
