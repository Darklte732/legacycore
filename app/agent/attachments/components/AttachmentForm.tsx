"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAttachments } from "@/hooks/useAttachments"
import { AttachmentFormData, AttachmentType } from "@/types/attachment"
import { Upload, FileText, Wand2, CheckCircle2, ClipboardPaste, Loader2, ArrowRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

type AttachmentFormProps = {
  onSuccess?: () => void;
}

export function AttachmentForm({ onSuccess }: AttachmentFormProps) {
  const [formData, setFormData] = useState<AttachmentFormData>({
    title: "",
    carrier: "",
    attachmentType: "other" as AttachmentType,
    policyNumber: "",
    reason: "",
    amount: undefined,
    effectiveDate: "",
    insuredName: "",
    content: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { addAttachment } = useAttachments();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, content }));
    
    // Reset extraction status when new content is pasted
    if (extractionComplete && content !== formData.content) {
      setExtractionComplete(false);
    }
    
    // Auto-extract information when content is pasted
    if (content && content !== formData.content) {
      extractInformationFromContent(content);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle number conversions for amount
    if (name === 'amount') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? parseFloat(value) : undefined 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Function to extract information from pasted content
  const extractInformationFromContent = (content: string) => {
    if (!content) return;
    
    const extracted: string[] = [];
    setExtractedInfo([]);
    
    // Detect if this is a draft return notification
    if (content.includes('Notification of Client Bank Draft Return') || 
        content.includes('Return Draft Reason') ||
        content.includes('attached in the body of this email is a returned draft report') ||
        content.match(/draft.+return/i)) {
      
      // Auto set attachment type and title
      setFormData(prev => ({ 
        ...prev, 
        attachmentType: 'draft_return',
        title: 'Notification of Client Bank Draft Return'
      }));
      extracted.push('Detected Draft Return Notification');
      
      // Extract carrier
      if (content.includes('Americo') || content.includes('@americo.com')) {
        setFormData(prev => ({ ...prev, carrier: 'Americo' }));
        extracted.push('Set carrier: Americo');
      } else if (content.includes('Mutual of Omaha')) {
        setFormData(prev => ({ ...prev, carrier: 'Mutual of Omaha' }));
        extracted.push('Set carrier: Mutual of Omaha');
      } else if (content.includes('Aetna')) {
        setFormData(prev => ({ ...prev, carrier: 'Aetna' }));
        extracted.push('Set carrier: Aetna');
      }
      
      // Extract policy number
      const policyMatch = content.match(/Policy Number\s*-\s*([^\n]+)/i) || 
                          content.match(/Policy\s*#\s*:\s*([^\n]+)/i) ||
                          content.match(/Policy\s*Number\s*:\s*([^\n\r]+)/i);
      if (policyMatch && policyMatch[1]) {
        const policyNumber = policyMatch[1].trim();
        setFormData(prev => ({ ...prev, policyNumber }));
        extracted.push(`Extracted Policy Number: ${policyNumber}`);
      }
      
      // Extract reason
      const reasonMatch = content.match(/Return Draft Reason\s*-\s*([^\n]+)/i) ||
                          content.match(/Reason\s*:\s*([^\n\r]+)/i) ||
                          content.match(/Return\s*Reason\s*:\s*([^\n\r]+)/i);
      if (reasonMatch && reasonMatch[1]) {
        let reason = reasonMatch[1].trim();
        // Clean up HTML entities
        reason = reason.replace(/&nbsp;/g, ' ').replace(/&Acirc;/g, '');
        setFormData(prev => ({ ...prev, reason }));
        extracted.push(`Extracted Reason: ${reason}`);
      }
      
      // Extract amount
      const amountMatch = content.match(/Amount\s*-\s*([0-9.]+)/i) ||
                          content.match(/Premium\s*:\s*\$?([0-9.]+)/i) ||
                          content.match(/Reoccurring Premium\s*-\s*([0-9.]+)/i);
      if (amountMatch && amountMatch[1]) {
        const amount = parseFloat(amountMatch[1]);
        setFormData(prev => ({ ...prev, amount }));
        extracted.push(`Extracted Amount: $${amount}`);
      }
      
      // Extract effective date
      const effectiveDateMatch = content.match(/Policy Effective Date\s*-\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i) ||
                                 content.match(/Effective Date\s*:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i);
      if (effectiveDateMatch && effectiveDateMatch[1]) {
        const dateString = effectiveDateMatch[1];
        // Convert MM/DD/YYYY to YYYY-MM-DD for input
        const dateParts = dateString.split('/');
        if (dateParts.length === 3) {
          const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
          setFormData(prev => ({ ...prev, effectiveDate: formattedDate }));
          extracted.push(`Extracted Effective Date: ${dateString}`);
        }
      }
      
      // Extract insured name
      const insuredMatch = content.match(/Insured Name\s*-\s*([^\n]+)/i) ||
                           content.match(/Insured\s*:\s*([^\n\r]+)/i);
      if (insuredMatch && insuredMatch[1]) {
        const insuredName = insuredMatch[1].trim();
        setFormData(prev => ({ ...prev, insuredName }));
        extracted.push(`Extracted Insured Name: ${insuredName}`);
      }
    }
    
    // Update the extracted info state
    if (extracted.length > 0) {
      setExtractedInfo(extracted);
      setExtractionComplete(true);
    }
  };
  
  // Clear the extracted info after some time
  useEffect(() => {
    if (extractedInfo.length > 0) {
      const timer = setTimeout(() => {
        setExtractedInfo([]);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [extractedInfo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // If details were never shown, make sure we run extraction one last time
      if (!extractionComplete && formData.content) {
        extractInformationFromContent(formData.content);
      }
      
      // Auto-set attachment type if not already set
      let attachmentType = formData.attachmentType;
      if (attachmentType === 'other' && formData.content) {
        if (formData.content.includes('draft return') || 
            formData.content.includes('Return Draft') || 
            formData.content.includes('insufficient funds')) {
          attachmentType = 'draft_return';
        }
      }
      
      // Auto-set title if empty
      let title = formData.title;
      if (!title) {
        if (attachmentType === 'draft_return') {
          title = 'Notification of Client Bank Draft Return';
        } else {
          title = 'Policy Communication';
        }
      }
      
      // Add the attachment to Supabase
      const result = await addAttachment(
        {
          ...formData,
          title,
          attachmentType
        },
        file || undefined
      );
      
      if (result) {
        // Reset form on success
        setFormData({
          title: "",
          carrier: "",
          attachmentType: "other" as AttachmentType,
          policyNumber: "",
          reason: "",
          amount: undefined,
          effectiveDate: "",
          insuredName: "",
          content: ""
        });
        setFile(null);
        setExtractionComplete(false);
        setShowDetails(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error submitting attachment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFormData(prev => ({ ...prev, content: text }));
        extractInformationFromContent(text);
        
        if (contentRef.current) {
          contentRef.current.value = text;
          contentRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg">
      <div className="p-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnimatePresence>
            {extractedInfo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800/50 shadow-sm overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="flex items-center text-green-800 dark:text-green-300 font-medium mb-2">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      <span>Information Successfully Extracted</span>
                    </div>
                    <motion.ul 
                      className="list-disc pl-5 text-sm text-green-700 dark:text-green-300 space-y-1"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {extractedInfo.map((info, index) => (
                        <motion.li 
                          key={index}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: { opacity: 1, x: 0 }
                          }}
                        >
                          {info}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border border-blue-100 dark:border-blue-900/50 rounded-xl p-5 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/30 dark:to-gray-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Email Content
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={handlePasteFromClipboard}
                  className="text-blue-600 border-blue-200 dark:border-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                >
                  <ClipboardPaste className="h-4 w-4 mr-1" />
                  <span>Paste from Clipboard</span>
                </Button>
              </motion.div>
            </div>
            
            <Textarea 
              ref={contentRef}
              name="content"
              value={formData.content}
              onChange={handleContentChange}
              className="min-h-[280px] font-mono text-sm bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100" 
              placeholder="Paste the complete email content here..."
              required
            />
            
            <div className="mt-4 text-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ArrowRight className={`h-3.5 w-3.5 mr-1.5 transition-transform duration-300 ${showDetails ? 'rotate-90' : ''}`} />
                {showDetails ? "Hide Details" : "Show Extracted Information"}
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/30 dark:to-gray-900 shadow-sm"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Attachment Title</label>
                  <Input 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Notification of Client Bank Draft Return" 
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Upload Document (Optional)</label>
                  <div className="mt-1 flex items-center">
                    <label 
                      className="flex justify-center items-center px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border-2 
                        border-dashed border-blue-200 dark:border-blue-800/70 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 w-full transition-all duration-200"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.html"
                      />
                      <div className="flex items-center justify-center">
                        <Upload className="h-5 w-5 text-blue-400 dark:text-blue-400 mr-2" />
                        <span className="text-sm text-blue-500 dark:text-blue-300">{file ? file.name : "Choose a file"}</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Carrier</label>
                  <select 
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleChange}
                    className="w-full p-2 border border-blue-100 dark:border-blue-900/50 rounded-md bg-white dark:bg-gray-900 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  >
                    <option value="">Select Carrier</option>
                    <option value="Americo">Americo</option>
                    <option value="Mutual of Omaha">Mutual of Omaha</option>
                    <option value="Aetna">Aetna</option>
                    <option value="CoreBridge">CoreBridge</option>
                    <option value="Gerber">Gerber</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Attachment Type</label>
                  <select 
                    name="attachmentType"
                    value={formData.attachmentType}
                    onChange={handleChange}
                    className="w-full p-2 border border-blue-100 dark:border-blue-900/50 rounded-md bg-white dark:bg-gray-900 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  >
                    <option value="draft_return">Draft Return</option>
                    <option value="policy_update">Policy Update</option>
                    <option value="client_communication">Client Communication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Policy Number</label>
                  <Input 
                    name="policyNumber"
                    value={formData.policyNumber || ""}
                    onChange={handleChange}
                    placeholder="e.g. AM02380192"
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Reason</label>
                  <Input 
                    name="reason"
                    value={formData.reason || ""}
                    onChange={handleChange}
                    placeholder="e.g. Insufficient Funds"
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Amount</label>
                  <Input 
                    name="amount"
                    value={formData.amount || ""}
                    onChange={handleChange}
                    placeholder="e.g. 48.59"
                    type="number"
                    step="0.01"
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Effective Date</label>
                  <Input 
                    name="effectiveDate"
                    value={formData.effectiveDate || ""}
                    onChange={handleChange}
                    type="date"
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Insured Name</label>
                  <Input 
                    name="insuredName"
                    value={formData.insuredName || ""}
                    onChange={handleChange}
                    placeholder="e.g. Brower, Gerald D"
                    className="border-blue-100 dark:border-blue-900/50 focus:border-blue-300 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800/30 transition-all duration-200 dark:text-gray-100"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => extractInformationFromContent(formData.content)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-sm transition-all duration-200"
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                      <span>Re-Extract Information</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Processing...
                </>
              ) : extractionComplete ? (
                "Process Email & Update Application"
              ) : (
                "Upload & Process Email"
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
} 