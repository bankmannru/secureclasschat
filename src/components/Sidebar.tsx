import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmojiAvatarSelector from "./EmojiAvatarSelector";

const Sidebar = ({ 
  activeClass,
  activeChannel,
  onSelectClass,
  onSelectChannel,
}: {
  activeClass: string;
  activeChannel: string;
  onSelectClass: (classId: string) => void;
  onSelectChannel: (channelId: string) => void;
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState<string>("👤");
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("avatar_emoji")
            .eq("id", userId)
            .single();
            
          if (!error && data) {
            setAvatarEmoji(data.avatar_emoji || "👤");
          }
        } catch (error) {
          console.error("Error fetching user avatar:", error);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/");
    toast({
      title: "Вы вышли из системы",
      description: "До встречи!",
    });
  };

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <LayoutDashboard className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-64 border-r pr-0">
        <SheetHeader className="pl-5 pt-5">
          <SheetTitle>Меню</SheetTitle>
          <SheetDescription>
            Управляйте своей учетной записью и настройками.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] pl-5">
          <div className="mb-4 mt-6">
            <div className="space-y-2 font-medium">
              <h4 className="font-bold">Классы</h4>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectClass("4m")}
              >
                <Home className="h-4 w-4 mr-2" />
                Класс 4М
              </Button>
            </div>
          </div>
          <Separator />
          <div className="mb-4 mt-6">
            <div className="space-y-2 font-medium">
              <h4 className="font-bold">Каналы</h4>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("general")}
              >
                <Users className="h-4 w-4 mr-2" />
                Общий чат
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("announcements")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Объявления
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("questions")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Вопросы
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("homework")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Домашняя работа
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("exams")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Экзамены
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("resources")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Материалы
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("group-a")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Группа A
              </Button>
              <Button
                variant="ghost"
                className="h-auto py-1.5 px-2 justify-start text-sm hover:bg-secondary/50"
                onClick={() => onSelectChannel("group-b")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Группа B
              </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="p-5 pt-0 flex flex-col gap-2">
          <Separator />
          <div className="flex items-center justify-between rounded-md p-2">
            <div className="flex items-center space-x-2">
              <EmojiAvatarSelector currentEmoji={avatarEmoji} />
              <div>
                <p className="text-sm font-medium leading-none">
                  {localStorage.getItem("userName")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {localStorage.getItem("userEmail")}
                </p>
              </div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
