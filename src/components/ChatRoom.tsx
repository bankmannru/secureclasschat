
import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatRoomProps {
  channelId: string;
  channelName: string;
}

const ChatRoom = ({ channelId, channelName }: ChatRoomProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const classId = localStorage.getItem("activeClass") || "4m";
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      
      try {
        // Get messages for this channel and class
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            users (
              id,
              user_name
            )
          `)
          .eq("class_id", classId)
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }

        // Format messages for the MessageList component
        const formattedMessages = data.map((message) => ({
          id: message.id,
          user: {
            id: message.users.id,
            name: message.users.user_name,
          },
          content: message.content,
          timestamp: new Date(message.created_at),
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, classId]);

  // Subscribe to real-time updates
  useEffect(() => {
    console.log("Setting up realtime subscription for:", classId, channelId);
    
    // Subscribe to new messages in this channel
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `class_id=eq.${classId}&channel_id=eq.${channelId}`
        }, 
        async (payload) => {
          console.log("New message received:", payload);
          
          // When a new message is inserted, fetch the user data
          const { data, error } = await supabase
            .from("users")
            .select("user_name")
            .eq("id", payload.new.user_id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            return;
          }

          // Add the new message to state
          const newMessage = {
            id: payload.new.id,
            user: {
              id: payload.new.user_id,
              name: data.user_name,
            },
            content: payload.new.content,
            timestamp: new Date(payload.new.created_at),
          };
          
          setMessages((currentMessages) => [...currentMessages, newMessage]);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Clean up subscription on unmount
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [channelId, classId]);

  const handleSendMessage = async (content: string) => {
    if (!userId || !userName) {
      toast.error("Пожалуйста, войдите снова");
      return;
    }

    try {
      // Insert the message into Supabase
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            user_id: userId,
            class_id: classId,
            channel_id: channelId,
            content,
          }
        ]);

      if (error) {
        toast.error("Не удалось отправить сообщение");
        console.error("Error sending message:", error);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    }
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
            <p className="text-sm text-muted-foreground">Загрузка сообщений...</p>
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
