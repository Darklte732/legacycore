"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Trash2, ExternalLink, FileText, AlertCircle, DownloadCloud } from "lucide-react"
import { AttachmentWithDetails } from "@/types/attachment"
import { useAttachments } from "@/hooks/useAttachments"
import { formatDistance } from "date-fns"
import { Badge } from "@/components/ui/badge"

type AttachmentListProps = {
  onSelect: (attachment: AttachmentWithDetails) => void;
  carrierId?: string;
}

export function AttachmentList({ onSelect, carrierId }: AttachmentListProps) {
  const { attachments, loading, error, fetchAttachments, deleteAttachment } = useAttachments();
  const [filteredAttachments, setFilteredAttachments] = useState<AttachmentWithDetails[]>([]);
  
  useEffect(() => {
    fetchAttachments();
  }, []);
  
  // Filter attachments when props change or attachments are loaded
  useEffect(() => {
    if (!attachments) return;
    
    if (carrierId && carrierId !== 'all') {
      setFilteredAttachments(attachments.filter(att => 
        att.carrier_name === carrierId || 
        att.carrier === carrierId
      ));
    } else {
      setFilteredAttachments(attachments);
    }
  }, [carrierId, attachments]);
  
  const handleDeleteAttachment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      await deleteAttachment(id);
    }
  };
  
  const formatDateRelative = (dateStr: string) => {
    try {
      return formatDistance(new Date(dateStr), new Date(), { addSuffix: true });
    } catch {
      return dateStr; // In case of parsing error, return the original string
    }
  };
  
  // Get attachment type badge
  const getAttachmentTypeBadge = (type: string) => {
    switch (type) {
      case 'draft_return':
        return <Badge variant="destructive">Draft Return</Badge>;
      case 'policy_update':
        return <Badge variant="secondary">Policy Update</Badge>;
      case 'client_communication':
        return <Badge variant="outline">Client Communication</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="font-semibold">
          {carrierId && carrierId !== 'all' 
            ? `${carrierId} Attachments` 
            : 'All Attachments'}
        </h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => fetchAttachments()}
          className="text-xs"
        >
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-gray-500">Loading attachments...</p>
        </div>
      ) : error ? (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500 font-medium">Error loading attachments</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">There was a problem fetching your attachments</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchAttachments()}
          >
            Try Again
          </Button>
        </div>
      ) : filteredAttachments.length > 0 ? (
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {filteredAttachments.map(attachment => (
            <div 
              key={attachment.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors duration-150 border-l-4 border-transparent hover:border-blue-400 dark:hover:border-blue-500"
              onClick={() => onSelect(attachment)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded flex-shrink-0 ${
                    attachment.attachment_type === 'draft_return' 
                      ? 'bg-red-100 dark:bg-red-900/40' 
                      : 'bg-blue-100 dark:bg-blue-900/40'
                  }`}>
                    {attachment.attachment_type === 'draft_return' ? (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : attachment.file_url ? (
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Paperclip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <h3 className="font-medium text-sm truncate dark:text-gray-100">{attachment.title}</h3>
                      {attachment.attachment_type && getAttachmentTypeBadge(attachment.attachment_type)}
                      
                      {/* Show status badges */}
                      <div className="flex flex-wrap gap-1 ml-auto">
                        {/* Check if attachment was updated recently (within 24 hours) */}
                        {new Date(attachment.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                          <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-800 animate-pulse px-1.5">
                            Updated
                          </Badge>
                        )}
                        {/* Show if attachment has been downloaded before */}
                        {attachment.file_url && (
                          <Badge variant="outline" className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-800 px-1.5">
                            Downloaded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex flex-wrap gap-x-2">
                      <span>{attachment.carrier_name || "Unknown Carrier"}</span>
                      {attachment.policy_number && (
                        <span className="font-mono">#{attachment.policy_number}</span>
                      )}
                      {attachment.insured_name && (
                        <span className="truncate max-w-[180px]">{attachment.insured_name}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <span>Added {formatDateRelative(attachment.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {attachment.file_url && (
                    <a 
                      href={attachment.file_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300"
                      title="Download document"
                    >
                      <DownloadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </a>
                  )}
                  <button
                    onClick={(e) => handleDeleteAttachment(attachment.id, e)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors duration-200"
                    title="Delete attachment"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center flex flex-col items-center">
          <FileText className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No attachments found</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {carrierId && carrierId !== 'all'
              ? `No attachments found for ${carrierId}. Try another carrier or upload a new attachment.`
              : `You haven't uploaded any attachments yet. Process an email notification to get started.`
            }
          </p>
        </div>
      )}
    </div>
  )
} 