"use client";
import { useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-dusk1 text-dusk6 py-4 px-6 flex flex-col md:flex-row items-center justify-between z-50 shadow-lg fade-in">
      <span className="mb-2 md:mb-0 text-sm">
        We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.
      </span>
      <button
        className="btn-primary px-6 py-2 text-sm rounded-full ml-0 md:ml-4 mt-2 md:mt-0"
        onClick={() => setVisible(false)}
      >
        Accept
      </button>
    </div>
  );
} 