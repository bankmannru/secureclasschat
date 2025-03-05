
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";
import MediaUploader from "./MediaUploader";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  classId: string;
  channelId: string;
  userId?: string;
  isMuted?: boolean;
}

const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  classId,
  channelId,
  userId = "",
  isMuted = false
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isMuted && !isUploading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isMuted) {
    return (
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="text-sm text-center text-muted-foreground py-2 border rounded-md bg-muted/30">
          Вы не можете отправлять сообщения. Ваша учетная запись временно заблокирована.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        {/* Media uploader */}
        {userId && !disabled && (
          <div className="flex justify-start">
            <MediaUploader
              classId={classId}
              channelId={channelId}
              userId={userId}
              onUploadStart={() => setIsUploading(true)}
              onUploadComplete={() => setIsUploading(false)}
              onUploadError={() => setIsUploading(false)}
            />
          </div>
        )}
        
        {/* Text input */}
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            className="min-h-[3rem] max-h-[12rem] flex-1 resize-none"
            disabled={disabled || isUploading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || disabled || isUploading}
            className="h-10 w-10 shrink-0"
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
