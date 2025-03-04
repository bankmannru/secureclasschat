
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { Shield, BookOpen, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const features = [
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "Secure Access",
      description: "Access is restricted to authorized students and administrators only."
    },
    {
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      title: "Class-Specific Channels",
      description: "Dedicated spaces for each of your classes and topics."
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      title: "Real-Time Messaging",
      description: "Instant communication with your classmates and teachers."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-50" />
      
      <header className="relative z-10 container mx-auto py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">SecureClassChat</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col container relative z-10">
        <div className="py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary">
              <Shield className="mr-1 h-3.5 w-3.5" />
              <span>Secure School Communication Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              The safe space for class discussions
            </h1>
            
            <p className="text-lg text-muted-foreground text-balance">
              Connect with your classmates and teachers in a secure and private environment.
              Share ideas, ask questions, and collaborate on projects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="p-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end animate-float">
            <AuthForm />
          </div>
        </div>
      </main>

      <footer className="relative z-10 container mx-auto py-6 text-center text-sm text-muted-foreground">
        <p>© 2023 SecureClassChat. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
