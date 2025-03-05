
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, PaperclipIcon, X } from "lucide-react";
import MediaUploader from "./MediaUploader";

interface MessageInputProps {
  onSendMessage: (content: string, mediaUrl?: string, mediaType?: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || mediaUrl) && !disabled && !isUploading) {
      onSendMessage(message, mediaUrl || undefined, mediaType || undefined);
      setMessage("");
      setMediaUrl(null);
      setMediaType(null);
      setShowMediaUploader(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMediaSelect = (url: string, type: string) => {
    setMediaUrl(url);
    setMediaType(type);
    setIsUploading(false);
  };

  const handleCancelMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    setShowMediaUploader(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background/80 backdrop-blur-sm">
      {showMediaUploader && (
        <MediaUploader 
          onMediaSelect={handleMediaSelect}
          onCancelUpload={() => setShowMediaUploader(false)}
          isUploading={isUploading}
        />
      )}
      
      {mediaUrl && (
        <div className="mb-2 p-2 border rounded-md bg-background relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full"
            onClick={handleCancelMedia}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {mediaType?.startsWith("image") ? (
            <img 
              src={mediaUrl} 
              alt="Preview" 
              className="max-h-[100px] mx-auto rounded-md"
            />
          ) : (
            <video 
              src={mediaUrl}
              className="max-h-[100px] w-full mx-auto rounded-md"
              controls
            />
          )}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {!showMediaUploader && !mediaUrl && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0"
            onClick={() => setShowMediaUploader(true)}
            disabled={disabled}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
        )}
        
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
          disabled={(!message.trim() && !mediaUrl) || disabled || isUploading}
          className="h-10 w-10 shrink-0"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
