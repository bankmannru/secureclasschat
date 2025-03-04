
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, ChevronLeft, ChevronRight, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChannelList from "./ChannelList";
import { cn } from "@/lib/utils";

// Updated class data to only include 4M
const classes = [
  {
    id: "4m",
    name: "Класс 4М",
    iconColor: "bg-blue-500",
  }
];

// Mock channel data - in a real app, this would come from Supabase
const channelGroups = [
  {
    id: "general",
    name: "Общее",
    channels: [
      { id: "announcements", name: "Объявления", isPrivate: true },
      { id: "general", name: "Общий чат", isPrivate: false, unreadCount: 3 },
      { id: "questions", name: "Вопросы", isPrivate: false },
    ],
  },
  {
    id: "topics",
    name: "Темы",
    channels: [
      { id: "homework", name: "Домашняя работа", isPrivate: false },
      { id: "exams", name: "Экзамены", isPrivate: false },
      { id: "resources", name: "Материалы", isPrivate: false },
    ],
  },
  {
    id: "groups",
    name: "Группы",
    channels: [
      { id: "group-a", name: "Группа А", isPrivate: true },
      { id: "group-b", name: "Группа Б", isPrivate: true },
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

  // Load the active class from localStorage when component mounts
  useEffect(() => {
    const storedActiveClass = localStorage.getItem("activeClass");
    if (storedActiveClass && classes.some(c => c.id === storedActiveClass)) {
      onSelectClass(storedActiveClass);
    }
  }, [onSelectClass]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("activeClass");
    toast.success("Выход выполнен успешно");
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
          <h2 className="font-medium truncate text-sm">Чат класса</h2>
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
              <p>Выйти</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!isCollapsed && (
          <div className="ml-2 mr-auto">
            <div className="text-sm font-medium">Ученик</div>
            <div className="text-xs text-muted-foreground">Класс 4М</div>
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
                <p>Участники</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
