'use client'

export default function PreviewPage() {
  return (
    <div className="h-screen w-full p-8">
      <h1 className="text-3xl font-bold mb-4">Role Views Preview</h1>
      <p className="mb-8">This page is temporarily simplified for production builds.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Manager View</h2>
          <p>Shows dashboard with agent performance metrics, application status, and financial analytics.</p>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Agent View</h2>
          <p>Shows dashboard with commission tracking, application status, and client management tools.</p>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Admin View</h2>
          <p>Shows dashboard with user management, system settings, and organization-wide analytics.</p>
        </div>
      </div>
    </div>
  )
} 