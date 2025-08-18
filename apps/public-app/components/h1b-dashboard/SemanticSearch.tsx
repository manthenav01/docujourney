'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackJobSearch } from '../../lib/analytics';
import { 
  Search, 
  Sparkles, 
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
  showSemanticToggle = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [semanticEnabled, setSemanticEnabled] = useState(true);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Array of placeholder texts to cycle through
  const placeholderTexts = React.useMemo(() => [
    'Search H1B data: companies, jobs, locations...',
    'Find GOOGLE LLC, MICROSOFT CORPORATION...',
    'Search Software Engineer, Data Scientist...',
    'Explore San Francisco, CA filings...',
    'Find New York, NY H1B applications...',
    'Search attorneys and law firms...',
    'Discover Seattle, WA opportunities...',
    'Find APPLE INC. LCA applications...',
  ], []);

  // Mount effect to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animated typing effect for placeholder
  useEffect(() => {
    if (!isMounted || isInputFocused || query) {
      setAnimatedPlaceholder('');
      return;
    }

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      const currentText = placeholderTexts[textIndex];
      
      if (isDeleting) {
        // Delete characters
        if (charIndex > 0) {
          charIndex--;
          setAnimatedPlaceholder(currentText.substring(0, charIndex));
          timeoutId = setTimeout(animate, 50);
        } else {
          // Move to next text
          isDeleting = false;
          textIndex = (textIndex + 1) % placeholderTexts.length;
          timeoutId = setTimeout(animate, 500);
        }
      } else {
        // Type characters
        if (charIndex < currentText.length) {
          charIndex++;
          setAnimatedPlaceholder(currentText.substring(0, charIndex));
          timeoutId = setTimeout(animate, 100);
        } else {
          // Start deleting after pause
          isDeleting = true;
          timeoutId = setTimeout(animate, 2000);
        }
      }
    };

    // Start animation
    timeoutId = setTimeout(animate, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMounted, isInputFocused, query, placeholderTexts]);

  // Cursor blinking effect
  useEffect(() => {
    if (!isMounted || isInputFocused || query) {
      return;
    }

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Blink every 530ms

    return () => clearInterval(cursorInterval);
  }, [isMounted, isInputFocused, query]);

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
    
    // Track search in Google Analytics (only on client-side after hydration)
    if (isMounted) {
      try {
        trackJobSearch({
          jobTitle: trimmedQuery,
          resultsCount: suggestions.length,
        });
      } catch (error) {
        console.warn('Analytics tracking error:', error);
      }
    }
    
    // Don't perform the search - just keep the query for autocomplete
    console.log('Search query entered:', trimmedQuery);
    
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Clear loading state immediately when suggestion is clicked
    setIsLoading(false);
    
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Debug logging
    console.log('Suggestion clicked:', suggestion);
    
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
      } else if (finalType === 'location') {
        // Navigate to city page if it's a city, state format
        if (suggestion.text.includes(',')) {
          const [cityPart, statePart] = suggestion.text.split(',');
          const cityName = cityPart.trim();
          const stateName = statePart.trim();
          
          if (cityName && stateName) {
            const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const stateSlug = stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            console.log('Navigating to city page:', `/h1b-dashboard/locations/${encodeURIComponent(stateSlug)}/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
            router.push(`/h1b-dashboard/locations/${encodeURIComponent(stateSlug)}/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
            return;
          }
        }
        
        // For non-city locations (like states), just log for now
        console.log('Location selected:', suggestion);
      } else {
        console.log('Selected:', suggestion);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {return;}
    
    const totalItems = suggestions.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
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
      case 'job_title': return 'text-primary bg-primary/10 border-primary/20';
      case 'employer': return 'text-success bg-success/10 border-success/20';
      case 'location': return 'text-chart-3 bg-chart-3/10 border-chart-3/20';
      case 'skill': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
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
            setIsInputFocused(true);
          }}
          onBlur={(e) => {
            // Delay the focus state change to allow for clicks on suggestions
            setTimeout(() => {
              setIsInputFocused(false);
            }, 200);
          }}
          placeholder={isInputFocused || query ? placeholder : `${animatedPlaceholder}${!isInputFocused && !query && showCursor ? '|' : ''}`}
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


      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading || query.length >= 2) && (
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

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((suggestion, index) => {
                    const isSelected = selectedIndex === index;
                    
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
                  <div className="text-sm">No suggestions found for &quot;{query}&quot;</div>
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