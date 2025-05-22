'use client';

import React from 'react';
import '../../../styles/globals.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>{children}</div>
  );
}
