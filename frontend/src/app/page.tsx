"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAbstraxionAccount, useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { FaArrowRight, FaPlus, FaUsers, FaShareAlt, FaCoins } from "react-icons/fa";

const CONTRACT_ADDRESS = "xion1p90a5la7jgscjy9jjwuvjmwedxas2ey0qt0apgxavh5csvdx47ssncuyd9";

export default function Home() {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured profiles
    const fetchProfiles = async () => {
      if (!queryClient) return;
      
      try {
        setLoading(true);
        const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
          list_profiles: { limit: 6 }
        });
        
        if (response.profiles) {
          setFeaturedProfiles(response.profiles);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (queryClient) {
      fetchProfiles();
    }
  }, [queryClient]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/2 -left-12 w-60 h-60 bg-purple-600 rounded-full opacity-10 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <div className="inline-block mb-8 animate-pulse-glow">
            <div className="bg-indigo-600 text-white p-3 skewed-border rotate-3 transform hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
            Support Creators You Love with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              TipChain
            </span>
          </h1>
          
          <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-300">
            A decentralized platform to tip creators, built on XION blockchain with
            gasless transactions and account abstraction.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/discover">
              <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                <span className="relative z-10 flex items-center">
                  Discover Creators
                  <FaArrowRight className="ml-2" />
                </span>
              </button>
            </Link>
            
            {account?.bech32Address ? (
              <Link href="/profile">
                <button className="group relative overflow-hidden rounded-full bg-[#1d293e] px-8 py-4 text-white transition-all hover:bg-[#252f44] active:scale-95 border border-indigo-500/30">
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-indigo-500 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                  <span className="relative z-10">My Profile</span>
                </button>
              </Link>
            ) : (
              <Link href="/create-profile">
                <button className="group relative overflow-hidden rounded-full bg-[#1d293e] px-8 py-4 text-white transition-all hover:bg-[#252f44] active:scale-95 border border-indigo-500/30">
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-indigo-500 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                  <span className="relative z-10 flex items-center">
                    <FaPlus className="mr-2" />
                    Create Your Profile
                  </span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              <span className="text-indigo-400">#</span> Trending Creators
            </h2>
            <Link href="/discover">
              <span className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center">
                View All
                <FaArrowRight className="ml-2 text-xs" />
              </span>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                </div>
                <p className="mt-4 text-indigo-300 font-medium">Loading creators...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProfiles.length > 0 ? (
                  featuredProfiles.map((profile, index) => (
                    <Link href={`/tip/${profile.username}`} key={index}>
                      <div className="bg-[#131929] funky-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] hover:shadow-indigo-500/10 border border-[#1d293e] group">
                        <div className="h-32 bg-[#0d121f] relative overflow-hidden">
                          {profile.banner_image ? (
                            <Image 
                              src={profile.banner_image} 
                              alt={`${profile.name}'s banner`}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="group-hover:scale-110 transition-all duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[#0d121f] animate-shimmer"></div>
                          )}
                          <div className="absolute inset-0 bg-[#0a0e17] opacity-20"></div>
                        </div>

                        <div className="p-5 relative">
                          <div className="absolute -top-10 left-4 rounded-full border-4 border-[#131929] overflow-hidden shadow-lg">
                            <div className="w-16 h-16 bg-[#0d121f] rounded-full relative">
                              {profile.profile_picture ? (
                                <Image 
                                  src={profile.profile_picture} 
                                  alt={profile.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-2xl text-indigo-400 font-bold">
                                  {profile.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-8">
                            <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                            <p className="text-indigo-400">@{profile.username}</p>
                            <p className="mt-2 line-clamp-2 text-gray-300">{profile.bio || "No bio provided."}</p>
                            
                            <div className="mt-4 pt-4 border-t border-[#1d293e]">
                              <button className="w-full py-2 rounded-lg bg-[#0d121f] text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 text-sm font-medium flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Send Tip
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-16 text-center bg-[#131929] rounded-[24px] border border-[#1d293e]">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-xl text-white mb-6">No profiles found. Be the first to create one!</p>
                    <Link href="/create-profile">
                      <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-6 py-3 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
                        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                        <span className="relative z-10 flex items-center">
                          <FaPlus className="mr-2" />
                          Create Profile
                        </span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 my-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-white text-center">
            How <span className="text-indigo-400">It Works</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
            Support your favorite creators with just a few clicks. No complicated setup, no gas fees.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-[#131929] p-8 rounded-[24px] border border-[#1d293e] transform hover:translate-y-[-8px] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="absolute -top-6 -right-6">
                <div className="blob-shape w-12 h-12 flex items-center justify-center bg-indigo-600 text-white font-bold">
                  1
                </div>
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 p-4 inline-flex items-center justify-center rounded-full mb-6">
                <FaUsers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Create Your Profile</h3>
              <p className="text-gray-400">
                Sign up with your social account or wallet. Add your bio, profile picture, and banner.
              </p>
            </div>
            
            <div className="relative bg-[#131929] p-8 rounded-[24px] border border-[#1d293e] transform hover:translate-y-[-8px] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 md:mt-8">
              <div className="absolute -top-6 -right-6">
                <div className="blob-shape w-12 h-12 flex items-center justify-center bg-indigo-600 text-white font-bold">
                  2
                </div>
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 p-4 inline-flex items-center justify-center rounded-full mb-6">
                <FaShareAlt className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Share Your Profile</h3>
              <p className="text-gray-400">
                Get your unique tipping link and share it with your audience.
              </p>
            </div>
            
            <div className="relative bg-[#131929] p-8 rounded-[24px] border border-[#1d293e] transform hover:translate-y-[-8px] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 md:mt-16">
              <div className="absolute -top-6 -right-6">
                <div className="blob-shape w-12 h-12 flex items-center justify-center bg-indigo-600 text-white font-bold">
                  3
                </div>
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 p-4 inline-flex items-center justify-center rounded-full mb-6">
                <FaCoins className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Receive Tips</h3>
              <p className="text-gray-400">
                Fans can easily tip you with just a few clicks, no gas fees required!
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/create-profile">
              <button className="group relative overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95">
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                <span className="relative z-10">Get Started Now</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
