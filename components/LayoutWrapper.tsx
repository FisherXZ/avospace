'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import AvoMailPanel from './AvoMailPanel';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAvoMailOpen, setIsAvoMailOpen] = useState(false);

  const toggleAvoMail = () => {
    setIsAvoMailOpen(!isAvoMailOpen);
  };

  return (
    <>
      <Navbar onAvoMailToggle={toggleAvoMail} />
      {children}
      <AvoMailPanel isOpen={isAvoMailOpen} onClose={() => setIsAvoMailOpen(false)} />
    </>
  );
}

