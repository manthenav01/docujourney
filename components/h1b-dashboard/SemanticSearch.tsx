'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Building, 
  MapPin, 
  User,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SearchSuggestion {
  text: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface SemanticSearchProps {
  onSearch: (query: string, options?: SemanticSearchOptions) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
  showSemanticToggle?: boolean;
}

interface SemanticSearchOptions {
  includeSemanticMatches: boolean;
  searchFields: string[];
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({
  onSearch,
  onSuggestionSelect,
  placeholder = 'Search jobs, companies, or locations...',
  className = '',
  initialQuery = '',
  showSemanticToggle = true,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [semanticEnabled, setSemanticEnabled] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('h1b-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Debounced autocomplete with better performance
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset selected index when query changes
    setSelectedIndex(-1);

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 200); // Reduced from 300ms for snappier response
    } else {
      setSuggestions([]);
      setExpandedTerms([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, semanticEnabled]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {return;}
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/semantic-search?action=autocomplete&query=${encodeURIComponent(searchQuery)}&limit=12`,
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) {return;}
    
    const trimmedQuery = searchQuery.trim();
    
    // Add to recent searches
    const newRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery),
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('h1b-recent-searches', JSON.stringify(newRecentSearches));
    
    // Don't perform the search - just keep the query for autocomplete
    console.log('Search query entered:', trimmedQuery);
    
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Debug logging
    console.log('Suggestion clicked:', suggestion);
    
    // Add to recent searches
    const newRecentSearches = [
      suggestion.text,
      ...recentSearches.filter(s => s !== suggestion.text),
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('h1b-recent-searches', JSON.stringify(newRecentSearches));
    
    // Always use the callback if provided, otherwise handle navigation here
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      // Helper function to detect if text looks like a company name
      const looksLikeCompanyName = (text: string) => {
        const companyIndicators = [
          'INC', 'LLC', 'CORP', 'LTD', 'CORPORATION', 'COMPANY', 'CO',
          'TECHNOLOGIES', 'SYSTEMS', 'SOLUTIONS', 'SERVICES', 'GROUP',
        ];
        const upperText = text.toUpperCase();
        return companyIndicators.some(indicator => 
          upperText.includes(indicator + '.') || 
          upperText.includes(indicator + ',') || 
          upperText.endsWith(indicator),
        );
      };
      
      // Fallback navigation if no callback is provided
      let finalType = suggestion.type;
      
      // Override type if it looks like a company name but was classified as job_title
      if (suggestion.type === 'job_title' && looksLikeCompanyName(suggestion.text)) {
        finalType = 'employer';
        console.log('Fallback: Overriding job_title to employer for:', suggestion.text);
      }
      
      if (finalType === 'employer') {
        const companySlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        router.push(`/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
      } else if (finalType === 'job_title') {
        const jobSlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        router.push(`/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(suggestion.text)}`);
      } else {
        console.log('Selected:', suggestion);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {return;}
    
    const totalItems = suggestions.length + (query.length < 2 ? recentSearches.length : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (query.length < 2 && selectedIndex < recentSearches.length) {
          // Select from recent searches
          const selectedSearch = recentSearches[selectedIndex];
          handleSuggestionClick({ text: selectedSearch, type: 'job_title', count: 0 });
        } else {
          // Select from suggestions
          const adjustedIndex = query.length < 2 ? selectedIndex - recentSearches.length : selectedIndex;
          if (adjustedIndex >= 0 && adjustedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[adjustedIndex]);
          }
        }
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_title': return <User className="w-4 h-4" />;
      case 'employer': return <Building className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'skill': return <Zap className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job_title': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'employer': return 'text-green-600 bg-green-50 border-green-200';
      case 'location': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'skill': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) {return text;}
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      ),
    );
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setExpandedTerms([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Semantic Search Toggle */}
      {showSemanticToggle && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSemanticEnabled(!semanticEnabled)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                semanticEnabled 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Search</span>
            </button>
            
            {expandedTerms.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>+{expandedTerms.length} related terms</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
          
          {recentSearches.length > 0 && (
            <button
              onClick={() => setShowSuggestions(true)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Clock className="w-3 h-3" />
              <span>Recent</span>
            </button>
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0 || isLoading || query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <span className="text-sm text-gray-500">Finding suggestions...</span>
            </div>
          )}

          {/* No Loading and has content */}
          {!isLoading && (
            <>
              {/* Recent Searches */}
              {query.length < 2 && recentSearches.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick({ text: search, type: 'job_title', count: 0 })}
                        className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
                          selectedIndex === index ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((suggestion, index) => {
                    const adjustedIndex = query.length < 2 ? index + recentSearches.length : index;
                    const isSelected = selectedIndex === adjustedIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full flex items-center justify-between px-3 py-3 text-sm hover:bg-gray-50 rounded-lg transition-all group ${
                          isSelected ? 'bg-blue-50 border-l-2 border-blue-500 shadow-sm' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-md border ${getTypeColor(suggestion.type)}`}>
                            {getTypeIcon(suggestion.type)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">
                              {highlightMatch(suggestion.text, query)}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {suggestion.category} • {suggestion.count.toLocaleString()} applications
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <ChevronRight className={`w-4 h-4 transition-all ${
                            isSelected ? 'opacity-100 translate-x-1' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 && suggestions.length === 0 && !isLoading && (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No suggestions found for "{query}"</div>
                  <div className="text-xs mt-1">Try a different search term</div>
                </div>
              )}
            </>
          )}

          {/* Expanded Terms Preview */}
          {semanticEnabled && expandedTerms.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Related Terms</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {expandedTerms.slice(0, 5).map((term, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {term}
                  </span>
                ))}
                {expandedTerms.length > 5 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    +{expandedTerms.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};