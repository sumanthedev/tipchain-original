"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const CONTRACT_ADDRESS = "xion1p90a5la7jgscjy9jjwuvjmwedxas2ey0qt0apgxavh5csvdx47ssncuyd9";
const PROFILES_PER_PAGE = 9;

export default function DiscoverPage() {
  const { client: queryClient } = useAbstraxionClient();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastProfileId, setLastProfileId] = useState<string | null>(null);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!queryClient) return;
      
      try {
        setLoading(true);
        
        // Create the query object based on whether we have a lastProfileId
        const query = lastProfileId 
          ? { list_profiles: { limit: 50, start_after: lastProfileId } }
          : { list_profiles: { limit: 50 } };
        
        const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, query);
        
        if (response.profiles) {
          if (lastProfileId) {
            setProfiles(prev => [...prev, ...response.profiles]);
          } else {
            setProfiles(response.profiles);
          }
          
          // Check if there might be more profiles
          setHasMoreProfiles(response.profiles.length === 50);
          
          // Set the last profile ID for pagination
          if (response.profiles.length > 0) {
            setLastProfileId(response.profiles[response.profiles.length - 1].username);
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setError("Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };
    
    if (queryClient) {
      fetchProfiles();
    }
  }, [queryClient, lastProfileId]);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProfiles(profiles);
      setTotalPages(Math.ceil(profiles.length / PROFILES_PER_PAGE));
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = profiles.filter(profile => 
      profile.username.toLowerCase().includes(query) || 
      profile.name.toLowerCase().includes(query) ||
      (profile.bio && profile.bio.toLowerCase().includes(query))
    );
    
    setFilteredProfiles(filtered);
    setTotalPages(Math.ceil(filtered.length / PROFILES_PER_PAGE));
    setCurrentPage(1);
  }, [searchQuery, profiles]);

  // Get current page profiles
  const getCurrentPageProfiles = () => {
    const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
    const endIndex = startIndex + PROFILES_PER_PAGE;
    return filteredProfiles.slice(startIndex, endIndex);
  };

  // Load more profiles
  const loadMoreProfiles = () => {
    if (hasMoreProfiles && !loading) {
      // The lastProfileId is already set in the main useEffect
      // Just trigger a re-fetch by updating a state
      setLoading(true);
    }
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    // If we're near the end and there might be more profiles, load them
    if (page === totalPages && hasMoreProfiles && filteredProfiles.length < profiles.length + 10) {
      loadMoreProfiles();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Discover Creators</h1>
      
      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or bio..."
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="max-w-xl mx-auto mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Profiles Grid */}
      {loading && profiles.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentPageProfiles().map((profile, index) => (
                <Link href={`/tip/${profile.username}`} key={index}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-500 relative">
                      {profile.banner_image && (
                        <Image 
                          src={profile.banner_image} 
                          alt={`${profile.name}'s banner`}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className="p-5 relative">
                      <div className="absolute -top-10 left-4 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
                        <div className="w-16 h-16 bg-gray-300 rounded-full relative">
                          {profile.profile_picture ? (
                            <Image 
                              src={profile.profile_picture} 
                              alt={profile.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl text-gray-500">
                              {profile.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-xl font-bold">{profile.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
                        <p className="mt-2 line-clamp-2">{profile.bio || "No bio provided."}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl">No profiles found matching your search.</p>
              {searchQuery && (
                <Button 
                  structure="base" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {filteredProfiles.length > PROFILES_PER_PAGE && (
            <div className="flex justify-center items-center mt-10 space-x-2">
              <Button
                structure="base"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2"
              >
                <FaArrowLeft />
              </Button>
              
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  
                  // Display current page, first page, last page, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={i}
                        structure="base"
                        className={`px-4 py-2 ${currentPage === page ? 'bg-purple-600 text-white' : ''}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  
                  // Display dots for skipped pages
                  if (
                    (page === 2 && currentPage > 3) || 
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={i} className="px-2">...</span>;
                  }
                  
                  return null;
                })}
              </div>
              
              <Button
                structure="base"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2"
              >
                <FaArrowRight />
              </Button>
            </div>
          )}
          
          {/* Load More */}
          {hasMoreProfiles && filteredProfiles.length === profiles.length && (
            <div className="text-center mt-10">
              <Button 
                structure="base"
                onClick={loadMoreProfiles}
                disabled={loading}
                className="px-6 py-3"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  "Load More Profiles"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 