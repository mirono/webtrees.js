import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginDialogProps {
  trigger?: React.ReactNode;
}

const LoginDialog = ({ trigger }: LoginDialogProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Login",
      description: "Login functionality not yet implemented",
    });
    setOpen(false);
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset functionality not yet implemented",
    });
  };

  const handleRequestAccount = () => {
    toast({
      title: "Account Request",
      description: "Account request has been submitted (API not connected)",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-foreground" htmlFor="username">Username</Label>
            <Input className="text-foreground"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground" htmlFor="password">Password</Label>
            <Input className="text-foreground"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={handleRequestAccount}
              className="text-sm text-primary hover:underline font-medium"
            >
              Request a new user account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
