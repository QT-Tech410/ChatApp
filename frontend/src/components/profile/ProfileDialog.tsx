import type { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import PersonalInfoForm from "./PersonalInfoForm";
import PreferencesForm from "./PreferencesForm";
import PrivacySettings from "./PrivacySettings";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border shadow-lg rounded-2xl beautiful-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            Tài khoản & Thiết lập
          </DialogTitle>
        </DialogHeader>

        <ProfileCard user={user} />

        <Tabs
          defaultValue="personal"
          className="my-3"
        >
          <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger
              value="personal"
              className="rounded-lg text-xs font-medium"
            >
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-lg text-xs font-medium"
            >
              Giao diện
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-lg text-xs font-medium"
            >
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <PersonalInfoForm userInfo={user} />
          </TabsContent>

          <TabsContent value="preferences" className="mt-4">
            <PreferencesForm />
          </TabsContent>

          <TabsContent value="privacy" className="mt-4">
            <PrivacySettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
