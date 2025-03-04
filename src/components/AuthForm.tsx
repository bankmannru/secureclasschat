
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { LockKeyhole } from "lucide-react";

const AuthForm = () => {
  const [securityCode, setSecurityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // This is a placeholder. In the real application, this would validate against Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Placeholder validation - in a real app, this would check against Supabase
      if (securityCode.trim().length > 3) {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Successfully authenticated");
        navigate("/dashboard");
      } else {
        toast.error("Invalid security code. Please try again.");
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
        <CardTitle className="text-2xl font-semibold tracking-tight">Secure Access</CardTitle>
        <CardDescription className="text-balance">
          Enter your class security code to access the chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="security-code"
              placeholder="Enter security code"
              type="password"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="h-12"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground pt-0">
        Contact your teacher or administrator if you don't have a security code
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
