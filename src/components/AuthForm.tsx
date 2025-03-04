
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthForm = () => {
  const [securityCode, setSecurityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if the security code exists in the database
      const { data, error } = await supabase
        .from("class_security_codes")
        .select("class_id")
        .eq("security_code", securityCode.trim())
        .single();

      if (error || !data) {
        toast.error("Invalid security code. Please try again.");
        console.error("Security code validation error:", error);
      } else {
        // Store the authenticated class ID and authentication status
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("activeClass", data.class_id);
        toast.success("Successfully authenticated");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred during authentication.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-fade-in glass-card">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <LockKeyhole className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Класс 4М</CardTitle>
        <CardDescription className="text-balance">
          Введите код безопасности для доступа к чату класса
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="security-code"
              placeholder="Введите код безопасности"
              type="password"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="h-12"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
            {isLoading ? "Проверка..." : "Продолжить"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground pt-0">
        Обратитесь к преподавателю, если у вас нет кода безопасности
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
