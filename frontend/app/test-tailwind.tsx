'use client';

export default function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
      <div className="p-4 bg-blue-100 rounded-lg shadow">
        <p className="text-blue-800">
          If you can see this text with proper styling, Tailwind CSS is working correctly!
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}
