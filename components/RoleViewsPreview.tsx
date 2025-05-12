import React from 'react';

export const RoleViewsPreview = ({ type = 'admin' }) => {
  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Role Views Preview</h3>
      <p>This is a placeholder for the {type} role views preview component.</p>
    </div>
  );
};

export default RoleViewsPreview; 