import React from 'react';
import Link from 'next/link';

interface ApplicationActionsProps {
  applicationId: string;
  status?: string;
}

export default function ApplicationActions({ applicationId, status }: ApplicationActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Link 
        href={`/agent/applications/${applicationId}`}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        View
      </Link>
      <Link 
        href={`/agent/applications/${applicationId}/edit`}
        className="text-green-600 hover:text-green-800 underline"
      >
        Edit
      </Link>
      {status !== 'Completed' && (
        <button 
          className="text-red-600 hover:text-red-800 underline"
          onClick={() => {
            if (confirm('Are you sure you want to delete this application?')) {
              // Delete logic would go here in a real implementation
              console.log('Delete application', applicationId);
            }
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
} 