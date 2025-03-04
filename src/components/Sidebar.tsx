
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, ChevronLeft, ChevronRight, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChannelList from "./ChannelList";
import { cn } from "@/lib/utils";

// Mock class data - in a real app, this would come from Supabase
const classes = [
  {
    id: "math101",
    name: "Mathematics 101",
    iconColor: "bg-blue-500",
  },
  {
    id: "physics205",
    name: "Physics 205",
    iconColor: "bg-green-500",
  },
  {
    id: "chemistry110",
    name: "Chemistry 110",
    iconColor: "bg-purple-500",
  },
  {
    id: "biology180",
    name: "Biology 180",
    iconColor: "bg-pink-500",
  },
];

// Mock channel data - in a real app, this would come from Supabase
const channelGroups = [
  {
    id: "general",
    name: "General",
    channels: [
      { id: "announcements", name: "Announcements", isPrivate: true },
      { id: "general", name: "General", isPrivate: false, unreadCount: 3 },
      { id: "questions", name: "Questions", isPrivate: false },
    ],
  },
  {
    id: "topics",
    name: "Topics",
    channels: [
      { id: "homework", name: "Homework", isPrivate: false },
      { id: "exams", name: "Exams", isPrivate: false },
      { id: "resources", name: "Resources", isPrivate: false },
    ],
  },
  {
    id: "groups",
    name: "Study Groups",
    channels: [
      { id: "group-a", name: "Group A", isPrivate: true },
      { id: "group-b", name: "Group B", isPrivate: true },
    ],
  },
];

interface SidebarProps {
  activeClass: string;
  activeChannel: string;
  onSelectClass: (classId: string) => void;
  onSelectChannel: (channelId: string) => void;
}

const Sidebar = ({ activeClass, activeChannel, onSelectClass, onSelectChannel }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r h-full transition-all duration-300 bg-sidebar",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Sidebar header with class name */}
      <div className="h-14 border-b flex items-center px-4 gap-3 shrink-0">
        <Book className="h-5 w-5 text-primary" />
        {!isCollapsed && (
          <h2 className="font-medium truncate text-sm">Secure Class Chat</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Class selector */}
      <div className="p-2 border-b">
        <div className="flex flex-wrap gap-2">
          {classes.map((classItem) => (
            <TooltipProvider key={classItem.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full relative",
                      activeClass === classItem.id && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => onSelectClass(classItem.id)}
                  >
                    <div className={cn("h-full w-full rounded-full flex items-center justify-center", classItem.iconColor)}>
                      <span className="text-white font-medium text-sm">
                        {classItem.name.substring(0, 1)}
                      </span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{classItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Channel list */}
      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <ChannelList
            groups={channelGroups}
            activeChannelId={activeChannel}
            onSelectChannel={onSelectChannel}
          />
        </ScrollArea>
      )}

      {/* User section */}
      <div className="p-2 border-t mt-auto flex items-center">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!isCollapsed && (
          <div className="ml-2 mr-auto">
            <div className="text-sm font-medium">John Doe</div>
            <div className="text-xs text-muted-foreground">Student</div>
          </div>
        )}
        
        {!isCollapsed && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Members</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
