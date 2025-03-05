
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MessageMediaProps {
  url: string;
  type: string;
  className?: string;
}

const MessageMedia = ({ url, type, className }: MessageMediaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');
  
  const handleMediaClick = () => {
    setIsOpen(true);
  };
  
  // Only render for supported media types
  if (!isImage && !isVideo) {
    return null;
  }
  
  return (
    <>
      {/* Thumbnail/preview */}
      <div 
        className={cn(
          "cursor-pointer rounded-md overflow-hidden border", 
          className
        )}
        onClick={handleMediaClick}
      >
        {isImage ? (
          <img 
            src={url} 
            alt="Прикрепленное изображение" 
            className="max-h-60 max-w-full object-cover"
          />
        ) : (
          <video 
            src={url}
            className="max-h-60 max-w-full object-cover"
            controls={false}
          />
        )}
      </div>
      
      {/* Full view dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl flex items-center justify-center p-2 sm:p-6">
          {isImage ? (
            <img 
              src={url} 
              alt="Прикрепленное изображение"
              className="max-h-[80vh] max-w-full object-contain rounded"
            />
          ) : (
            <video 
              src={url}
              className="max-h-[80vh] max-w-full object-contain rounded"
              controls
              autoPlay
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageMedia;
