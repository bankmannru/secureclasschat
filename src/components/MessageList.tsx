
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageActions from "./MessageActions";

type Message = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, refreshTrigger]);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMessageUpdated = () => {
    // Increment trigger to force a re-render and scroll adjustment
    setRefreshTrigger(prev => prev + 1);
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
              <AvatarImage src={message.user.avatar} alt={message.user.name} />
              <AvatarFallback className="text-xs font-medium">
                {message.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{message.user.name}</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(message.timestamp)}
                </span>
                <MessageActions 
                  messageId={message.id}
                  content={message.content}
                  isAdmin={isAdmin}
                  onMessageUpdated={handleMessageUpdated}
                />
              </div>
              
              {message.content && (
                <p className="text-sm mt-1 break-words">{message.content}</p>
              )}
              
              {message.media_url && message.media_type === "image" && (
                <div className="mt-2 max-w-xs">
                  <img 
                    src={message.media_url} 
                    alt="Message attachment" 
                    className="rounded-lg max-h-60 object-contain bg-accent" 
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
