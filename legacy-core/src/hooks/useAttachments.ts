"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AttachmentWithDetails, AttachmentFormData, AttachmentType } from '@/types/attachment';
import { useToast } from '@/components/ui/use-toast';

export const useAttachments = () => {
  const [attachments, setAttachments] = useState<AttachmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchAttachments = async (carrierId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Call the Supabase function we created to get attachments with details
      const { data, error: functionError } = await supabase
        .rpc('get_attachments_with_details', {
          p_user_id: session.user.id,
          p_carrier_id: carrierId || null
        });

      if (functionError) {
        throw functionError;
      }

      // If the function call fails, fall back to a standard query
      if (!data) {
        // Join with carriers table to get carrier name
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('attachments')
          .select(`
            *,
            carrier:carriers(name)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }

        // Transform data to include carrier name
        const formattedData = fallbackData?.map(attachment => ({
          ...attachment,
          carrier_name: attachment.carrier?.name || null
        }));

        setAttachments(formattedData || []);
      } else {
        setAttachments(data || []);
      }
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch recent attachments with download URLs
  const fetchRecentAttachmentsWithUrls = async (limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Call the Supabase function we created to get recent attachments with download URLs
      const { data, error: functionError } = await supabase
        .rpc('get_recent_attachments_with_urls', {
          p_user_id: session.user.id,
          p_limit: limit
        });

      if (functionError) {
        throw functionError;
      }

      // Set the attachments
      setAttachments(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching recent attachments:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err : new Error('File upload failed'));
      return null;
    }
  };

  const addAttachment = async (
    formData: AttachmentFormData, 
    file?: File
  ): Promise<AttachmentWithDetails | null> => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Upload the file if provided
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (file) {
        fileUrl = await uploadFile(file);
        fileName = file.name;
        fileSize = file.size;
      }

      // Get organization ID from user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get carrier ID if carrier name is provided
      let carrierId = null;
      if (formData.carrier) {
        const { data: carrierData, error: carrierError } = await supabase
          .from('carriers')
          .select('id')
          .eq('name', formData.carrier)
          .single();

        if (!carrierError && carrierData) {
          carrierId = carrierData.id;
        }
      }

      // Parse dates from the content if it's a draft return
      let returnDate = null;
      let secondReturnDate = null;
      let productName = null;
      let producerId = null;
      let producerName = null;
      let status = null;

      if (formData.attachmentType === 'draft_return' && formData.content) {
        // Extract specific information from the content
        const content = formData.content;
        
        // Extract return dates
        const initialReturnMatch = content.match(/Initial Return Date\s*-\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i);
        if (initialReturnMatch && initialReturnMatch[1]) {
          returnDate = initialReturnMatch[1];
        }
        
        const secondReturnMatch = content.match(/Second Return Date\s*-\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i);
        if (secondReturnMatch && secondReturnMatch[1]) {
          secondReturnDate = secondReturnMatch[1];
        }
        
        // Extract product name
        const productMatch = content.match(/Product Name\s*-\s*([^\n]+)/i);
        if (productMatch && productMatch[1]) {
          productName = productMatch[1].trim();
        }
        
        // Extract producer information
        const producerIdMatch = content.match(/Producer ID\s*-\s*([^\n]+)/i);
        if (producerIdMatch && producerIdMatch[1]) {
          producerId = producerIdMatch[1].trim();
        }
        
        const producerNameMatch = content.match(/Producer Name\s*-\s*([^\n]+)/i);
        if (producerNameMatch && producerNameMatch[1]) {
          producerName = producerNameMatch[1].trim();
        }
        
        // Set status based on if it's a first or second return
        // Using valid values that won't conflict with the database constraint
        status = secondReturnDate ? 'Not Applicable' : 'Payment Failed';
      }

      console.log('Submitting attachment with data:', {
        title: formData.title,
        carrier: formData.carrier,
        type: formData.attachmentType,
        policyNumber: formData.policyNumber,
        amount: formData.amount
      });

      // Format dates properly for the RPC call
      const effectiveDate = formData.effectiveDate ? new Date(formData.effectiveDate).toISOString() : null;
      const formattedReturnDate = returnDate ? new Date(returnDate).toISOString() : null;
      const formattedSecondReturnDate = secondReturnDate ? new Date(secondReturnDate).toISOString() : null;

      // Call the Supabase function to create attachment with details
      const { data, error } = await supabase
        .rpc('create_attachment_with_details', {
          p_organization_id: profileData.organization_id,
          p_user_id: session.user.id,
          p_client_id: null, // Could be linked to a client in the future
          p_policy_id: null, // Could be linked to a policy in the future
          p_carrier_id: carrierId,
          p_title: formData.title || 'Untitled Attachment',
          p_description: null,
          p_attachment_type: formData.attachmentType || 'other',
          p_file_url: fileUrl,
          p_file_name: fileName,
          p_file_size: fileSize ? parseInt(fileSize.toString()) : null,
          p_content: formData.content || null,
          p_policy_number: formData.policyNumber || null,
          p_reason: formData.reason || null,
          p_amount: formData.amount ? parseFloat(formData.amount.toString()) : null,
          p_effective_date: effectiveDate,
          p_insured_name: formData.insuredName || null,
          p_status: status,
          p_return_date: formattedReturnDate,
          p_second_return_date: formattedSecondReturnDate,
          p_product_name: productName,
          p_producer_id: producerId,
          p_producer_name: producerName
        });

      if (error) {
        console.error('Error from RPC call:', error);
        throw error;
      }

      // If this is a draft return, update the agent application
      if (formData.attachmentType === 'draft_return' && formData.policyNumber) {
        try {
          // Get valid commission status - must be one of: 'Pending', 'Partial', 'Paid', 'Not Applicable'
          let commissionStatus = "Not Applicable"; // Using a valid value from the check constraint
          
          // If this is a second return, mark status accordingly
          if (secondReturnDate) {
            commissionStatus = "Not Applicable";  // For chargebacks, "Not Applicable" is appropriate
          }
          
          await supabase.rpc('update_application_on_draft_return', {
            p_attachment_id: data,
            p_policy_number: formData.policyNumber,
            p_insured_name: formData.insuredName || null,
            p_reason: formData.reason || null,
            p_amount: formData.amount ? parseFloat(formData.amount.toString()) : null,
            p_return_date: formattedReturnDate,
            p_second_return_date: formattedSecondReturnDate,
            p_commission_status: commissionStatus // Valid value from constraint
          });
          
          // Add extra notification for application update
          toast({
            title: "Application Updated",
            description: `The policy ${formData.policyNumber} has been updated with the return information`,
          });
        } catch (updateError) {
          console.error('Error updating application:', updateError);
          // Don't throw here - we still want to save the attachment even if application update fails
          toast({
            title: "Warning",
            description: "Attachment saved but failed to update application data",
            variant: "destructive",
          });
        }
      }

      // Refresh the attachments list
      await fetchAttachments();
      
      toast({
        title: "Success",
        description: "Attachment data saved successfully",
      });

      return data as unknown as AttachmentWithDetails;
    } catch (err) {
      console.error('Error adding attachment:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error",
        description: "Failed to save attachment data",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAttachment = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // First, get the attachment to check if it has a file
      const { data: attachment, error: getError } = await supabase
        .from('attachments')
        .select('file_url, file_name')
        .eq('id', id)
        .single();

      if (getError) {
        throw getError;
      }

      // Delete the file if it exists
      if (attachment?.file_url) {
        const filePath = attachment.file_url.split('/').pop() || '';
        const { error: storageError } = await supabase.storage
          .from('attachments')
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting file:', storageError);
          // Continue with deletion of the record even if file deletion fails
        }
      }

      // Delete the attachment details first (cascade should handle this, but let's be explicit)
      const { error: detailsError } = await supabase
        .from('attachment_details')
        .delete()
        .eq('attachment_id', id);

      if (detailsError) {
        throw detailsError;
      }

      // Delete the attachment
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setAttachments(attachments.filter(a => a.id !== id));
      
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    attachments,
    loading,
    error,
    fetchAttachments,
    fetchRecentAttachmentsWithUrls,
    addAttachment,
    deleteAttachment
  };
}; 