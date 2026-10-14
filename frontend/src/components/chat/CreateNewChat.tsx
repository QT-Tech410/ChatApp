import { useState } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { Dialog } from "../ui/dialog";
import { MessageSquarePlus } from "lucide-react";
import FriendListModal from "../createNewChat/FriendListModal";
import { Button } from "../ui/button";

const CreateNewChat = () => {
  const [open, setOpen] = useState(false);
  const { getFriends } = useFriendStore();

  const handleOpen = async () => {
    setOpen(true);
    await getFriends();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="w-full justify-start gap-2.5 h-10 px-3 border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground shadow-2xs font-normal"
      >
        <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquarePlus className="size-3.5" />
        </div>
        <span className="text-sm font-medium">Bắt đầu hội thoại mới</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <FriendListModal onSelect={() => setOpen(false)} />
      </Dialog>
    </>
  );
};

export default CreateNewChat;
