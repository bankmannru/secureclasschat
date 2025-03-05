
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LockKeyhole, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthForm = () => {
  const [userName, setUserName] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSecurityCodeSubmit = async (e: React.FormEvent) => {
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
        toast.error("Неверный код безопасности. Попробуйте снова.");
        console.error("Security code validation error:", error);
      } else {
        // Store the authenticated class ID
        localStorage.setItem("activeClass", data.class_id);
        // Move to username step
        setStep(2);
      }
    } catch (error) {
      toast.error("Произошла ошибка при проверке кода.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!userName.trim()) {
        toast.error("Пожалуйста, введите ваше имя.");
        return;
      }

      // Create a new user in the database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([{ user_name: userName.trim() }])
        .select();

      if (userError || !userData || userData.length === 0) {
        toast.error("Не удалось создать пользователя.");
        console.error("User creation error:", userError);
        return;
      }

      // Store user information
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", userData[0].id);
      localStorage.setItem("userName", userName.trim());

      toast.success("Успешная авторизация");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Произошла ошибка при создании пользователя.");
      console.error("User creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-fade-in glass-card">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {step === 1 ? (
            <LockKeyhole className="w-6 h-6 text-primary" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Класс 4М</CardTitle>
        <CardDescription className="text-balance">
          {step === 1 
            ? "Введите код безопасности для доступа к чату класса" 
            : "Введите ваше имя для участия в чате"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleSecurityCodeSubmit} className="space-y-4">
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
        ) : (
          <form onSubmit={handleUserNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="user-name"
                placeholder="Введите ваше имя"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-12"
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Войти в чат"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="text-center text-xs text-muted-foreground pt-0">
        {step === 1 
          ? "Обратитесь к преподавателю, если у вас нет кода безопасности" 
          : "Ваше имя будет отображаться в чате"}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
