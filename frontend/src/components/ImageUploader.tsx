"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FaCamera, FaTrash, FaSpinner } from "react-icons/fa";
import { uploadToCloudinary } from "@/utils/cloudinaryUploader";

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  type: "profile" | "banner";
}

export default function ImageUploader({ imageUrl, onImageChange, type }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload image to Cloudinary
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update parent component with the new image URL
      onImageChange(result.secure_url);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onImageChange]);

  const handleRemoveImage = useCallback(() => {
    onImageChange("");
  }, [onImageChange]);

  const openFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div 
      className={`relative ${type === "banner" ? "h-48 w-full" : "h-24 w-24"} 
        ${type === "banner" ? "rounded-[16px]" : "rounded-full"} 
        overflow-hidden bg-[#0d121f] border border-[#1d293e] cursor-pointer
        transition-all hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20`}
      onClick={openFileInput}
    >
      
      {/* Image preview */}
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={type === "banner" ? "Banner image" : "Profile picture"}
          fill
          style={{ objectFit: 'cover' }}
          className="z-0"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
          <FaCamera className="mb-2 text-indigo-400" size={type === "banner" ? 24 : 18} />
          {type === "profile" ? (
            <span className="text-sm text-indigo-400">Upload</span>
          ) : (
            <span className="text-sm text-indigo-400">Click to upload image</span>
          )}
        </div>
      )}

      {/* Upload progress overlay */}
      {uploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
          <FaSpinner className="animate-spin text-white mb-2" size={type === "banner" ? 30 : 20} />
          <div className="w-3/4 bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-indigo-500 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-white text-xs mt-1">{uploadProgress}%</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center">
          {error}
        </div>
      )}

      {/* Only show the delete button, as the entire area is now clickable for uploading */}
      {imageUrl && (
        <div className={`absolute ${type === "banner" ? "bottom-4 right-4" : "bottom-0 right-0"} z-10`}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the container's onClick
              handleRemoveImage();
            }}
            className={`${type === "banner" 
              ? "bg-[#0a0e17]/80 hover:bg-red-800 text-white border border-red-500 p-3 rounded-full transition-all backdrop-blur-sm" 
              : "bg-black bg-opacity-70 p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-opacity-80 transition-all"}`}
            disabled={uploading}
          >
            <FaTrash size={type === "banner" ? 16 : 14} />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 