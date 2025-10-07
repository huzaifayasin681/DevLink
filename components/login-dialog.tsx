"use client"

import { signIn } from "next-auth/react"
import { Github, Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function LoginDialog({ open, onOpenChange, title, description }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || "Login Required"}</DialogTitle>
          <DialogDescription>
            {description || "Please login to continue with this action."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button 
            onClick={() => signIn("google")} 
            variant="outline" 
            className="w-full"
          >
            <Chrome className="h-4 w-4 mr-2" />
            Continue with Google
          </Button>
          <Button 
            onClick={() => signIn("github")} 
            variant="outline" 
            className="w-full"
          >
            <Github className="h-4 w-4 mr-2" />
            Continue with GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}