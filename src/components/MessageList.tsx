
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    avatarEmoji?: string;
  };
  content: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: string;
};

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMedia = (mediaUrl?: string, mediaType?: string) => {
    if (!mediaUrl) return null;
    
    if (mediaType?.startsWith("image")) {
      return (
        <img 
          src={mediaUrl} 
          alt="Изображение" 
          className="mt-2 max-h-[300px] rounded-md cursor-pointer"
          onClick={() => window.open(mediaUrl, "_blank")}
        />
      );
    } else if (mediaType?.startsWith("video")) {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className="mt-2 max-h-[300px] max-w-full rounded-md"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Нет сообщений. Будьте первым, кто напишет в этот чат!
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3 animate-slide-in group">
            <Avatar className="mt-0.5 w-8 h-8 border">
              {message.user.avatarEmoji ? (
                <AvatarFallback className="bg-transparent text-lg">
                  {message.user.avatarEmoji}
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={message.user.avatar} alt={message.user.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {message.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{message.user.name}</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {message.content && (
                <p className="text-sm mt-1 break-words">{message.content}</p>
              )}
              {renderMedia(message.mediaUrl, message.mediaType)}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
