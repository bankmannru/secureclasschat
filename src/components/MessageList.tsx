
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageMedia from "./MessageMedia";
import EmojiAvatarSelector from "./EmojiAvatarSelector";

type Message = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    emoji?: string;
  };
  content: string;
  timestamp: Date;
  media_url?: string;
  media_type?: string;
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
              {message.user.emoji ? (
                <AvatarFallback className="text-sm">
                  {message.user.emoji}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="text-xs font-medium">
                  {message.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
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
              
              {message.media_url && message.media_type && (
                <div className="mt-2">
                  <MessageMedia 
                    url={message.media_url} 
                    type={message.media_type}
                  />
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
