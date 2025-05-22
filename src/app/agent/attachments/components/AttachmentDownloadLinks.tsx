"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DownloadCloud, FileText, ExternalLink, Clock, Filter, Search, AlertCircle, FileImage, RefreshCw, CheckCircle, InboxIcon, Inbox, FileArchive, ArrowRight } from "lucide-react"
import { AttachmentWithDetails } from "@/types/attachment"
import { useAttachments } from "@/hooks/useAttachments"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export function AttachmentDownloadLinks() {
  const { fetchRecentAttachmentsWithUrls, loading, error } = useAttachments()
  const [attachments, setAttachments] = useState<AttachmentWithDetails[]>([])
  const [filteredAttachments, setFilteredAttachments] = useState<AttachmentWithDetails[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch recent attachments with download URLs on component mount
  useEffect(() => {
    fetchAttachments()
  }, [])

  const fetchAttachments = async () => {
    setIsRefreshing(true)
    setErrorMessage(null)
    
    try {
      console.log("Fetching recent attachments...")
      const data = await fetchRecentAttachmentsWithUrls(15) // Limit to 15 recent attachments
      console.log("Attachment data received:", data)
      
      if (data && data.length > 0) {
        console.log(`Successfully loaded ${data.length} attachments`)
        setAttachments(data)
        
        // Force showing all attachments initially regardless of filter
        setFilter("all")
        setSearchQuery("")
        
        // Add a success message
        toast({
          title: "Attachments Loaded",
          description: `${data.length} attachment(s) found`,
          duration: 3000,
        })
      } else {
        // Handle empty result - this is normal for new users
        console.log("No attachments found")
        setAttachments([])
        setErrorMessage("No attachments available. Upload documents or process emails to get started.")
      }
    } catch (err: any) {
      console.error("Error fetching attachments:", err)
      if (err?.message?.includes("400") || err?.status === 400) {
        setErrorMessage("No attachments available. Upload documents or process emails to get started.")
      } else {
        setErrorMessage("Unable to load attachments. Please try again later.")
        toast({
          variant: "destructive",
          title: "Error Loading Attachments",
          description: err?.message || "Please try again or check your connection",
          duration: 5000,
        })
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter attachments when filter or search changes
  useEffect(() => {
    if (!attachments || !attachments.length) {
      setFilteredAttachments([])
      return
    }

    console.log(`Filtering ${attachments.length} attachments. Current filter: ${filter}, search: "${searchQuery}"`)
    
    let filtered = [...attachments]

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter(att => att.attachment_type === filter)
      console.log(`After type filtering: ${filtered.length} attachments match type "${filter}"`)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(att => 
        att.title?.toLowerCase().includes(query) ||
        att.policy_number?.toLowerCase().includes(query) ||
        att.insured_name?.toLowerCase().includes(query) ||
        att.carrier_name?.toLowerCase().includes(query)
      )
      console.log(`After search filtering: ${filtered.length} attachments match search "${searchQuery}"`)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    console.log(`Setting filtered attachments: ${filtered.length} items`)
    setFilteredAttachments(filtered)
  }, [attachments, filter, searchQuery])

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return dateStr
    }
  }

  const getFileIcon = (attachment: AttachmentWithDetails) => {
    if (attachment.attachment_type === 'draft_return') {
      return <Badge variant="destructive" className="px-2 py-1 animate-pulse">Draft Return</Badge>
    } else if (attachment.attachment_type === 'policy_update') {
      return <Badge variant="secondary" className="px-2 py-1">Policy Update</Badge>
    } else {
      return <Badge variant="outline" className="px-2 py-1">Document</Badge>
    }
  }

  const handleCopyContent = (content: string | undefined) => {
    if (!content) return

    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "Content Copied",
          description: "Attachment content has been copied to clipboard",
          duration: 3000,
        })
      })
      .catch(err => {
        console.error("Failed to copy content:", err)
      })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  }

  // Handle if we're in an error or empty state
  const isEmptyState = (!loading && !error && (!attachments || attachments.length === 0)) || errorMessage;

  return (
    <Card className="border border-blue-100 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 h-full overflow-hidden rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 pb-3 text-white relative overflow-hidden">    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.6))]"></div>    <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>    <div className="flex flex-col z-10 relative">      <div className="flex items-center justify-between mb-1">        <div className="flex items-center gap-2">          <div className="bg-white/30 rounded-full p-1.5 backdrop-blur-sm">            <FileImage className="h-4 w-4 text-white" />          </div>          <CardTitle className="text-lg font-medium text-white">Recent Attachments</CardTitle>        </div>        {attachments.length > 0 && (          <motion.div             animate={{ scale: [1, 1.1, 1] }}            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}            className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"          >            <CheckCircle className="h-3 w-3" />            <span>{attachments.length}</span>          </motion.div>        )}      </div>      <CardDescription className="text-blue-50 mt-1 font-medium">        Quick access to your recent documents      </CardDescription>    </div>  </CardHeader>
      <div className="p-3 border-b bg-blue-50/70 dark:bg-blue-950/40 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search files..." 
            className="pl-8 text-sm bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 focus:ring-blue-400 transition-all duration-200 focus:border-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className={`text-xs border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-all duration-200 ${isRefreshing ? 'animate-pulse' : ''}`}
          onClick={fetchAttachments}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Clock className="h-3.5 w-3.5 mr-1" />
          )}
          {isRefreshing ? 'Refreshing...' : 'Latest'}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="px-3 pt-2 pb-1 border-b bg-blue-50/30 dark:bg-blue-950/20">
          <TabsList className="bg-white dark:bg-gray-800 h-8 p-1 shadow-sm border border-blue-100 dark:border-blue-900 rounded-lg">
            <TabsTrigger 
              value="all" 
              className="text-xs font-medium px-2 py-1 h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:text-white text-gray-700 rounded-md transition-all duration-200" 
              onClick={() => setFilter("all")}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="draft_return" 
              className="text-xs font-medium px-2 py-1 h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:text-white text-gray-700 rounded-md transition-all duration-200" 
              onClick={() => setFilter("draft_return")}
            >
              Draft Returns
            </TabsTrigger>
            <TabsTrigger 
              value="policy_update" 
              className="text-xs font-medium px-2 py-1 h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:text-white text-gray-700 rounded-md transition-all duration-200" 
              onClick={() => setFilter("policy_update")}
            >
              Policy Updates
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-0">
          <div className="max-h-[435px] overflow-y-auto">
            {loading && !errorMessage ? (
              <div className="p-10 text-center">
                <motion.div 
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-500" 
                  role="status"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="sr-only">Loading...</span>
                </motion.div>
                <motion.p 
                  className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Loading your attachments...
                </motion.p>
              </div>
            ) : error && !errorMessage ? (
              <div className="p-10 text-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3 animate-pulse" />
                </motion.div>
                <motion.p 
                  className="text-red-500 font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Error loading attachments
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-500 mt-2 mb-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  There was a problem connecting to the server
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchAttachments}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </motion.div>
              </div>
            ) : filteredAttachments.length > 0 ? (
              <motion.div 
                className="divide-y divide-gray-100 dark:divide-gray-800"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredAttachments.map((attachment, index) => (
                    <motion.div 
                      key={attachment.id} 
                      className="p-3 hover:bg-blue-50/80 dark:hover:bg-blue-900/40 transition-colors duration-200 group bg-white dark:bg-gray-900/60 border-l-4 border-blue-400 dark:border-blue-500 m-2 rounded-md shadow-sm"
                      variants={itemVariants}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {getFileIcon(attachment)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                              {attachment.title}
                            </h4>
                            <div className="flex gap-1">
                              {new Date(attachment.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                                <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-800 animate-pulse px-1.5 ml-2">
                                  Updated
                                </Badge>
                              )}
                              {attachment.download_url && attachment.download_count > 0 && (
                                <Badge variant="outline" className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-800 px-1.5">
                                  Downloaded
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 flex flex-wrap gap-x-2">
                            {attachment.carrier_name && (
                              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{attachment.carrier_name}</span>
                            )}
                            {attachment.policy_number && (
                              <span className="font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">#{attachment.policy_number}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3 inline" />
                            {formatDate(attachment.created_at)}
                            {attachment.insured_name && (
                              <span className="ml-2 text-blue-500 dark:text-blue-400">• {attachment.insured_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {attachment.download_url ? (
                            <motion.a 
                              href={attachment.download_url} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Download document"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <DownloadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </motion.a>
                          ) : attachment.file_url ? (
                            <motion.a 
                              href={attachment.file_url} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Download document"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <DownloadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </motion.a>
                          ) : null}
                          
                          {attachment.content && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300"
                                title="Copy Content"
                                onClick={() => handleCopyContent(attachment.content)}
                              >
                                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                className="p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center shadow-inner"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <FileArchive className="h-12 w-12 text-blue-400 dark:text-blue-300" />
                  </motion.div>
                </motion.div>
                <motion.h3 
                  className="text-lg font-medium text-gray-700 dark:text-gray-200"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {errorMessage ? "No Attachments Available" : "No attachments found"}
                </motion.h3>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-300 mt-2 max-w-xs mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {errorMessage || "Upload documents or process emails to see them here"}
                </motion.p>
                <motion.div 
                  className="mt-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 shadow-sm hover:shadow transition-all duration-200"
                    onClick={fetchAttachments}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    <ArrowRight className="h-3 w-3 inline mr-1" />
                    Process an email notification to get started
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Tabs>
    
      <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-t border-blue-100 dark:border-blue-900/50 py-2 px-3">
        <div className="w-full flex justify-between items-center">
          <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
            {isRefreshing ? (
              <span className="animate-pulse">Refreshing attachments...</span>
            ) : filteredAttachments.length > 0 ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {`Showing ${filteredAttachments.length} of ${attachments.length} attachments`}
              </span>  
            ) : (
              'No attachments to display'
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/30 transition-all duration-200"
            onClick={() => {
              setSearchQuery('')
              setFilter('all')
              fetchAttachments()
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 