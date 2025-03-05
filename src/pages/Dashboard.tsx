
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatRoom from "@/components/ChatRoom";
import AdminPanel from "@/components/AdminPanel";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [classBlocked, setClassBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockEndTime, setBlockEndTime] = useState<Date | null>(null);
  const [isUserMuted, setIsUserMuted] = useState(false);
  const [mutedUntil, setMutedUntil] = useState<Date | null>(null);
  const [muteReason, setMuteReason] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const storedUserName = localStorage.getItem("userName");
    
    if (!isAuthenticated || !storedUserName) {
      navigate("/");
    } else {
      setUserName(storedUserName);
      
      // Check admin status
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
      
      // Check if class is blocked
      const isClassBlocked = localStorage.getItem("classBlocked") === "true";
      if (isClassBlocked && !adminStatus) {
        const endTimeStr = localStorage.getItem("blockEndTime");
        const reason = localStorage.getItem("blockReason") || "Технические работы";
        
        if (endTimeStr) {
          const endTime = new Date(endTimeStr);
          
          // If the block has expired, remove it
          if (endTime < new Date()) {
            localStorage.removeItem("classBlocked");
            localStorage.removeItem("blockEndTime");
            localStorage.removeItem("blockReason");
          } else {
            setClassBlocked(true);
            setBlockEndTime(endTime);
            setBlockReason(reason);
          }
        }
      }
      
      // Check if user is muted
      const userId = localStorage.getItem("userId");
      if (userId && !adminStatus) {
        const mutedUsersStr = localStorage.getItem("mutedUsers");
        if (mutedUsersStr) {
          try {
            const mutedUsers = JSON.parse(mutedUsersStr);
            const currentUserMute = mutedUsers.find((u: any) => u.userId === userId);
            
            if (currentUserMute) {
              const muteEndTime = new Date(currentUserMute.mutedUntil);
              
              // If the mute has expired, remove it
              if (muteEndTime < new Date()) {
                const updatedMutedUsers = mutedUsers.filter((u: any) => u.userId !== userId);
                localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
              } else {
                setIsUserMuted(true);
                setMutedUntil(muteEndTime);
                setMuteReason(currentUserMute.reason || "");
              }
            }
          } catch (error) {
            console.error("Error parsing muted users:", error);
          }
        }
      }
    }
  }, [navigate]);

  // Update localStorage when active class changes
  useEffect(() => {
    localStorage.setItem("activeClass", activeClass);
  }, [activeClass]);

  // Check for custom channels in localStorage
  useEffect(() => {
    const storedChannelGroups = localStorage.getItem("channelGroups");
    if (storedChannelGroups) {
      try {
        const parsedGroups = JSON.parse(storedChannelGroups);
        // Update channelNames with custom channels
        parsedGroups.forEach((group: any) => {
          group.channels.forEach((channel: any) => {
            if (!channelNames[channel.id]) {
              // Add emoji based on group
              let emoji = "💬";
              if (group.id === "topics") emoji = "📌";
              if (group.id === "groups") emoji = "👥";
              
              channelNames[channel.id] = `${emoji} ${channel.name}`;
            }
          });
        });
      } catch (error) {
        console.error("Error parsing stored channel groups:", error);
      }
    }
  }, []);

  if (classBlocked && !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Доступ временно заблокирован</AlertTitle>
          <AlertDescription>
            <p className="mt-2">{blockReason}</p>
            {blockEndTime && (
              <p className="mt-2 font-medium">
                Доступ будет восстановлен: {blockEndTime.toLocaleString()}
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Toggle admin panel view
  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeClass={activeClass}
          activeChannel={activeChannel}
          onSelectClass={setActiveClass}
          onSelectChannel={setActiveChannel}
          isAdmin={isAdmin}
          onToggleAdminPanel={toggleAdminPanel}
        />
        <div className="flex-1 flex flex-col bg-background">
          {showAdminPanel && isAdmin ? (
            <AdminPanel />
          ) : (
            <ChatRoom
              channelId={activeChannel}
              channelName={`${classNames[activeClass]} • ${channelNames[activeChannel]}`}
              isUserMuted={isUserMuted}
              mutedUntil={mutedUntil}
              muteReason={muteReason}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
