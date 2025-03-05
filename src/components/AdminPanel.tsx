
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2, UserX, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MutedUser, Channel } from "@/types/admin";

// Mock channel groups data structure
interface ChannelGroup {
  id: string;
  name: string;
  channels: Channel[];
}

const AdminPanel = () => {
  const [channelGroups, setChannelGroups] = useState<ChannelGroup[]>([
    {
      id: "general",
      name: "Общее",
      channels: [
        { id: "announcements", name: "Объявления", isPrivate: true, groupId: "general" },
        { id: "general", name: "Общий чат", isPrivate: false, groupId: "general" },
        { id: "questions", name: "Вопросы", isPrivate: false, groupId: "general" },
      ],
    },
    {
      id: "topics",
      name: "Темы",
      channels: [
        { id: "homework", name: "Домашняя работа", isPrivate: false, groupId: "topics" },
        { id: "exams", name: "Экзамены", isPrivate: false, groupId: "topics" },
        { id: "resources", name: "Материалы", isPrivate: false, groupId: "topics" },
      ],
    },
    {
      id: "groups",
      name: "Группы",
      channels: [
        { id: "group-a", name: "Группа А", isPrivate: true, groupId: "groups" },
        { id: "group-b", name: "Группа Б", isPrivate: true, groupId: "groups" },
      ],
    },
  ]);

  const [users, setUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [classBlocked, setClassBlocked] = useState(false);
  const [blockDuration, setBlockDuration] = useState("1");
  const [blockReason, setBlockReason] = useState("");
  const [blockEndTime, setBlockEndTime] = useState<Date | null>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelGroup, setNewChannelGroup] = useState("general");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [muteDuration, setMuteDuration] = useState("15");
  const [muteReason, setMuteReason] = useState("");
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*");
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Не удалось загрузить список пользователей");
      }
    };
    
    fetchUsers();
  }, []);

  // Handle adding a new channel
  const handleAddChannel = () => {
    if (!newChannelName.trim()) {
      toast.error("Введите название канала");
      return;
    }

    const channelId = newChannelName.toLowerCase().replace(/\s+/g, "-");
    
    // Check if channel already exists
    const channelExists = channelGroups.some(group => 
      group.channels.some(channel => channel.id === channelId)
    );
    
    if (channelExists) {
      toast.error("Канал с таким ID уже существует");
      return;
    }

    // Add the new channel to the selected group
    const updatedGroups = channelGroups.map(group => {
      if (group.id === newChannelGroup) {
        return {
          ...group,
          channels: [
            ...group.channels,
            {
              id: channelId,
              name: newChannelName,
              isPrivate: newChannelPrivate,
              groupId: newChannelGroup
            }
          ]
        };
      }
      return group;
    });

    setChannelGroups(updatedGroups);
    toast.success(`Канал "${newChannelName}" добавлен`);
    
    // Reset form
    setNewChannelName("");
    setNewChannelPrivate(false);
    
    // Save to localStorage for application state
    localStorage.setItem("channelGroups", JSON.stringify(updatedGroups));
  };

  // Handle removing a channel
  const handleRemoveChannel = (channelId: string, groupId: string) => {
    // Don't allow removing default channels
    const defaultChannels = ["announcements", "general"];
    if (defaultChannels.includes(channelId)) {
      toast.error("Невозможно удалить основной канал");
      return;
    }

    const updatedGroups = channelGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          channels: group.channels.filter(channel => channel.id !== channelId)
        };
      }
      return group;
    });

    setChannelGroups(updatedGroups);
    toast.success("Канал удален");
    
    // Save to localStorage for application state
    localStorage.setItem("channelGroups", JSON.stringify(updatedGroups));
  };

  // Handle muting a user
  const handleMuteUser = () => {
    if (!selectedUser) {
      toast.error("Выберите пользователя");
      return;
    }

    const duration = parseInt(muteDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Укажите корректное время");
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    const mutedUntil = new Date();
    mutedUntil.setMinutes(mutedUntil.getMinutes() + duration);

    const newMutedUser: MutedUser = {
      userId: user.id,
      userName: user.user_name,
      mutedUntil,
      reason: muteReason || "Нарушение правил"
    };

    setMutedUsers([...mutedUsers, newMutedUser]);
    toast.success(`Пользователь ${user.user_name} заблокирован на ${duration} минут`);
    
    // Save to localStorage
    localStorage.setItem("mutedUsers", JSON.stringify([...mutedUsers, newMutedUser]));
    
    // Reset form
    setSelectedUser(null);
    setMuteDuration("15");
    setMuteReason("");
  };

  // Handle unmuting a user
  const handleUnmuteUser = (userId: string) => {
    const updatedMutedUsers = mutedUsers.filter(user => user.userId !== userId);
    setMutedUsers(updatedMutedUsers);
    toast.success("Пользователь разблокирован");
    
    // Save to localStorage
    localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
  };

  // Handle blocking the class
  const handleBlockClass = () => {
    const duration = parseInt(blockDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Укажите корректное время");
      return;
    }

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + duration);
    
    setClassBlocked(true);
    setBlockEndTime(endTime);
    
    // Save to localStorage
    localStorage.setItem("classBlocked", "true");
    localStorage.setItem("blockEndTime", endTime.toISOString());
    localStorage.setItem("blockReason", blockReason || "Технические работы");
    
    toast.success(`Класс заблокирован на ${duration} час(ов)`);
  };

  // Handle unblocking the class
  const handleUnblockClass = () => {
    setClassBlocked(false);
    setBlockEndTime(null);
    
    // Update localStorage
    localStorage.removeItem("classBlocked");
    localStorage.removeItem("blockEndTime");
    localStorage.removeItem("blockReason");
    
    toast.success("Класс разблокирован");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Панель администратора</h1>
      
      <Tabs defaultValue="channels">
        <TabsList className="mb-4">
          <TabsTrigger value="channels">Управление каналами</TabsTrigger>
          <TabsTrigger value="users">Управление пользователями</TabsTrigger>
          <TabsTrigger value="class">Управление классом</TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Добавление канала</CardTitle>
              <CardDescription>Создайте новый канал для общения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="channel-name">Название канала</Label>
                <Input 
                  id="channel-name" 
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Название канала"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="channel-group">Группа</Label>
                <Select value={newChannelGroup} onValueChange={setNewChannelGroup}>
                  <SelectTrigger id="channel-group">
                    <SelectValue placeholder="Выберите группу" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="channel-private" 
                  checked={newChannelPrivate} 
                  onCheckedChange={setNewChannelPrivate} 
                />
                <Label htmlFor="channel-private">Приватный канал</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddChannel} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить канал
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Управление каналами</CardTitle>
              <CardDescription>Удаление существующих каналов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <h3 className="font-medium">{group.name}</h3>
                    <div className="grid gap-2">
                      {group.channels.map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <span>{channel.name}</span>
                            {channel.isPrivate && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Приватный</span>}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveChannel(channel.id, group.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Временная блокировка пользователей</CardTitle>
              <CardDescription>Заблокируйте пользователя на определенное время</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="user-select">Выберите пользователя</Label>
                <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Выберите пользователя" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mute-duration">Время блокировки (в минутах)</Label>
                <Input 
                  id="mute-duration" 
                  type="number" 
                  min="1" 
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mute-reason">Причина (необязательно)</Label>
                <Input 
                  id="mute-reason" 
                  value={muteReason}
                  onChange={(e) => setMuteReason(e.target.value)}
                  placeholder="Причина блокировки"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleMuteUser} className="w-full">
                <UserX className="mr-2 h-4 w-4" />
                Заблокировать пользователя
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Заблокированные пользователи</CardTitle>
              <CardDescription>Список временно заблокированных пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              {mutedUsers.length === 0 ? (
                <p className="text-muted-foreground">Нет заблокированных пользователей</p>
              ) : (
                <div className="space-y-2">
                  {mutedUsers.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          Заблокирован до: {user.mutedUntil.toLocaleString()}
                        </p>
                        {user.reason && (
                          <p className="text-xs text-muted-foreground">Причина: {user.reason}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleUnmuteUser(user.userId)}
                      >
                        Разблокировать
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление доступом к классу</CardTitle>
              <CardDescription>Временная блокировка доступа ко всему классу</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {classBlocked ? (
                <div className="bg-destructive/10 p-4 rounded-md text-center">
                  <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-destructive" />
                  <h3 className="font-medium text-destructive">Класс заблокирован</h3>
                  {blockEndTime && (
                    <p className="text-sm">
                      До окончания блокировки: {blockEndTime.toLocaleString()}
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={handleUnblockClass}
                  >
                    Разблокировать класс
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="block-duration">Время блокировки (в часах)</Label>
                    <Input 
                      id="block-duration" 
                      type="number" 
                      min="1" 
                      value={blockDuration}
                      onChange={(e) => setBlockDuration(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="block-reason">Причина (необязательно)</Label>
                    <Input 
                      id="block-reason" 
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Причина блокировки"
                    />
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Заблокировать класс
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Подтверждение</DialogTitle>
                        <DialogDescription>
                          Вы уверены, что хотите заблокировать доступ ко всему классу?
                          Это действие отключит доступ для всех пользователей.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleBlockClass}>
                          Подтвердить блокировку
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
