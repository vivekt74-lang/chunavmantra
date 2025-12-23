// src/components/search/StateSearchBar.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import type { State } from '@/types';

interface StateSearchBarProps {
  onStateSelect: (state: State) => void;
  placeholder?: string;
  data?: State[];
  className?: string;
}

const StateSearchBar: React.FC<StateSearchBarProps> = ({
  onStateSelect,
  placeholder = 'Search states...',
  data = [],
  className
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [states, setStates] = useState<State[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no data provided, load states from API
    if (data.length === 0) {
      loadStates();
    } else {
      setStates(data);
    }
  }, [data]);

  const loadStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const statesData = await apiService.getStates();
      setStates(statesData || []);
    } catch (error) {
      console.error('Failed to load states:', error);
      setError('Failed to load states. Please try again.');
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = useMemo(() => {
    if (!states || states.length === 0) return [];

    if (!query.trim()) {
      // Show first 10 states when no query
      return states.slice(0, 10);
    }

    const searchTerm = query.toLowerCase();
    return states.filter(state =>
      state.state_name.toLowerCase().includes(searchTerm) ||
      state.state_code?.toLowerCase().includes(searchTerm) ||
      state.capital?.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
  }, [states, query]);

  const handleSelect = (state: State) => {
    onStateSelect(state);
    setQuery(state.state_name);
    setIsOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (!(e.target as Element).closest('.state-search-container')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className={cn('relative state-search-container', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) {
              setIsOpen(true);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading states...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={loadStates}
                className="mt-2 text-sm text-primary hover:underline"
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
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{state.state_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {state.capital && `${state.capital} • `}
                      {state.total_constituencies ? `${state.total_constituencies} constituencies` : ''}
                    </p>
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