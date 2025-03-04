
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatRoom from "@/components/ChatRoom";

// Mock data mapping channel IDs to names
const channelNames: Record<string, string> = {
  "announcements": "📢 Announcements",
  "general": "💬 General",
  "questions": "❓ Questions",
  "homework": "📚 Homework",
  "exams": "📝 Exams",
  "resources": "📌 Resources",
  "group-a": "👥 Group A",
  "group-b": "👥 Group B",
};

// Mock data mapping class IDs to names
const classNames: Record<string, string> = {
  "math101": "Mathematics 101",
  "physics205": "Physics 205",
  "chemistry110": "Chemistry 110",
  "biology180": "Biology 180",
};

const Dashboard = () => {
  const [activeClass, setActiveClass] = useState("math101");
  const [activeChannel, setActiveChannel] = useState("general");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

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
