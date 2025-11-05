'use client';

import React from 'react';
import { getImageUrl } from '../utils/image';
import Image from 'next/image';

export default function TestImagesPage() {
  const testImages = [
    '/uploads/test-image-1.jpg',
    '/uploads/test-image-2.jpg',
    'https://orbashower.com/uploads/test-image-3.jpg',
    'https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Image',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Loading Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
            </div>
            <div>
              <strong>Backend URL:</strong> {process.env.NODE_ENV === 'production' ? 'https://orbashower.com' : 'http://localhost:5000'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testImages.map((imagePath, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium mb-3">Test Image {index + 1}</h3>
              <p className="text-sm text-gray-600 mb-3">Original: {imagePath}</p>
              <p className="text-sm text-gray-600 mb-3">Processed: {getImageUrl(imagePath)}</p>
              
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(imagePath)}
                  alt={`Test image ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image ${index + 1}:`, imagePath);
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-shower.svg';
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image ${index + 1}:`, imagePath);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Placeholder Image Test</h2>
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden w-64">
            <Image
              src="/images/placeholder-shower.svg"
              alt="Placeholder image"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
