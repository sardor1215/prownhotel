'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-light">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-dusk6 mb-4">Something went wrong!</h2>
            <p className="text-dusk5 mb-6">
              {error.message || 'An unexpected error occurred. Please try again later.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                onClick={() => reset()}
              >
                Try again
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
