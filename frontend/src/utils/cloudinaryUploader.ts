import { Cloudinary } from "@cloudinary/url-gen";
import axios from 'axios';

const cloudName = "f22";
const uploadPreset = "tipchain"

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

/**
 * Upload a file directly to Cloudinary
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the upload result
 */
export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ secure_url: string; public_id: string }> => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      }
    );

    return {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Creates a custom file input with preview and upload functionality
 */
export const createFileInput = (
  accept = 'image/*',
  multiple = false
): HTMLInputElement => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = accept;
  fileInput.multiple = multiple;
  fileInput.style.display = 'none';
  return fileInput;
}; 
