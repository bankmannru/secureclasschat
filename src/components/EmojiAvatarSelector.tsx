
import { useState, useEffect } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMOJI_OPTIONS = [
  "👤", "😀", "😎", "🤠", "👻", "🤖", "🐱", "🐶", "🦊", "🐼", 
  "🐨", "🦁", "🐯", "🦄", "🐙", "🦋", "🌟", "🔥", "💫", "🌈"
];

interface EmojiAvatarSelectorProps {
  currentEmoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const EmojiAvatarSelector = ({ 
  currentEmoji = "👤", 
  size = "md", 
  className = "" 
}: EmojiAvatarSelectorProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji);
  const [isOpen, setIsOpen] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (currentEmoji) {
      setSelectedEmoji(currentEmoji);
    }
  }, [currentEmoji]);

  const handleEmojiSelect = async (emoji: string) => {
    if (!userId) {
      toast.error("Вы не авторизованы");
      return;
    }

    setSelectedEmoji(emoji);
    setIsOpen(false);

    try {
      const { error } = await supabase
        .from("users")
        .update({ avatar_emoji: emoji })
        .eq("id", userId);

      if (error) {
        console.error("Error updating avatar:", error);
        toast.error("Не удалось обновить аватар");
        return;
      }

      toast.success("Аватар обновлен");
    } catch (error) {
      console.error("Error in handleEmojiSelect:", error);
      toast.error("Произошла ошибка при обновлении аватара");
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className={`p-0 h-auto rounded-full hover:bg-muted ${className}`}
        >
          <Avatar className={sizeClasses[size]}>
            <AvatarFallback className="bg-transparent">
              {selectedEmoji}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="text-sm mb-2 text-muted-foreground">Выберите аватар:</div>
        <div className="grid grid-cols-5 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => handleEmojiSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiAvatarSelector;
