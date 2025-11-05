import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-dusk6 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-dusk5 mb-4">Page Not Found</h2>
        <p className="text-dusk5 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
