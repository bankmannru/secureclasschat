
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatRoomProps {
  channelId: string;
  channelName: string;
  isUserMuted?: boolean;
  mutedUntil?: Date | null;
  muteReason?: string;
}

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

const ChatRoom = ({ 
  channelId, 
  channelName, 
  isUserMuted = false, 
  mutedUntil = null, 
  muteReason = "" 
}: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Load messages from Supabase when channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const classId = localStorage.getItem("activeClass") || "4m";
        
        // Fetch messages for the selected channel
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            media_url,
            media_type,
            users:user_id(id, user_name, avatar_emoji)
          `)
          .eq("channel_id", channelId)
          .eq("class_id", classId)
          .order("created_at");
          
        if (error) throw error;
        
        // Transform data for the MessageList component
        const formattedMessages: Message[] = (data || []).map((msg) => ({
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          user: {
            id: msg.users?.id || "unknown",
            name: msg.users?.user_name || "Unknown User",
            avatar: msg.users?.avatar_emoji || "👤"
          },
          media_url: msg.media_url,
          media_type: msg.media_type
        }));
        
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up a realtime subscription for new messages
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // When a new message is inserted, fetch the user details
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, user_name, avatar_emoji")
              .eq("id", payload.new.user_id)
              .single();
              
            if (userError) throw userError;
            
            const newMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              timestamp: new Date(payload.new.created_at),
              user: {
                id: userData?.id || "unknown",
                name: userData?.user_name || "Unknown User",
                avatar: userData?.avatar_emoji || "👤"
              },
              media_url: payload.new.media_url,
              media_type: payload.new.media_type
            };
            
            setMessages((currentMessages) => [...currentMessages, newMessage]);
          } catch (err) {
            console.error("Error processing realtime message:", err);
          }
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (isUserMuted && !isAdmin) return;
    
    try {
      const userId = localStorage.getItem("userId");
      const classId = localStorage.getItem("activeClass") || "4m";
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Insert message into Supabase
      const { error } = await supabase
        .from("messages")
        .insert({
          content,
          user_id: userId,
          channel_id: channelId,
          class_id: classId,
          media_url: mediaUrl,
          media_type: mediaType
        });
        
      if (error) throw error;
      
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Channel header */}
      <div className="border-b p-4 shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="font-medium text-lg">{channelName}</h2>
      </div>
      
      {/* Error alert */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Muted user warning */}
      {isUserMuted && !isAdmin && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Вы временно заблокированы</AlertTitle>
            <AlertDescription>
              <p className="mt-1">{muteReason || "Нарушение правил чата."}</p>
              {mutedUntil && (
                <p className="mt-1 font-medium">
                  Блокировка истекает: {mutedUntil.toLocaleString()}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Загрузка сообщений...</p>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      
      {/* Message input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={isUserMuted && !isAdmin} 
      />
    </div>
  );
};

export default ChatRoom;
