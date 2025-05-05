"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { FaSpinner } from "react-icons/fa";
import ImageUploader from "@/components/ImageUploader";

const CONTRACT_ADDRESS = "xion1p90a5la7jgscjy9jjwuvjmwedxas2ey0qt0apgxavh5csvdx47ssncuyd9";

export default function CreateProfile() {
  const router = useRouter();
  const { data: account } = useAbstraxionAccount();
  const { client, logout } = useAbstraxionSigningClient();
  
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!account?.bech32Address || !client) return;
      
      // Check if we have profile data in sessionStorage (from edit button)
      const storedProfileData = typeof window !== 'undefined' 
        ? sessionStorage.getItem('editProfileData') 
        : null;
        
      if (storedProfileData) {
        try {
          const parsedProfile = JSON.parse(storedProfileData);
          setExistingProfile(parsedProfile);
          // Pre-fill form with existing data
          setUsername(parsedProfile.username || "");
          setName(parsedProfile.name || "");
          setBio(parsedProfile.bio || "");
          setProfilePicture(parsedProfile.profile_picture || "");
          setBannerImage(parsedProfile.banner_image || "");
          setTwitter(parsedProfile.twitter || "");
          setWebsite(parsedProfile.website || "");
          setIsUpdating(true);
          
          // Clear the stored data to avoid issues with future profile creations
          sessionStorage.removeItem('editProfileData');
          return; // Skip API call since we already have the data
        } catch (error) {
          console.error("Error parsing stored profile data:", error);
          // Continue with regular API call in case of error
          sessionStorage.removeItem('editProfileData');
        }
      }
      
      try {
        const response = await client.queryContractSmart(CONTRACT_ADDRESS, {
          get_profile_by_wallet: { wallet: account.bech32Address }
        });
        
        if (response && response.profile) {
          setExistingProfile(response.profile);
          // Pre-fill form with existing data
          setUsername(response.profile.username || "");
          setName(response.profile.name || "");
          setBio(response.profile.bio || "");
          setProfilePicture(response.profile.profile_picture || "");
          setBannerImage(response.profile.banner_image || "");
          setTwitter(response.profile.twitter || "");
          setWebsite(response.profile.website || "");
          setIsUpdating(true);
        }
      } catch (error) {
        console.error("Error checking existing profile:", error);
      }
    };
    
    if (account?.bech32Address && client) {
      checkExistingProfile();
    }
  }, [account, client]);

  // Check if username is available
  const checkUsernameAvailability = async () => {
    if (!username || username.length < 3 || !client) return;
    
    // Skip checking availability when updating and username hasn't changed
    if (isUpdating && existingProfile && existingProfile.username === username) {
      setIsUsernameAvailable(true);
      setError("");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await client.queryContractSmart(CONTRACT_ADDRESS, {
        is_username_available: { username }
      });
      
      console.log("Username availability response:", response);
      
      // Fix: Check for the correct response structure
      // The CLI returns: {"data":{"is_available":true}}
      const isAvailable = response?.is_available || response?.data?.is_available || response?.available || false;
      
      setIsUsernameAvailable(isAvailable);
      if (!isAvailable && !isUpdating) {
        setError("This username is already taken. Please choose another one.");
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Error checking username availability:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) return;
    
    // If updating and username hasn't changed, skip the check
    if (isUpdating && existingProfile && existingProfile.username === username) {
      console.log("Skipping username check in update mode for current username:", username);
      setIsUsernameAvailable(true);
      setError("");
      return;
    }
    
    console.log("Will check availability for username:", username);
    const timer = setTimeout(() => {
      checkUsernameAvailability();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [username, isUpdating, existingProfile]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.bech32Address) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    
    if (!name) {
      setError("Name is required");
      return;
    }
    
    // If we're not in update mode, double-check username availability before submission
    if (!isUpdating) {
      try {
        const response = await client?.queryContractSmart(CONTRACT_ADDRESS, {
          is_username_available: { username }
        });
        
        console.log("Username availability at submit:", response);
        
        // Use the same response structure checking
        const isAvailable = response?.is_available || response?.data?.is_available || response?.available || false;
        
        if (!isAvailable) {
          setError("This username is already taken. Please choose another one.");
          return;
        }
      } catch (error) {
        console.error("Error checking username availability on submit:", error);
      }
    }
    
    setLoading(true);
    setError("");
    
    try {
      let msg = {};
      
      if (isUpdating) {
        msg = {
          update_profile: {
            username,
            name,
            bio,
            profile_picture: profilePicture,
            banner_image: bannerImage,
            twitter,
            website
          }
        };
      } else {
        msg = {
          register_profile: {
            username,
            name,
            bio,
            profile_picture: profilePicture,
            banner_image: bannerImage,
            twitter,
            website
          }
        };
      }
      
      const result = await client?.execute(
        account.bech32Address,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
      
      console.log("Profile created/updated:", result);
      setSuccessMessage(isUpdating ? "Profile updated successfully!" : "Profile created successfully!");
      
      // Store profile data in sessionStorage to prefill if user returns to this page
      const updatedProfile = {
        username,
        name,
        bio,
        profile_picture: profilePicture,
        banner_image: bannerImage,
        twitter,
        website,
        wallet_address: account.bech32Address
      };
      
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('updatedProfile', JSON.stringify(updatedProfile));
        }
      } catch (error) {
        console.error("Error storing profile data:", error);
      }
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push(`/tip/${username}`);
      }, 2000);
      
    } catch (error: any) {
      console.error("Error creating/updating profile:", error);
      setError(error.message || "Failed to create/update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-[#131929] rounded-[32px] border border-[#1d293e] text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Create Your Profile</h1>
        <p className="text-center mb-6 text-gray-300">Please connect your wallet to create a profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-[#131929] rounded-[32px] border border-[#1d293e] text-gray-100 shadow-[0_8px_32px_rgba(31,41,55,0.2)]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">
        {isUpdating ? "Update Your Profile" : "Create Your Profile"}
      </h1>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-800/30 text-green-400 rounded-[16px] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 text-red-400 rounded-[16px] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Banner Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Banner Image</label>
          <ImageUploader 
            imageUrl={bannerImage}
            onImageChange={setBannerImage}
            type="banner"
          />
        </div>
        
        {/* Profile Picture Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Profile Picture</label>
          <div className="flex items-center">
            <ImageUploader 
              imageUrl={profilePicture}
              onImageChange={setProfilePicture}
              type="profile"
            />
            
            <div className="ml-4">
              <p className="text-sm text-gray-400">
                Upload a profile picture to make your profile more personal.
              </p>
            </div>
          </div>
        </div>
        
        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-300">
            Username (Required)
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className={`w-full px-4 py-3 rounded-[16px] border ${
              !isUsernameAvailable && !(isUpdating && existingProfile && existingProfile.username === username) ? 'border-red-500' : 'border-[#1d293e]'
            } bg-[#0d121f] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isUpdating ? 'opacity-70' : ''}`}
            placeholder="your_username"
            disabled={isUpdating}
            required
          />
          {!isUsernameAvailable && !(isUpdating && existingProfile && existingProfile.username === username) && (
            <p className="mt-1 text-sm text-red-400">Username already taken</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Only lowercase letters, numbers, and underscores are allowed. {isUpdating ? "Username cannot be changed." : "Cannot be changed later."}
          </p>
        </div>
        
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
            Display Name (Required)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-[16px] border border-[#1d293e] bg-[#0d121f] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your Name"
            required
          />
        </div>
        
        {/* Bio */}
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium mb-2 text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-[16px] border border-[#1d293e] bg-[#0d121f] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell others about yourself..."
            rows={4}
          />
        </div>
        
        {/* Twitter */}
        <div className="mb-4">
          <label htmlFor="twitter" className="block text-sm font-medium mb-2 text-gray-300">
            Twitter/X Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-[16px] border border-r-0 border-[#1d293e] bg-[#131929] text-gray-400">
              @
            </span>
            <input
              type="text"
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value.replace('@', ''))}
              className="flex-1 px-4 py-3 rounded-r-[16px] border border-[#1d293e] bg-[#0d121f] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="username"
            />
          </div>
        </div>
        
        {/* Website */}
        <div className="mb-6">
          <label htmlFor="website" className="block text-sm font-medium mb-2 text-gray-300">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-3 rounded-[16px] border border-[#1d293e] bg-[#0d121f] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://your-website.com"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="group relative overflow-hidden rounded-full bg-indigo-600 w-full px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-full group-hover:h-96 opacity-10"></span>
          {loading ? (
            <span className="flex items-center justify-center relative z-10">
              <FaSpinner className="animate-spin mr-2" />
              {isUpdating ? "Updating Profile..." : "Creating Profile..."}
            </span>
          ) : (
            <span className="relative z-10">{isUpdating ? "Update Profile" : "Create Profile"}</span>
          )}
        </button>
      </form>
    </div>
  );
} 