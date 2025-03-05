import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Lock, 
  Plus, 
  Trash, 
  UserX 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Channel {
  id: string;
  name: string;
  class_id: string;
  is_private: boolean;
  created_by?: string;
  created_at?: string;
}

interface User {
  id: string;
  user_name: string;
  avatar_emoji: string;
  created_at?: string;
}

interface AdminPanelProps {
  classId: string;
  onChannelCreated?: () => void;
}

const AdminPanel = ({ classId, onChannelCreated }: AdminPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    'createChannel' | 'deleteChannel' | 'muteUser' | 'blockClass' | null
  >(null);
  const [channelName, setChannelName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [muteHours, setMuteHours] = useState(1);
  const [blockReason, setBlockReason] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const userId = localStorage.getItem("userId");
  
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
  
  useEffect(() => {
    if (!isOpen || !currentAction) return;
    
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
  }, [isOpen, currentAction, classId]);
  
  useEffect(() => {
    if (!isOpen || currentAction !== 'muteUser') return;
    
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, user_name, avatar_emoji");
          
        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error("Error in fetchUsers:", error);
      }
    };
    
    fetchUsers();
  }, [isOpen, currentAction]);
  
  const handleActionSelect = (action: 'createChannel' | 'deleteChannel' | 'muteUser' | 'blockClass') => {
    setCurrentAction(action);
    setIsOpen(true);
    
    setChannelName("");
    setChannelId("");
    setIsPrivate(false);
    setSelectedUserId("");
    setSelectedChannelId("");
    setMuteHours(1);
    setBlockReason("");
  };
  
  const handleCreateChannel = async () => {
    if (!channelName || !channelId) {
      toast.error("Заполните все поля");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedChannelId = channelId.toLowerCase().replace(/\s+/g, '-');
      
      const { error } = await supabase
        .from("channels")
        .insert({
          id: formattedChannelId,
          name: channelName,
          class_id: classId,
          is_private: isPrivate,
          created_by: userId
        });
        
      if (error) {
        console.error("Error creating channel:", error);
        toast.error("Не удалось создать канал");
        return;
      }
      
      toast.success("Канал создан");
      setIsOpen(false);
      
      if (onChannelCreated) {
        onChannelCreated();
      }
    } catch (error) {
      console.error("Error in handleCreateChannel:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteChannel = async () => {
    if (!selectedChannelId) {
      toast.error("Выберите канал");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", selectedChannelId)
        .eq("class_id", classId);
        
      if (error) {
        console.error("Error deleting channel:", error);
        toast.error("Не удалось удалить канал");
        return;
      }
      
      toast.success("Канал удален");
      setIsOpen(false);
      
      if (onChannelCreated) {
        onChannelCreated();
      }
    } catch (error) {
      console.error("Error in handleDeleteChannel:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMuteUser = async () => {
    if (!selectedUserId || muteHours <= 0) {
      toast.error("Заполните все поля");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const muteUntil = new Date();
      muteUntil.setHours(muteUntil.getHours() + muteHours);
      
      const { error } = await supabase
        .from("muted_users")
        .insert({
          user_id: selectedUserId,
          class_id: classId,
          muted_until: muteUntil.toISOString(),
          muted_by: userId
        });
        
      if (error) {
        console.error("Error muting user:", error);
        toast.error("Не удалось заблокировать пользователя");
        return;
      }
      
      toast.success(`Пользователь заблокирован на ${muteHours} ч.`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error in handleMuteUser:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBlockClass = async () => {
    if (!blockReason) {
      toast.error("Укажите причину блокировки");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("blocked_classes")
        .insert({
          class_id: classId,
          blocked_by: userId,
          reason: blockReason
        });
        
      if (error) {
        console.error("Error blocking class:", error);
        toast.error("Не удалось заблокировать класс");
        return;
      }
      
      toast.success("Класс заблокирован");
      setIsOpen(false);
    } catch (error) {
      console.error("Error in handleBlockClass:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      <div className="flex gap-2 p-2 border-t">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={() => handleActionSelect('createChannel')}
        >
          <Plus className="h-3 w-3" />
          Канал
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={() => handleActionSelect('deleteChannel')}
        >
          <Trash className="h-3 w-3" />
          Канал
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={() => handleActionSelect('muteUser')}
        >
          <UserX className="h-3 w-3" />
          Пользователь
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={() => handleActionSelect('blockClass')}
        >
          <Lock className="h-3 w-3" />
          Класс
        </Button>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {currentAction === 'createChannel' && (
            <>
              <DialogHeader>
                <DialogTitle>Создать новый канал</DialogTitle>
                <DialogDescription>
                  Добавить новый канал для общения в классе
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Название канала</label>
                  <Input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Например: Домашнее задание"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID канала</label>
                  <Input
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="Например: homework"
                  />
                  <p className="text-xs text-muted-foreground">
                    Используется в URL и должен быть уникальным
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <label htmlFor="is-private" className="text-sm">
                    Приватный канал
                  </label>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreateChannel}
                  disabled={isLoading}
                >
                  {isLoading ? "Создание..." : "Создать канал"}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {currentAction === 'deleteChannel' && (
            <>
              <DialogHeader>
                <DialogTitle>Удалить канал</DialogTitle>
                <DialogDescription>
                  <AlertTriangle className="h-4 w-4 text-destructive inline mr-1" />
                  Это действие необратимо и удалит все сообщения в канале
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Выберите канал</label>
                  <Select
                    value={selectedChannelId}
                    onValueChange={setSelectedChannelId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите канал" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteChannel}
                  disabled={isLoading}
                >
                  {isLoading ? "Удаление..." : "Удалить канал"}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {currentAction === 'muteUser' && (
            <>
              <DialogHeader>
                <DialogTitle>Заблокировать пользователя</DialogTitle>
                <DialogDescription>
                  Пользователь не сможет отправлять сообщения на указанное время
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Выберите пользователя</label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите пользователя" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span>{user.avatar_emoji}</span>
                            <span>{user.user_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Длительность (часов)</label>
                  <Input
                    type="number"
                    min="1"
                    max="72"
                    value={muteHours}
                    onChange={(e) => setMuteHours(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleMuteUser}
                  disabled={isLoading}
                >
                  {isLoading ? "Блокировка..." : "Заблокировать"}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {currentAction === 'blockClass' && (
            <>
              <DialogHeader>
                <DialogTitle>Заблокировать класс</DialogTitle>
                <DialogDescription>
                  <AlertTriangle className="h-4 w-4 text-destructive inline mr-1" />
                  Это закроет доступ ко всем каналам класса
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Причина блокировки</label>
                  <Input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Укажите причину блокировки класса"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleBlockClass}
                  disabled={isLoading}
                >
                  {isLoading ? "Блокировка..." : "Заблокировать класс"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
