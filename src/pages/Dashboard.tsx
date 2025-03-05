
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatRoom from "@/components/ChatRoom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [activeClass, setActiveClass] = useState(() => {
    return localStorage.getItem("activeClass") || "4m";
  });
  const [activeChannel, setActiveChannel] = useState("general");
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });
  const [channelNames, setChannelNames] = useState<Record<string, string>>({});
  const [classNames, setClassNames] = useState<Record<string, string>>({
    "4m": "Класс 4М",
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const storedUserName = localStorage.getItem("userName");
    
    if (!isAuthenticated || !storedUserName) {
      navigate("/");
    } else {
      setUserName(storedUserName);
    }
  }, [navigate]);

  // Update localStorage when active class changes
  useEffect(() => {
    localStorage.setItem("activeClass", activeClass);
  }, [activeClass]);
  
  // Fetch channel names from database
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")
          .select("id, name, is_private")
          .eq("class_id", activeClass);
          
        if (error) {
          console.error("Error fetching channels:", error);
          return;
        }
        
        // Create map of channel IDs to names with emojis based on type
        const channelMap: Record<string, string> = {};
        
        data.forEach(channel => {
          let emoji = "";
          
          // Assign emoji based on channel ID or type
          if (channel.id === "announcements") emoji = "📢";
          else if (channel.id === "general") emoji = "💬";
          else if (channel.id === "questions") emoji = "❓";
          else if (channel.id === "homework") emoji = "📚";
          else if (channel.id === "exams") emoji = "📝";
          else if (channel.id === "resources") emoji = "📌";
          else if (channel.id.startsWith("group-")) emoji = "👥";
          else emoji = channel.is_private ? "🔒" : "📄";
          
          channelMap[channel.id] = `${emoji} ${channel.name}`;
        });
        
        setChannelNames(channelMap);
      } catch (error) {
        console.error("Error in fetchChannels:", error);
      }
    };
    
    fetchChannels();
  }, [activeClass]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeClass={activeClass}
          activeChannel={activeChannel}
          onSelectClass={setActiveClass}
          onSelectChannel={setActiveChannel}
        />
        <div className="flex-1 flex flex-col bg-background">
          <ChatRoom
            channelId={activeChannel}
            channelName={`${classNames[activeClass]} • ${channelNames[activeChannel] || activeChannel}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
