import { useState, useEffect } from 'react';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
}

export default function useAttachments(applicationId?: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    async function fetchAttachments() {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call
        // For now, we'll mock some data
        const mockAttachments: Attachment[] = [
          {
            id: '1',
            name: 'document1.pdf',
            size: 1024 * 1024 * 2, // 2MB
            type: 'application/pdf',
            url: '/mock-url/document1.pdf',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'image1.jpg',
            size: 1024 * 512, // 512KB
            type: 'image/jpeg',
            url: '/mock-url/image1.jpg',
            createdAt: new Date().toISOString(),
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setAttachments(mockAttachments);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to fetch attachments');
        setLoading(false);
      }
    }

    fetchAttachments();
  }, [applicationId]);

  const uploadAttachment = async (file: File): Promise<Attachment> => {
    try {
      // In a real implementation, this would upload to a server
      // For now, we'll mock the response
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAttachments(prev => [...prev, newAttachment]);
      return newAttachment;
    } catch (err) {
      setError('Failed to upload attachment');
      throw new Error('Upload failed');
    }
  };

  const deleteAttachment = async (id: string): Promise<void> => {
    try {
      // In a real implementation, this would delete from a server
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAttachments(prev => prev.filter(attachment => attachment.id !== id));
    } catch (err) {
      setError('Failed to delete attachment');
      throw new Error('Delete failed');
    }
  };

  return {
    attachments,
    loading,
    error,
    uploadAttachment,
    deleteAttachment,
  };
} 