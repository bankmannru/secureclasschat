
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploaderProps {
  classId: string;
  channelId: string;
  userId: string;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onUploadError?: (error: any) => void;
}

const MediaUploader = ({
  classId,
  channelId,
  userId,
  onUploadStart,
  onUploadComplete,
  onUploadError
}: MediaUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type and size
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error("Только изображения и видео");
      return;
    }
    
    // 50MB size limit
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Файл слишком большой (максимум 50MB)");
      return;
    }
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    
    // Clean up when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !userId || !classId || !channelId) {
      return;
    }
    
    setIsUploading(true);
    if (onUploadStart) onUploadStart();
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);
      formData.append('classId', classId);
      formData.append('channelId', channelId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Using string concatenation to avoid TypeScript error with supabase.functions.url
      const response = await fetch("https://plzgfbydqknqgjqbiuxd.supabase.co/functions/v1/upload-media", {
        method: 'POST',
        body: formData,
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка загрузки');
      }
      
      if (onUploadComplete) onUploadComplete();
      toast.success('Медиа успешно загружено');
      clearSelection();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(`Ошибка загрузки: ${error.message}`);
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!selectedFile) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          type="button"
          asChild
        >
          <label>
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          type="button"
          asChild
        >
          <label>
            <VideoIcon className="h-4 w-4" />
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div className="flex flex-col gap-2 border rounded-md p-2">
        <div className="relative">
          {selectedFile.type.startsWith('image/') ? (
            <img 
              src={previewUrl!} 
              alt="Preview" 
              className="max-h-60 max-w-full object-contain rounded-md"
            />
          ) : (
            <video 
              src={previewUrl!} 
              controls 
              className="max-h-60 max-w-full object-contain rounded-md"
            />
          )}
          
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 absolute top-1 right-1 rounded-full"
            onClick={clearSelection}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={isUploading}
          >
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Отправить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;
