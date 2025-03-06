
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface MessageInputProps {
  onSendMessage: (content: string, mediaUrl?: string, mediaType?: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || imageUrl) && !disabled) {
      onSendMessage(message, imageUrl || undefined, imageUrl ? "image" : undefined);
      setMessage("");
      setImageUrl(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background/80 backdrop-blur-sm">
      {imageUrl && (
        <div className="mb-2 flex items-center">
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="h-16 w-16 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => setImageUrl(null)}
          >
            Удалить
          </Button>
        </div>
      )}
      <div className="flex items-end gap-3">
        <ImageUpload onImageUploaded={handleImageUploaded} />
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Вы не можете отправлять сообщения" : "Напишите сообщение..."}
          className="min-h-[3rem] max-h-[12rem] flex-1 resize-none rounded-3xl"
          disabled={disabled}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={((!message.trim() && !imageUrl) || disabled)}
          className="h-10 w-10 shrink-0 rounded-full"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
