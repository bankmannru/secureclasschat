
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, SearchIcon, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageSearchProps {
  onImageSelected: (url: string) => void;
}

type ImageResult = {
  title: string;
  link: string;
  thumbnail: string;
  context: string;
};

const ImageSearch = ({ onImageSelected }: ImageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const searchImages = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите поисковый запрос",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-image-search", {
        body: { query: searchQuery },
      });

      if (error) throw error;
      setImages(data.images || []);
    } catch (error) {
      console.error("Error searching for images:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск изображений",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    setIsOpen(false);
    
    try {
      // Show loading toast
      toast({
        title: "Загрузка изображения...",
        description: "Подождите, изображение загружается",
      });
      
      // Fetch the image
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      
      const imageBlob = await response.blob();
      
      // Create a file from the blob
      const fileName = `search-${Date.now()}.${imageBlob.type.split('/')[1] || 'jpg'}`;
      const imageFile = new File([imageBlob], fileName, { type: imageBlob.type });
      
      // Upload to Supabase (reusing the existing image upload logic)
      const fileExt = fileName.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('message-images')
        .upload(filePath, imageFile);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase
        .storage
        .from('message-images')
        .getPublicUrl(filePath);
        
      // Pass the URL to the parent component
      onImageSelected(data.publicUrl);
      
      toast({
        title: "Изображение добавлено",
        description: "Изображение успешно добавлено в сообщение",
      });
    } catch (error) {
      console.error("Error processing selected image:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchImages();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <SearchIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Поиск изображений</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Введите поисковый запрос..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={searchImages} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SearchIcon className="h-4 w-4 mr-2" />
              )}
              Поиск
            </Button>
          </div>
          
          {isSearching ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : images.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square relative rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleSelectImage(image.link)}
                  >
                    <img 
                      src={image.thumbnail} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Введите поисковый запрос для поиска изображений</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageSearch;
