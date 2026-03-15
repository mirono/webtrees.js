import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import LoginForm from "./LoginForm";

interface LoginDialogProps {
  trigger?: React.ReactNode;
}

const LoginDialog = ({ trigger }: LoginDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    // The LoginForm already handles token storage and toast
    // We might need to trigger a global state update here later
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
        <div className="mt-4">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
