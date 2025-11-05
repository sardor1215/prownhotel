'use client'

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  uploadEndpoint?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  uploadEndpoint = '/api/upload',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when value changes
  useEffect(() => {
    if (value?.startsWith('blob:') || value?.startsWith('data:image') || value?.startsWith('/uploads/')) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onChange) return;

      // Basic validation
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Prepare form data with the correct field name
      const formData = new FormData();
      formData.append('image', file);

      try {
        setIsUploading(true);
        setError(null);

        // Upload to server
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let the browser set it with the correct boundary
          headers: {},
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        
        // Update parent component with the new image URL
        if (data.url) {
          onChange(data.url);
        } else {
          throw new Error('No URL returned from server');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, uploadEndpoint]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Clean up object URL if it exists
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      onChange('');
    },
    [onChange, previewUrl]
  );

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative aspect-square w-full rounded-md overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover w-full h-full"
            onLoad={() => {
              // Revoke the data URL to avoid memory leaks
              if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
              }
            }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              disabled={isUploading}
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        className={`
          flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg 
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'} 
          transition-colors ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mb-2 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-primary-600 hover:text-primary-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
