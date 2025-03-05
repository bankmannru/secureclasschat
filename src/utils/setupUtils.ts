
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Add a user as an admin - for testing purposes
export const setupAdminUser = async (userId: string) => {
  if (!userId) return;
  
  try {
    // First check if this user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking admin status:", checkError);
      return;
    }
    
    // If user is not an admin, make them one
    if (!existingAdmin) {
      const { error } = await supabase
        .from("admins")
        .insert({ user_id: userId });
        
      if (error) {
        console.error("Error setting admin:", error);
        return;
      }
      
      toast.success("Вы назначены администратором");
      return true;
    }
    
    return !!existingAdmin;
  } catch (error) {
    console.error("Error in setupAdminUser:", error);
    return false;
  }
};

// Create default channels for a class if they don't exist
export const setupDefaultChannels = async (classId: string) => {
  if (!classId) return;
  
  try {
    // Check if channels already exist
    const { data: existingChannels, error: checkError } = await supabase
      .from("channels")
      .select("id")
      .eq("class_id", classId);
      
    if (checkError) {
      console.error("Error checking channels:", checkError);
      return;
    }
    
    // If no channels found, create default ones
    if (!existingChannels || existingChannels.length === 0) {
      const defaultChannels = [
        { id: "announcements", name: "Объявления", class_id: classId, is_private: true },
        { id: "general", name: "Общий чат", class_id: classId, is_private: false },
        { id: "questions", name: "Вопросы", class_id: classId, is_private: false },
        { id: "homework", name: "Домашняя работа", class_id: classId, is_private: false },
        { id: "exams", name: "Экзамены", class_id: classId, is_private: false },
        { id: "resources", name: "Материалы", class_id: classId, is_private: false }
      ];
      
      const { error } = await supabase
        .from("channels")
        .insert(defaultChannels);
        
      if (error) {
        console.error("Error creating default channels:", error);
        return;
      }
      
      console.log("Default channels created");
      return true;
    }
    
    return existingChannels.length > 0;
  } catch (error) {
    console.error("Error in setupDefaultChannels:", error);
    return false;
  }
};
