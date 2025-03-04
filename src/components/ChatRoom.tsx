
import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// Mock user data - in a real app, this would come from auth state
const currentUser = {
  id: "1",
  name: "John Doe",
  avatar: "",
};

// Mock initial messages - in a real app, these would come from Supabase
const initialMessages = [
  {
    id: "1",
    user: { id: "2", name: "Sarah Chen", avatar: "" },
    content: "Hey everyone! Has anyone started on the project for Professor Wilson's class?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    user: { id: "3", name: "Michael Rodriguez", avatar: "" },
    content: "I've just started gathering some research materials. It seems challenging!",
    timestamp: new Date(Date.now() - 2400000),
  },
  {
    id: "3",
    user: { id: "4", name: "Emma Johnson", avatar: "" },
    content: "I'm planning to start this weekend. Would anyone like to form a study group?",
    timestamp: new Date(Date.now() - 1800000),
  },
];

interface ChatRoomProps {
  channelId: string;
  channelName: string;
}

const ChatRoom = ({ channelId, channelName }: ChatRoomProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch messages from Supabase based on the channelId
    setIsLoading(true);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [channelId]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);

    // In a real app, this would send the message to Supabase
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b py-3 px-4 bg-background/90 backdrop-blur-sm">
        <h2 className="font-medium text-sm">{channelName}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatRoom;
