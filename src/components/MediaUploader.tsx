
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploaderProps {
  onMediaSelect: (url: string, type: string) => void;
  onCancelUpload: () => void;
  isUploading: boolean;
}

const MediaUploader = ({ 
  onMediaSelect, 
  onCancelUpload, 
  isUploading 
}: MediaUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой (максимум 10MB)");
      return;
    }

    // Only accept images and videos
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Только изображения и видео");
      return;
    }

    setMediaType(file.type.startsWith("image/") ? "image" : "video");
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) return;
    
    const file = fileInputRef.current.files[0];
    setIsSubmitting(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("chat_media")
        .upload(filePath, file);
      
      if (error) {
        console.error("Upload error:", error);
        toast.error("Ошибка при загрузке файла");
        return;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("chat_media")
        .getPublicUrl(filePath);
      
      // Pass URL and type back to parent component
      onMediaSelect(publicUrl, mediaType || "");
      
      // Reset state
      setPreview(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err) {
      console.error("Error in handleUpload:", err);
      toast.error("Ошибка при загрузке медиа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onCancelUpload();
  };

  return (
    <div className="mb-2">
      {!preview ? (
        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
            <ImageIcon className="h-5 w-5 text-primary" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <div className="text-sm text-muted-foreground">
            Добавить фото или видео
          </div>
        </div>
      ) : (
        <div className="relative border rounded-md p-2 bg-background">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {mediaType === "image" ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[200px] mx-auto rounded-md"
            />
          ) : (
            <video 
              src={preview} 
              controls 
              className="max-h-[200px] w-full mx-auto rounded-md"
            />
          )}
          
          <div className="mt-2 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleUpload}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Загрузка..." : "Отправить"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
