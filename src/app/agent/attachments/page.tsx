"use client"

import { useState } from "react"
import { Metadata } from "next"
import { Plus, Search, Filter, Mail, FileType, History, MessageSquare, CheckCircle, AlertCircle, Archive, Bookmark, Bell, FileSpreadsheet, ArrowRight, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AttachmentList } from "./components/AttachmentList"
import { AttachmentForm } from "./components/AttachmentForm"
import { AttachmentDownloadLinks } from "./components/AttachmentDownloadLinks"
import { AttachmentWithDetails } from "@/types/attachment"
import { useToast } from "@/components/ui/use-toast"
import { useAttachments } from "@/hooks/useAttachments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

// Metadata can't be used in client components, so we remove it
// export const metadata: Metadata = {
//   title: "Attachments | Agent Portal",
// }

// Sample data for demonstration
const sampleAttachments = [
  {
    id: "1",
    title: "Notification of Client Bank Draft Return",
    carrier: "Americo",
    policyNumber: "AM02380192",
    date: "Apr 28, 2025",
    type: "Draft Return"
  }
]

export default function AttachmentsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentWithDetails | null>(null);
  const { toast, dismiss } = useToast();
  const { fetchAttachments } = useAttachments();

  const handleAttachmentSelect = (attachment: AttachmentWithDetails) => {
    setSelectedAttachment(attachment);
    
    // Copy the full content to clipboard if available
    if (attachment.content) {
      navigator.clipboard.writeText(attachment.content)
        .then(() => {
          toast({
            title: "Content Copied",
            description: "Attachment content has been copied to clipboard",
          });
        })
        .catch(err => {
          console.error("Failed to copy content:", err);
        });
    }
  };

  const handleFormSuccess = () => {
    toast({
      title: "Success",
      description: "Email processed successfully! All related applications have been updated.",
      duration: 5000,
    });
    setSelectedAttachment(null);
    fetchAttachments(); // Refresh the list
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="p-4 md:p-6 max-w-[1400px] mx-auto"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Card className="border-0 shadow-md mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-900 dark:to-indigo-900 rounded-xl overflow-hidden">
        <CardHeader className="pb-2 relative">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
          <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-white/30 p-1.5 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-white" />
                </span>
                Attachments & Notifications
              </CardTitle>
              <CardDescription className="text-blue-50 mt-1 font-medium">
                Manage email notifications and important policy documents
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 md:flex-none md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input 
                  placeholder="Search attachments..." 
                  className="pl-10 w-full bg-white/90 dark:bg-gray-900/90 border-transparent dark:border-transparent focus:ring-2 focus:ring-white/30 dark:focus:ring-blue-400/30 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant={showUploadForm ? "secondary" : "outline"} 
                  className={`gap-2 ${showUploadForm ? "bg-white text-blue-700 hover:bg-blue-50" : "border-white/30 text-white hover:bg-blue-700/20"} transition-all duration-200`}
                  onClick={() => setShowUploadForm(true)}
                >
                  <Mail className="h-4 w-4" />
                  Process Email
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant={showUploadForm ? "outline" : "secondary"} 
                  className={`gap-2 ${!showUploadForm ? "bg-white text-blue-700 hover:bg-blue-50" : "border-white/30 text-white hover:bg-blue-700/20"} transition-all duration-200`}
                  onClick={() => setShowUploadForm(false)}
                >
                  <History className="h-4 w-4" />
                  View History
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <AnimatePresence mode="wait">
        {showUploadForm ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
            key="upload-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Attachment Download Links - Left Side */}
            <div className="md:col-span-5">
              <AttachmentDownloadLinks />
            </div>
            
            {/* Email Processing Form - Right Side */}
            <div className="md:col-span-7">
              <Card className="border-blue-200 shadow-lg bg-gradient-to-b from-white to-blue-50/40 dark:from-gray-900 dark:to-blue-950/20 overflow-hidden rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-400 dark:border-blue-800 pb-3 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.6))]"></div>
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
                  <div className="flex items-start z-10 relative">
                    <div className="mr-4 p-2 bg-white/30 rounded-lg shadow-inner backdrop-blur-sm">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium text-white">Process Email Notification</CardTitle>
                      <CardDescription className="text-blue-50 mt-1">
                        Simply copy the entire content of a notification email (like Draft Returns) and paste it below. 
                        The system will automatically extract all information and update the related application.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <AttachmentForm onSuccess={handleFormSuccess} />
                </CardContent>
                <CardFooter className="bg-blue-50 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900/50 py-3 flex items-center justify-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Your data is processed securely and never shared with third parties</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-md bg-white dark:bg-gray-950 overflow-hidden rounded-xl">
              <CardHeader className="pb-0 border-b bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.6))]"></div>
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/30 rounded-lg backdrop-blur-sm">
                      <FileSpreadsheet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium text-white">Attachment History</CardTitle>
                      <CardDescription className="text-sm text-blue-50 font-medium">
                        Browse and manage your past notifications and documents
                      </CardDescription>
                    </div>
                  </div>
                  <Tabs defaultValue="all" className="w-full md:w-auto">
                    <TabsList className="mb-0 bg-white/20 dark:bg-gray-800/30 p-1 shadow-sm border border-white/20 dark:border-gray-700/30 backdrop-blur-sm rounded-lg">
                      <TabsTrigger value="all" className="font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-white dark:data-[state=active]:text-blue-700 text-white rounded-md transition-all duration-200">All</TabsTrigger>
                      <TabsTrigger value="americo" className="font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-white dark:data-[state=active]:text-blue-700 text-white rounded-md transition-all duration-200">Americo</TabsTrigger>
                      <TabsTrigger value="mutual" className="font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-white dark:data-[state=active]:text-blue-700 text-white rounded-md transition-all duration-200">Mutual</TabsTrigger>
                      <TabsTrigger value="aetna" className="font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-white dark:data-[state=active]:text-blue-700 text-white rounded-md transition-all duration-200">Aetna</TabsTrigger>
                      <TabsTrigger value="corebridge" className="font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-white dark:data-[state=active]:text-blue-700 text-white rounded-md transition-all duration-200">CoreBridge</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="all" className="mt-0 py-0 px-0">
                  <AttachmentList onSelect={handleAttachmentSelect} />
                </TabsContent>
                <TabsContent value="americo" className="mt-0 py-0 px-0">
                  <AttachmentList onSelect={handleAttachmentSelect} carrierId="Americo" />
                </TabsContent>
                <TabsContent value="mutual" className="mt-0 py-0 px-0">
                  <AttachmentList onSelect={handleAttachmentSelect} carrierId="Mutual of Omaha" />
                </TabsContent>
                <TabsContent value="aetna" className="mt-0 py-0 px-0">
                  <AttachmentList onSelect={handleAttachmentSelect} carrierId="Aetna" />
                </TabsContent>
                <TabsContent value="corebridge" className="mt-0 py-0 px-0">
                  <AttachmentList onSelect={handleAttachmentSelect} carrierId="CoreBridge" />
                </TabsContent>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAttachment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="mt-6 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden bg-white dark:bg-gray-950 rounded-xl">
              <CardHeader className="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white border-b border-blue-500 dark:border-blue-700 flex flex-row justify-between items-center space-y-0 pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                <div className="relative z-10">
                  <CardTitle className="font-semibold text-white flex items-center gap-2">
                    <span className="bg-white/30 p-1.5 rounded-lg backdrop-blur-sm">
                      <FileText className="h-5 w-5 text-white" />
                    </span>
                    Attachment Details
                  </CardTitle>
                  <CardDescription className="text-blue-50 mt-1 flex items-center font-medium">
                    {selectedAttachment.title} 
                    {selectedAttachment.carrier_name && (
                      <>
                        <span className="mx-2 text-blue-200/60">•</span>
                        <Badge variant="outline" className="ml-1 font-normal bg-white/10 text-white border-white/20 backdrop-blur-sm">
                          {selectedAttachment.carrier_name}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedAttachment(null)}
                  className="ml-auto text-white border-white/20 hover:bg-white/10 backdrop-blur-sm relative z-10"
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Email Content
                    </h3>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 whitespace-pre-wrap font-mono text-sm max-h-[400px] overflow-auto shadow-inner border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md dark:text-gray-100">
                      {selectedAttachment.content || "No content available for this attachment."}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-200 pb-2 border-b flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Extracted Information
                    </h3>
                    <div className="space-y-4">
                      {selectedAttachment.policy_number && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Policy Number</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAttachment.policy_number}</span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.reason && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Reason</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAttachment.reason}</span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.amount && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Amount</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-300">${selectedAttachment.amount.toFixed(2)}</span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.effective_date && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Effective Date</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(selectedAttachment.effective_date).toLocaleDateString()}
                          </span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.insured_name && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Insured Name</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAttachment.insured_name}</span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.return_date && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Return Date</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(selectedAttachment.return_date).toLocaleDateString()}
                          </span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.second_return_date && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Second Return Date</span>
                          <span className="font-medium text-red-600 dark:text-red-300">
                            {new Date(selectedAttachment.second_return_date).toLocaleDateString()}
                          </span>
                        </motion.div>
                      )}
                      
                      {selectedAttachment.product_name && (
                        <motion.div 
                          className="flex flex-col"
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-300">Product</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAttachment.product_name}</span>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                      {selectedAttachment.download_url ? (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                            asChild
                          >
                            <a href={selectedAttachment.download_url} target="_blank" rel="noopener noreferrer">
                              <DownloadCloud className="h-4 w-4" />
                              Download Document
                            </a>
                          </Button>
                        </motion.div>
                      ) : selectedAttachment.file_url ? (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                            asChild
                          >
                            <a href={selectedAttachment.file_url} target="_blank" rel="noopener noreferrer">
                              <DownloadCloud className="h-4 w-4" />
                              Download Document
                            </a>
                          </Button>
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 