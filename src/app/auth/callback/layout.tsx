'use client';

import React from 'react';
import '../../../styles/globals.css';

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='auth-layout'>{children}</div>
  );
}
