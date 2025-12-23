// src/components/search/StateSearchBar.tsx - OPTIMIZED
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import type { State } from '@/types';

interface StateSearchBarProps {
  onStateSelect: (state: State) => void;
  placeholder?: string;
  data?: State[]; // Accept pre-loaded data
  className?: string;
  disabled?: boolean;
}

const StateSearchBar: React.FC<StateSearchBarProps> = ({
  onStateSelect,
  placeholder = 'Search states...',
  data = [],
  className,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [states, setStates] = useState<State[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only load states if parent didn't provide them
  useEffect(() => {
    let isMounted = true;

    const loadStates = async () => {
      if (data && data.length > 0) {
        // Use parent-provided data
        if (isMounted) {
          setStates(data);
        }
        return;
      }

      if (states.length === 0 && !loading) {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        try {
          const statesData = await apiService.getStates();
          if (isMounted) {
            setStates(statesData || []);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Failed to load states:', error);
            setError('Failed to load states. Please try again.');
            setStates([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    loadStates();

    return () => {
      isMounted = false;
    };
  }, [data]); // Only depend on data prop

  const filteredStates = useMemo(() => {
    if (!states || states.length === 0) return [];

    if (!query.trim()) {
      // Show first 8 states when no query
      return states.slice(0, 8);
    }

    const searchTerm = query.toLowerCase();
    return states.filter(state =>
      state.state_name.toLowerCase().includes(searchTerm) ||
      state.state_code?.toLowerCase().includes(searchTerm) ||
      state.capital?.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }, [states, query]);

  const handleSelect = (state: State) => {
    onStateSelect(state);
    setQuery(state.state_name);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    if (e.key === 'Enter' && filteredStates.length > 0) {
      handleSelect(filteredStates[0]);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputFocus = () => {
    if (states.length > 0) {
      setIsOpen(true);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const statesData = await apiService.getStates();
      setStates(statesData || []);
    } catch (error) {
      console.error('Failed to load states:', error);
      setError('Failed to load states. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className={cn('relative state-search-container', className)}>
        <div className="relative opacity-50">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            disabled
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-muted/30 text-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative state-search-container', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) {
              setIsOpen(true);
            }
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading states...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                Retry
              </button>
            </div>
          ) : filteredStates.length > 0 ? (
            <div className="py-1">
              {filteredStates.map((state) => (
                <button
                  key={state.state_id}
                  onClick={() => handleSelect(state)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 focus:outline-none focus:bg-muted/50"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {state.state_name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{state.capital || ''}</span>
                      {state.total_constituencies && (
                        <>
                          <span>•</span>
                          <span>{state.total_constituencies} constituencies</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              No states found for "{query}"
            </div>
          ) : states.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No states available
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StateSearchBar;