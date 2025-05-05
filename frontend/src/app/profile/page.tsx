"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { FaEdit, FaShareAlt, FaCopy, FaCheck, FaExternalLinkAlt, FaWallet, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { getXionBalance } from "@/utils/tokenTransfer";
import ImageUploader from "@/components/ImageUploader";
import EditProfileButton from "@/components/EditProfileButton";

const CONTRACT_ADDRESS = "xion1p90a5la7jgscjy9jjwuvjmwedxas2ey0qt0apgxavh5csvdx47ssncuyd9";

export default function ProfilePage() {
  const router = useRouter();
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [, setShowModal] = useModal();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipsReceived, setTipsReceived] = useState<any[]>([]);
  const [tipSent, setTipSent] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  const [activeTab, setActiveTab] = useState("received");
  const [copied, setCopied] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // Fetch data only once when wallet is connected and client is ready
  const fetchData = useCallback(async () => {
    if (!queryClient || !account?.bech32Address) return;
    
    try {
      setLoading(true);
      
      // Fetch balance
      try {
        const balanceAmount = await getXionBalance(queryClient, account.bech32Address);
        setBalance(balanceAmount);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
      
      // Fetch profile
      try {
        const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
          get_profile_by_wallet: { wallet: account.bech32Address }
        });
        
        if (response && response.profile) {
          setProfile(response.profile);
          
          // Fetch tips and stats for the profile
          try {
            const username = response.profile.username;
            
            // Fetch tips received
            const receivedResponse = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
              get_tips_received: { username, limit: 20 }
            });
            
            if (receivedResponse && receivedResponse.tips) {
              setTipsReceived(receivedResponse.tips);
            }
            
            // Fetch tips sent
            const sentResponse = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
              get_tips_sent: { username, limit: 20 }
            });
            
            if (sentResponse && sentResponse.tips) {
              setTipSent(sentResponse.tips);
            }
            
            // Fetch user stats
            const statsResponse = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
              get_user_stats: { username }
            });
            
            if (statsResponse && statsResponse.stats) {
              setStats(statsResponse.stats);
            }
          } catch (error) {
            console.error("Error fetching tips and stats:", error);
          }
        } else {
          setError("You don't have a profile yet");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load your profile");
      }
    } finally {
      setLoading(false);
      setProfileChecked(true);
    }
  }, [queryClient, account?.bech32Address]);

  // Fetch data once when the component mounts and wallet is connected
  useEffect(() => {
    if (queryClient && account?.bech32Address && !profileChecked) {
      fetchData();
    }
  }, [queryClient, account?.bech32Address, fetchData, profileChecked]);

  // Handle copy profile link
  const copyProfileLink = () => {
    if (!profile?.username) return;
    
    const url = `${window.location.origin}/tip/${profile.username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Show connect wallet modal if not connected
  useEffect(() => {
    if (!account?.bech32Address && !loading && profileChecked) {
      setShowModal(true);
    }
  }, [account, loading, setShowModal, profileChecked]);

  // Loading state
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

  // Not connected state
  if (!account?.bech32Address) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6 text-center bg-[#0a0e17]">
        <div className="py-10">
          <div className="inline-block p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h1>
          <p className="mb-6 text-gray-300">Please connect your wallet to view your profile.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95"
          >
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
            <span className="relative z-10">Connect Wallet</span>
          </button>
        </div>
        
        {/* Abstraxion modal */}
        <Abstraxion onClose={() => setShowModal(false)} />
      </div>
    );
  }

  // No profile state
  if (error && !profile && profileChecked) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6 text-center bg-[#0a0e17] rounded-2xl">
        <div className="py-10">
          <div className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">No Profile Found</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          <Link href="/create-profile">
            <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              <span className="relative z-10">Create Your Profile</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Create profile prompt
  if (!profile && profileChecked) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6 text-center bg-[#0a0e17] rounded-2xl">
        <div className="py-10">
          <div className="inline-block p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Create Your Profile</h1>
          <p className="mb-6 text-gray-300">You don't have a profile yet. Create one to start receiving tips!</p>
          <Link href="/create-profile">
            <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              <span className="relative z-10">Create Profile</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Profile exists - show profile page
  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 pb-12">
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
        
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <EditProfileButton profile={profile} />
          
          <button 
            className="bg-[#0a0e17]/80 hover:bg-[#0a0e17] text-white border border-indigo-500 rounded-full px-5 py-2 flex items-center backdrop-blur-sm transition-all"
            onClick={copyProfileLink}
          >
            {copied ? (
              <>
                <FaCheck className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <FaShareAlt className="mr-2" />
                Share
              </>
            )}
          </button>
        </div>
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                  <p className="text-indigo-400 text-lg">@{profile.username}</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <Link href={`/tip/${profile.username}`} target="_blank" rel="noopener noreferrer">
                    <button className="group relative overflow-hidden rounded-full bg-[#1d293e] px-5 py-2 text-white transition-all hover:bg-[#252f44] active:scale-95 border border-indigo-500/30">
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-indigo-500 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                      <span className="relative z-10 flex items-center">
                        <FaExternalLinkAlt className="mr-2" />
                        View Public Profile
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* XION Balance */}
              <div className="mt-4 p-4 bg-[#0d121f] rounded-[16px] border border-[#1d293e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-indigo-500/20 p-2 rounded-full mr-3">
                      <FaWallet className="text-indigo-400" />
                    </div>
                    <span className="font-medium text-gray-300">Your XION Balance:</span>
                  </div>
                  
                  {loadingBalance ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : (
                    <span className="font-bold text-white">{balance} XION</span>
                  )}
                </div>
              </div>
              
              {profile.bio && (
                <div className="mt-4">
                  <p className="whitespace-pre-line text-gray-300">{profile.bio}</p>
                </div>
              )}
              
              {/* Share Profile Link */}
              <div className="mt-6 p-3 bg-[#0d121f] rounded-[16px] border border-[#1d293e] flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate pr-2">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/tip/${profile.username}`}
                </span>
                <button 
                  className="bg-[#1d293e] hover:bg-[#252f44] text-white p-2 rounded-full"
                  onClick={copyProfileLink}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 bg-[#0d121f] rounded-[24px] border border-[#1d293e]">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{stats.total_tips_received || 0}</div>
                <div className="text-sm text-gray-400">Tips Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{stats.total_tips_sent || 0}</div>
                <div className="text-sm text-gray-400">Tips Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{stats.total_amount_received || 0} XION</div>
                <div className="text-sm text-gray-400">Amount Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{stats.total_amount_sent || 0} XION</div>
                <div className="text-sm text-gray-400">Amount Sent</div>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="mt-8 border-b border-[#1d293e]">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("received")}
                className={`pb-4 text-sm font-medium ${
                  activeTab === "received"
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Tips Received
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`pb-4 text-sm font-medium ${
                  activeTab === "sent"
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Tips Sent
              </button>
            </div>
          </div>
          
          {/* Tips Content */}
          <div className="mt-6">
            {activeTab === "received" ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-white">Tips You've Received</h2>
                
                {tipsReceived.length > 0 ? (
                  <div className="space-y-4">
                    {tipsReceived.map((tip, index) => (
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
                    <p className="text-gray-300">You haven't received any tips yet. Share your profile to start receiving tips!</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-white">Tips You've Sent</h2>
                
                {tipSent.length > 0 ? (
                  <div className="space-y-4">
                    {tipSent.map((tip, index) => (
                      <div key={index} className="p-5 bg-[#0d121f] rounded-[16px] border border-[#1d293e] transform transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-2">
                          <Link href={`/tip/${tip.to_username}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                            {tip.to_name || tip.to_username}
                          </Link>
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
                    <p className="text-gray-300 mb-4">You haven't sent any tips yet.</p>
                    <Link href="/discover">
                      <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-6 py-3 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
                        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                        <span className="relative z-10 flex items-center">
                          <FaArrowRight className="mr-2" />
                          Discover Creators
                        </span>
                      </button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Abstraxion modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </div>
  );
} 