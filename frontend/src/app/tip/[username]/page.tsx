"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Abstraxion, 
  useAbstraxionAccount, 
  useAbstraxionSigningClient, 
  useAbstraxionClient,
  useModal 
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { FaTwitter, FaGlobe, FaHeart, FaExternalLinkAlt, FaEdit, FaWallet } from "react-icons/fa";
import { getXionBalance, sendXionTokens } from "@/utils/tokenTransfer";

const CONTRACT_ADDRESS = "xion1p90a5la7jgscjy9jjwuvjmwedxas2ey0qt0apgxavh5csvdx47ssncuyd9";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const { client, signArb } = useAbstraxionSigningClient();
  const [, setShowModal] = useModal();
  
  // Memoize username to prevent unnecessary re-renders
  const memoizedUsername = useMemo(() => username, [username]);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tips, setTips] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  
  const [tipAmount, setTipAmount] = useState("5");
  const [tipMessage, setTipMessage] = useState("");
  const [tipping, setTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  
  // Balance states
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [remainingBalance, setRemainingBalance] = useState<string>("0");

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!queryClient) return;
      
      try {
        setLoading(true);
        const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
          get_profile: { username: memoizedUsername }
        });
        
        if (response.profile) {
          setProfile(response.profile);
          
          // Check if current user is the profile owner
          if (account?.bech32Address && response.profile.wallet_address === account.bech32Address) {
            setIsOwner(true);
          }
        } else {
          setError("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (queryClient) {
      fetchProfile();
    }
  }, [queryClient, memoizedUsername, account?.bech32Address]);

  // Fetch tips received
  useEffect(() => {
    const fetchTips = async () => {
      if (!queryClient || !memoizedUsername) return;
      
      try {
        const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
          get_tips_received: { username: memoizedUsername, limit: 10 }
        });
        
        if (response.tips) {
          setTips(response.tips);
        }
      } catch (error) {
        console.error("Error fetching tips:", error);
      }
    };
    
    if (queryClient && memoizedUsername) {
      fetchTips();
    }
  }, [queryClient, memoizedUsername, tipSuccess]);

  // Fetch user's XION balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!queryClient || !account?.bech32Address) return;
      
      try {
        setLoadingBalance(true);
        const balanceAmount = await getXionBalance(queryClient, account.bech32Address);
        setBalance(balanceAmount);
        updateRemainingBalance(balanceAmount, tipAmount);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoadingBalance(false);
      }
    };
    
    if (queryClient && account?.bech32Address) {
      fetchBalance();
    }
  }, [queryClient, account?.bech32Address]);
  
  // Update remaining balance when tip amount changes
  useEffect(() => {
    updateRemainingBalance(balance, tipAmount);
  }, [balance, tipAmount]);
  
  // Helper function to calculate remaining balance
  const updateRemainingBalance = (currentBalance: string, amount: string) => {
    try {
      const balanceNum = parseFloat(currentBalance);
      const amountNum = parseFloat(amount);
      
      if (isNaN(balanceNum) || isNaN(amountNum)) {
        setRemainingBalance("0");
        return;
      }
      
      const remaining = Math.max(0, balanceNum - amountNum).toFixed(6);
      setRemainingBalance(remaining);
    } catch (error) {
      console.error("Error calculating remaining balance:", error);
      setRemainingBalance("0");
    }
  };

  // Handle tip submission
  const handleTip = async () => {
    if (!client || !account?.bech32Address) {
      setShowModal(true);
      return;
    }
    
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    // Check if user has enough balance
    if (parseFloat(balance) < parseFloat(tipAmount)) {
      setError(`Insufficient balance. You have ${balance} XION available.`);
      return;
    }
    
    setTipping(true);
    setError("");
    
    try {
      // First, we need to get the recipient's wallet address
      if (!profile.wallet_address) {
        throw new Error("Recipient wallet address not found");
      }
      
      // 1. Send the actual XION tokens
      const transferResult = await sendXionTokens(
        client,
        account.bech32Address,
        profile.wallet_address,
        tipAmount
      );
      
      console.log("Token transfer result:", transferResult);
      
      // 2. Record the tip in the contract for tracking purposes
      const msg = {
        record_tip: {
          to_username: memoizedUsername,
          amount: tipAmount,
          message: tipMessage
        }
      };
      
      const result = await client.execute(
        account.bech32Address,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
      
      console.log("Tip recorded:", result);
      
      // Update balance after successful tip
      const newBalance = (parseFloat(balance) - parseFloat(tipAmount)).toFixed(6);
      setBalance(newBalance);
      setRemainingBalance(newBalance);
      
      setTipSuccess(true);
      setTipAmount("5");
      setTipMessage("");
      
      // Reset success message after a delay
      setTimeout(() => {
        setTipSuccess(false);
      }, 5000);
      
    } catch (error: any) {
      console.error("Error sending tip:", error);
      setError(error.message || "Failed to send tip. Please try again.");
    } finally {
      setTipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0e17]">
        <div className="flex flex-col items-center">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
            <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
            <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-indigo-300 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6 text-center bg-[#0a0e17] rounded-2xl">
        <div className="py-10">
          <div className="inline-block p-3 rounded-full bg-red-100 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          <Link href="/">
            <Button structure="base" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-3 transform hover:scale-105 transition-all duration-300">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6 text-center bg-[#0a0e17] rounded-2xl">
        <div className="py-10">
          <div className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="mb-6 text-gray-300">The profile you're looking for doesn't exist.</p>
          <Link href="/">
            <Button structure="base" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-3 transform hover:scale-105 transition-all duration-300">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 pb-12">
      {/* Abstraxion modal */}
      <Abstraxion key="tip-abstraxion" onClose={() => setShowModal(false)} />
      
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full bg-[#131929] overflow-hidden">
        {profile.banner_image ? (
          <Image 
            src={profile.banner_image} 
            alt={`${profile.name}'s banner`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            className="opacity-90"
          />
        ) : null}
        
        <div className="absolute inset-0 bg-[#0a0e17] opacity-20"></div>
        
        {isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <Link href="/create-profile">
              <Button structure="base" className="bg-[#0a0e17]/80 hover:bg-[#0a0e17] text-white border border-indigo-500 rounded-full px-5 py-2 flex items-center backdrop-blur-sm">
                <FaEdit className="mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="relative max-w-5xl mx-auto -mt-24 px-4">
        <div className="bg-[#131929] rounded-[32px] shadow-[0_8px_32px_rgba(31,41,55,0.2)] p-6 md:p-8 border border-[#1d293e]">
          <div className="flex flex-col md:flex-row">
            {/* Profile Picture */}
            <div className="relative -mt-24 mb-4 md:mb-0 md:mr-6">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0a0e17] rounded-full border-4 border-[#131929] overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                {profile.profile_picture ? (
                  <Image 
                    src={profile.profile_picture} 
                    alt={profile.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl text-indigo-400 font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              <p className="text-indigo-400 dark:text-indigo-400 text-lg mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <div className="mb-4">
                  <p className="whitespace-pre-line text-gray-300">{profile.bio}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mb-4">
                {profile.twitter && (
                  <a 
                    href={`https://twitter.com/${profile.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-[#1d293e] text-blue-400 hover:text-blue-300 px-4 py-2 rounded-full text-sm transition-all hover:bg-[#252f44]"
                  >
                    <FaTwitter className="mr-2" />
                    <span>@{profile.twitter}</span>
                  </a>
                )}
                
                {profile.website && (
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-[#1d293e] text-blue-400 hover:text-blue-300 px-4 py-2 rounded-full text-sm transition-all hover:bg-[#252f44]"
                  >
                    <FaGlobe className="mr-2" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Tip Section */}
          {!isOwner && (
            <div className="mt-12 p-8 bg-[#0d121f] rounded-[24px] border border-[#1d293e]">
              <h2 className="text-xl font-bold mb-6 text-white">Send a Tip to {profile.name}</h2>
              
              {/* User Balance Information */}
              <div className="mb-6 p-4 bg-[#131929] rounded-[16px] border border-[#1d293e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-indigo-500/20 p-2 rounded-full mr-3">
                      <FaWallet className="text-indigo-400" />
                    </div>
                    <span className="font-medium text-gray-300">Your Balance:</span>
                  </div>
                  
                  {loadingBalance ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : (
                    <span className="font-bold text-white">{balance} XION</span>
                  )}
                </div>
                
                {parseFloat(tipAmount) > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1d293e]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">After this tip:</span>
                      <span className={`font-medium ${parseFloat(remainingBalance) < 0 ? 'text-red-400' : 'text-indigo-400'}`}>
                        {remainingBalance} XION
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {tipSuccess && (
                <div className="mb-6 p-4 bg-green-900/20 border border-green-800/30 text-green-400 rounded-[16px] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your tip was sent successfully! Thank you for supporting {profile.name}.
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
              
              <div className="mb-6">
                <label htmlFor="tipAmount" className="block text-sm font-medium mb-2 text-gray-300">
                  Amount (XION)
                </label>
                <div className="flex max-w-xs">
                  <input
                    type="number"
                    id="tipAmount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="flex-1 px-4 py-3 rounded-l-[16px] border border-[#1d293e] bg-[#131929] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Amount"
                  />
                  <span className="inline-flex items-center px-4 rounded-r-[16px] border border-l-0 border-[#1d293e] bg-[#0d121f] text-indigo-400">
                    XION
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="tipMessage" className="block text-sm font-medium mb-2 text-gray-300">
                  Message (Optional)
                </label>
                <textarea
                  id="tipMessage"
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-[16px] border border-[#1d293e] bg-[#131929] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a message with your tip..."
                  rows={3}
                />
              </div>
              
              <button
                onClick={handleTip}
                disabled={tipping}
                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-indigo-600 text-white font-medium overflow-hidden transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                {tipping ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center relative z-10">
                    <FaHeart className="mr-2" />
                    Send Tip
                  </span>
                )}
              </button>
            </div>
          )}
          
          {/* Recent Tips Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 text-white">Recent Support</h2>
            
            {tips.length > 0 ? (
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="p-5 bg-[#0d121f] rounded-[16px] border border-[#1d293e] transform transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-white">{tip.from_name || tip.from_username || 'Anonymous'}</div>
                      <div className="text-indigo-400 font-bold px-3 py-1 bg-indigo-500/10 rounded-full text-sm">
                        {tip.amount} XION
                      </div>
                    </div>
                    {tip.message && (
                      <p className="text-gray-300 bg-[#131929] p-3 rounded-[12px] my-2">{tip.message}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(tip.timestamp * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#0d121f] rounded-[16px] border border-[#1d293e] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-300">No tips received yet. Be the first to support {profile.name}!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 