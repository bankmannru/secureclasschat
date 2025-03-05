
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, ChevronLeft, ChevronRight, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChannelList from "./ChannelList";
import EmojiAvatarSelector from "./EmojiAvatarSelector";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Updated class data to only include 4M
const classes = [
  {
    id: "4m",
    name: "Класс 4М",
    iconColor: "bg-blue-500",
  }
];

interface SidebarProps {
  activeClass: string;
  activeChannel: string;
  onSelectClass: (classId: string) => void;
  onSelectChannel: (channelId: string) => void;
}

const Sidebar = ({ activeClass, activeChannel, onSelectClass, onSelectChannel }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [channelGroups, setChannelGroups] = useState<any[]>([]);
  const [userEmoji, setUserEmoji] = useState(localStorage.getItem("userEmoji") || "😊");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem("userId");
  
  // Check if user is admin
  useEffect(() => {
    if (!userId) return;
    
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .rpc('is_admin', { user_id: userId });
          
        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }
        
        setIsAdmin(data || false);
      } catch (error) {
        console.error("Error in checkAdmin:", error);
      }
    };
    
    checkAdmin();
  }, [userId]);

  // Load the active class from localStorage when component mounts
  useEffect(() => {
    const storedActiveClass = localStorage.getItem("activeClass");
    if (storedActiveClass && classes.some(c => c.id === storedActiveClass)) {
      onSelectClass(storedActiveClass);
    }
  }, [onSelectClass]);
  
  // Save userEmoji to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("userEmoji", userEmoji);
  }, [userEmoji]);
  
  // Fetch channels from database
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")
          .select("*")
          .eq("class_id", activeClass);
          
        if (error) {
          console.error("Error fetching channels:", error);
          return;
        }
        
        // Group channels
        const general = [];
        const topics = [];
        const groups = [];
        
        for (const channel of data) {
          const channelItem = {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.is_private
          };
          
          if (["announcements", "general", "questions"].includes(channel.id)) {
            general.push(channelItem);
          } else if (["homework", "exams", "resources"].includes(channel.id)) {
            topics.push(channelItem);
          } else if (channel.id.startsWith("group-")) {
            groups.push(channelItem);
          } else {
            general.push(channelItem);
          }
        }
        
        const newChannelGroups = [
          {
            id: "general",
            name: "Общее",
            channels: general,
          },
          {
            id: "topics",
            name: "Темы",
            channels: topics,
          }
        ];
        
        if (groups.length > 0) {
          newChannelGroups.push({
            id: "groups",
            name: "Группы",
            channels: groups,
          });
        }
        
        setChannelGroups(newChannelGroups);
      } catch (error) {
        console.error("Error in fetchChannels:", error);
      }
    };
    
    fetchChannels();
  }, [activeClass]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("activeClass");
    toast.success("Выход выполнен успешно");
    navigate("/");
  };
  
  const handleEmojiChange = (emoji: string) => {
    setUserEmoji(emoji);
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
          <>
            <div className="ml-2 flex items-center gap-2">
              <EmojiAvatarSelector 
                currentEmoji={userEmoji}
                userId={userId || ""}
                onEmojiChange={handleEmojiChange}
                size="sm"
              />
              <div>
                <div className="text-sm font-medium">
                  {isAdmin ? "Администратор" : "Ученик"}
                </div>
                <div className="text-xs text-muted-foreground">Класс 4М</div>
              </div>
            </div>
          </>
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
