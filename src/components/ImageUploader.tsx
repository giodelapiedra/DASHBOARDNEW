'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUploader = ({ onImageUpload, currentImage, className = '' }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload image
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Call the callback with the image URL
      onImageUpload(data.fileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 font-medium text-gray-700">Featured Image</div>
      
      {preview ? (
        <div className="relative mb-4">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-6 mb-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2 text-sm text-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
              Click to upload an image
            </label>
            <p className="mt-1">PNG, JPG, GIF, WEBP up to 5MB</p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        id="file-upload"
        name="file"
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {isUploading && (
        <div className="text-sm text-blue-600 mt-2">
          Uploading image...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 