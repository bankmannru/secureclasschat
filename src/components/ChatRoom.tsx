
import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import AdminPanel from "./AdminPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatRoomProps {
  channelId: string;
  channelName: string;
}

const ChatRoom = ({ channelId, channelName }: ChatRoomProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isClassBlocked, setIsClassBlocked] = useState(false);
  
  const classId = localStorage.getItem("activeClass") || "4m";
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // Check if class is blocked
  useEffect(() => {
    if (!classId) return;
    
    const checkClassStatus = async () => {
      try {
        // Check if class is blocked
        const { data: isBlockedData, error: isBlockedError } = await supabase
          .rpc('is_class_blocked', { class_id: classId });
          
        if (isBlockedError) {
          console.error("Error checking class status:", isBlockedError);
          return;
        }
        
        setIsClassBlocked(isBlockedData || false);
        
        if (isBlockedData) {
          toast.error("Этот класс заблокирован администратором");
        }
        
        // Check if user is muted
        if (userId) {
          const { data: isMutedData, error: isMutedError } = await supabase
            .rpc('is_muted', { user_id: userId, class_id: classId });
            
          if (isMutedError) {
            console.error("Error checking mute status:", isMutedError);
            return;
          }
          
          setIsMuted(isMutedData || false);
          
          if (isMutedData) {
            toast.error("Вы не можете отправлять сообщения. Ваша учетная запись временно заблокирована.");
          }
        }
      } catch (error) {
        console.error("Error in checkClassStatus:", error);
      }
    };
    
    checkClassStatus();
  }, [classId, userId]);

  // Fetch channels from database
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")
          .select("*")
          .eq("class_id", classId);
          
        if (error) {
          console.error("Error fetching channels:", error);
          return;
        }
        
        setChannels(data || []);
      } catch (error) {
        console.error("Error in fetchChannels:", error);
      }
    };
    
    fetchChannels();
  }, [classId]);

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
            media_url,
            media_type,
            users (
              id,
              user_name,
              avatar_emoji
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
            emoji: message.users.avatar_emoji,
          },
          content: message.content,
          timestamp: new Date(message.created_at),
          media_url: message.media_url,
          media_type: message.media_type,
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
            .select("user_name, avatar_emoji")
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
              emoji: data.avatar_emoji,
            },
            content: payload.new.content,
            timestamp: new Date(payload.new.created_at),
            media_url: payload.new.media_url,
            media_type: payload.new.media_type,
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
    
    // Check if user is muted
    if (isMuted) {
      toast.error("Вы не можете отправлять сообщения");
      return;
    }
    
    // Check if class is blocked
    if (isClassBlocked) {
      toast.error("Этот класс заблокирован");
      return;
    }

    try {
      // Create a temporary message with a generated ID for immediate display
      const tempId = crypto.randomUUID();
      const newMessage = {
        id: tempId,
        user: {
          id: userId,
          name: userName,
          emoji: localStorage.getItem("userEmoji") || "😊",
        },
        content,
        timestamp: new Date(),
      };
      
      // Add the message to the UI immediately
      setMessages((currentMessages) => [...currentMessages, newMessage]);
      
      // Insert the message into Supabase
      const { error, data } = await supabase
        .from("messages")
        .insert([
          {
            user_id: userId,
            class_id: classId,
            channel_id: channelId,
            content,
          }
        ])
        .select();

      if (error) {
        toast.error("Не удалось отправить сообщение");
        console.error("Error sending message:", error);
        
        // Remove the temporary message if there was an error
        setMessages((currentMessages) => 
          currentMessages.filter(msg => msg.id !== tempId)
        );
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    }
  };

  const blockContent = (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h3 className="text-xl font-semibold">Класс заблокирован</h3>
        <p className="text-muted-foreground">
          Этот класс был заблокирован администратором. Пожалуйста, обратитесь к администратору для получения дополнительной информации.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="border-b py-3 px-4 bg-background/90 backdrop-blur-sm">
        <h2 className="font-medium text-sm">{channelName}</h2>
      </div>
      
      {isClassBlocked ? (
        blockContent
      ) : (
        <>
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
          
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading} 
            classId={classId}
            channelId={channelId}
            userId={userId}
            isMuted={isMuted}
          />
          
          <AdminPanel 
            classId={classId} 
            onChannelCreated={() => {
              // Refresh channels when a new one is created
              window.location.reload();
            }} 
          />
        </>
      )}
    </div>
  );
};

export default ChatRoom;
