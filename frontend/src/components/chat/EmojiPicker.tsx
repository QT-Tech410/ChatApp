import { useThemeStore } from "@/stores/useThemeStore";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Chọn biểu tượng cảm xúc"
          aria-label="Chọn biểu tượng cảm xúc"
        >
          <Smile className="size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="p-0 border-none bg-transparent shadow-xl mb-2 z-50"
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: { native: string }) => onChange(emoji.native)}
          emojiSize={22}
          previewPosition="none"
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
