'use client'

import { useState, useCallback, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getImageUrl } from '../utils/image';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('Current uploaded images in MultiImageUpload:', images);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Check if adding these files would exceed the limit
      if (images.length + files.length > maxImages) {
        setError(`You can only upload up to ${maxImages} images`);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const uploadPromises = files.map(async (file) => {
          console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
          
          // Basic validation
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} is not an image file`);
          }

          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} is too large (max 10MB)`);
          }

          // Prepare form data
          const formData = new FormData();
          formData.append('image', file);

          try {
            // Upload to server
            console.log('Sending request to:', `${API_BASE_URL}/upload`);
            const response = await fetch(`${API_BASE_URL}/upload`, {
              method: 'POST',
              body: formData,
            });

            console.log('Upload response status:', response.status);
            const data = await response.json().catch(() => ({}));
            console.log('Upload response data:', data);

            if (!response.ok) {
              throw new Error(data.error || `Failed to upload ${file.name}`);
            }

            if (!data.url) {
              throw new Error(`No URL returned for ${file.name}`);
            }

            console.log('Successfully uploaded:', data.url);
            return data.url;
          } catch (uploadError) {
            console.error('Error in upload process:', uploadError);
            throw uploadError;
          }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        console.log('All uploads completed. New image URLs:', uploadedUrls);
        console.log('Current images before update:', images);
        
        const newImages = [...images, ...uploadedUrls];
        console.log('Setting new images array:', newImages);
        onImagesChange(newImages);
        
        // Clear the input
        e.target.value = '';
      } catch (err) {
        console.error('Upload error:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload images');
      } finally {
        setIsUploading(false);
      }
    },
    [images, onImagesChange, maxImages]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent, indexToRemove: number) => {
      e.stopPropagation();
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className={`border-2 border-dashed ${images.length >= maxImages ? 'border-red-200 bg-red-50' : 'border-gray-300 hover:border-blue-400'} rounded-lg p-6 text-center transition-colors`}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${
            isUploading || images.length >= maxImages ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <div className="text-sm text-gray-600">
              {isUploading ? (
                'Uploading...'
              ) : images.length >= maxImages ? (
                `Maximum ${maxImages} images reached`
              ) : (
                <>
                  <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                </>
              )}
            </div>
            <div className={`text-xs ${images.length >= maxImages ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {images.length >= maxImages ? (
                'Maximum images reached'
              ) : (
                `PNG, JPG, GIF up to 10MB (${images.length}/${maxImages})`
              )}
            </div>
          </div>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images ({images.length}/{maxImages})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-50 relative flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <img
                      src={getImageUrl(imageUrl)}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error(`Failed to load image: ${imageUrl}`);
                        target.src = '/images/placeholder-shower.svg';
                      }}
                      onLoad={() => console.log(`Successfully loaded: ${imageUrl}`)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {imageUrl.split('/').pop()}
                    </div>
                  </div>
                  
                  {/* Image number badge */}
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </div>
                  
                  {/* Main image indicator */}
                  {index === 0 && (
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      Main
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-md z-10"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                {/* Image filename or status */}
                <div className="p-1.5 text-center">
                  <p className="text-xs text-gray-500 truncate px-1">
                    {imageUrl.split('/').pop() || `image-${index + 1}.jpg`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
