
import { useState } from "react";
import { 
  MoreHorizontal, 
  Trash2, 
  Edit,
  Check,
  X 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MessageActionsProps {
  messageId: string;
  content: string;
  isAdmin: boolean;
  onMessageUpdated: () => void;
}

const MessageActions = ({ messageId, content, isAdmin, onMessageUpdated }: MessageActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);
        
      if (error) throw error;
      
      toast({
        title: "Сообщение удалено",
        description: "Сообщение было успешно удалено",
        variant: "default",
      });
      
      onMessageUpdated();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: editedContent })
        .eq("id", messageId);
        
      if (error) throw error;
      
      setIsEditing(false);
      
      toast({
        title: "Сообщение обновлено",
        description: "Сообщение было успешно отредактировано",
        variant: "default",
      });
      
      onMessageUpdated();
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  if (!isAdmin) return null;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 mt-1">
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[3rem]"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelEdit}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" /> Отмена
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSaveEdit}
            className="h-8"
          >
            <Check className="h-4 w-4 mr-1" /> Сохранить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Действия</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" /> Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive" 
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;
