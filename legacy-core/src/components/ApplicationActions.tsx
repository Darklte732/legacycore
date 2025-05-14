import { useState } from 'react'
import { MoreHorizontal, Copy, Edit, Eye, Trash2, AlertCircle, Loader2, ExternalLink, FileText, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApplicationActionsProps {
  applicationId: string
}

export function ApplicationActions({ applicationId }: ApplicationActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  
  const copyApplicationId = () => {
    navigator.clipboard.writeText(applicationId)
    toast.success("Application ID copied to clipboard")
  }

  const viewApplicationDetails = () => {
    console.log("Viewing application details:", applicationId);
    router.push(`/agent/applications/${applicationId}`)
  }

  const editApplication = () => {
    console.log("Editing application:", applicationId);
    // Use direct navigation for more reliable navigation
    window.location.href = `/agent/applications/${applicationId}/edit`;
  }

  const deleteApplication = async () => {
    if (deleteConfirmation.trim().toLowerCase() !== 'delete') {
      toast.error("Please type 'delete' to confirm")
      return
    }

    try {
      setIsDeleting(true)
      // Create a fresh Supabase client
      const freshSupabase = createClient()
      
      const { data: { session } } = await freshSupabase.auth.getSession()
      console.log("Session for deletion:", session ? {
        id: session.user?.id,
        role: session.user?.role,
        isAuthenticated: !!session
      } : "No session")
      
      if (!session && process.env.NODE_ENV !== 'development') {
        throw new Error('You must be logged in to delete applications')
      }

      console.log("Deleting application with ID:", applicationId, "by user:", session?.user?.id);
      
      // Use the API endpoint instead of direct Supabase call
      const response = await fetch('/api/applications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          userId: session?.user?.id || 'demo-agent-id'
        }),
      });

      const result = await response.json();
      console.log("Delete API response:", result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete application');
      }
      
      toast.success("Application deleted successfully")
      setDeleteDialogOpen(false)

      // Provide information to the user about what happened
      console.log("Application deleted, returning to list");
      setTimeout(() => {
        window.location.href = "/agent/applications"; 
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting application:', error)
      toast.error(error.message || "Failed to delete application")
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation("")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-8 w-8 p-0 border border-gray-300 bg-gray-50 hover:bg-gray-100"
            aria-label="More options"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg z-50 border border-gray-200">
          <DropdownMenuItem 
            onClick={() => {
              console.log("View details clicked for:", applicationId);
              window.location.href = `/agent/applications/${applicationId}`;
            }} 
            className="cursor-pointer hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              console.log("Edit application clicked for:", applicationId);
              window.location.href = `/agent/applications/${applicationId}/edit`;
            }} 
            className="cursor-pointer hover:bg-gray-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Application</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyApplicationId} className="cursor-pointer hover:bg-gray-50">
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy ID</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Application</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Application</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The application will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-700 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                You are about to delete this application.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="delete-confirmation" className="text-red-600">
                Type "delete" to confirm
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="delete"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteApplication}
              disabled={isDeleting || deleteConfirmation.trim().toLowerCase() !== 'delete'}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete Application</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 