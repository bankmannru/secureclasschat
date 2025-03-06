
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
}

const ImageUpload = ({ onImageUploaded }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // First, check if the bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('message-images');
      
      // If bucket doesn't exist, create it
      if (bucketError && bucketError.message.includes('does not exist')) {
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('message-images', {
            public: true,
          });
          
        if (createBucketError) throw createBucketError;
      }
      
      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from('message-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase
        .storage
        .from('message-images')
        .getPublicUrl(filePath);
        
      onImageUploaded(data.publicUrl);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {previewUrl ? (
        <div className="relative mt-2">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-40 max-h-40 rounded-md object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
