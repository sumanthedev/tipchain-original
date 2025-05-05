"use client";

import { useRouter } from 'next/navigation';
import { FaEdit } from 'react-icons/fa';

interface EditProfileButtonProps {
  profile: any;
}

export default function EditProfileButton({ profile }: EditProfileButtonProps) {
  const router = useRouter();

  const handleEditProfile = () => {
    // Store profile data in sessionStorage for the edit page to access
    if (profile) {
      sessionStorage.setItem('editProfileData', JSON.stringify(profile));
      router.push('/create-profile');
    }
  };

  return (
    <button 
      onClick={handleEditProfile}
      className="bg-[#0a0e17]/80 hover:bg-[#0a0e17] text-white border border-indigo-500 rounded-full px-5 py-2 flex items-center backdrop-blur-sm transition-all"
    >
      <FaEdit className="mr-2" />
      Edit Profile
    </button>
  );
} 