
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Popular emojis for avatars
const emojiOptions = [
  "😊", "😎", "🤓", "🧠", "👨‍🎓", "👩‍🎓", "🦊", "🐱", "🐶", "🐼", 
  "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐙", "🐬", "🦄", "🦋",
  "🌟", "🌈", "🍎", "🍕", "🚀", "🎮", "🎯", "🎨", "🎭", "🎧"
];

interface EmojiAvatarSelectorProps {
  currentEmoji: string;
  userId: string;
  onEmojiChange?: (emoji: string) => void;
  size?: "sm" | "md" | "lg";
  showPopover?: boolean;
}

const EmojiAvatarSelector = ({ 
  currentEmoji, 
  userId, 
  onEmojiChange,
  size = "md",
  showPopover = true 
}: EmojiAvatarSelectorProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || "😊");
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-14 w-14 text-xl"
  };

  const handleEmojiSelect = async (emoji: string) => {
    setSelectedEmoji(emoji);
    setIsOpen(false);
    
    if (userId) {
      try {
        // Need to use any type since we don't have avatar_emoji in our type definitions yet
        const { error } = await supabase
          .from("users")
          .update({ 
            // Don't specify type to allow any field to be updated
            avatar_emoji: emoji 
          } as any)
          .eq("id", userId);
          
        if (error) {
          console.error("Error updating avatar:", error);
          toast.error("Не удалось обновить аватар");
          return;
        }
        
        toast.success("Аватар обновлен");
        if (onEmojiChange) {
          onEmojiChange(emoji);
        }
      } catch (error) {
        console.error("Error in handleEmojiSelect:", error);
      }
    }
  };

  const avatarContent = (
    <Avatar className={cn("bg-primary/10", sizeClasses[size])}>
      <AvatarFallback className="text-foreground">
        {selectedEmoji}
      </AvatarFallback>
    </Avatar>
  );

  if (!showPopover) {
    return avatarContent;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="p-0 h-auto rounded-full focus-visible:ring-offset-0 focus-visible:ring-1" 
          aria-label="Изменить аватар"
        >
          {avatarContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <p className="text-sm text-center font-medium pb-1 border-b">
            Выберите эмодзи для аватара
          </p>
          <div className="grid grid-cols-6 gap-1">
            {emojiOptions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                className="h-9 w-9 p-0"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiAvatarSelector;
