
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatRoom from "@/components/ChatRoom";
import { supabase } from "@/integrations/supabase/client";

// Mock data mapping channel IDs to names
const channelNames: Record<string, string> = {
  "announcements": "📢 Объявления",
  "general": "💬 Общий чат",
  "questions": "❓ Вопросы",
  "homework": "📚 Домашняя работа",
  "exams": "📝 Экзамены",
  "resources": "📌 Материалы",
  "group-a": "👥 Группа А",
  "group-b": "👥 Группа Б",
};

// Mock data mapping class IDs to names
const classNames: Record<string, string> = {
  "4m": "Класс 4М",
};

const Dashboard = () => {
  const [activeClass, setActiveClass] = useState(() => {
    return localStorage.getItem("activeClass") || "4m";
  });
  const [activeChannel, setActiveChannel] = useState("general");
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });
  const [avatarEmoji, setAvatarEmoji] = useState<string>("👤");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const storedUserName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    
    if (!isAuthenticated || !storedUserName) {
      navigate("/");
    } else {
      setUserName(storedUserName);
      
      // Fetch user's avatar emoji
      if (userId) {
        supabase
          .from("users")
          .select("avatar_emoji")
          .eq("id", userId)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setAvatarEmoji(data.avatar_emoji || "👤");
            }
          });
      }
    }
  }, [navigate]);

  // Update localStorage when active class changes
  useEffect(() => {
    localStorage.setItem("activeClass", activeClass);
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
            channelName={`${classNames[activeClass]} • ${channelNames[activeChannel]}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
