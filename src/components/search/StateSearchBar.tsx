// src/components/search/StateSearchBar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { State } from '@/types';

interface StateSearchBarProps {
  onStateSelect: (state: State) => void;
  placeholder?: string;
  data?: State[];
  className?: string;
}

const StateSearchBar: React.FC<StateSearchBarProps> = ({
  onStateSelect,
  placeholder = 'Search and select a state...',
  data = [],
  className
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>(data);

  useEffect(() => {
    if (data.length > 0) {
      setStates(data);
    }
  }, [data]);

  const filteredStates = useMemo(() => {
    if (!query.trim()) return states.slice(0, 10);

    return states.filter(state =>
      state.state_name.toLowerCase().includes(query.toLowerCase()) ||
      state.capital?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }, [states, query]);

  const handleSelect = (state: State) => {
    onStateSelect(state);
    setQuery(state.state_name);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {isOpen && query && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : filteredStates.length > 0 ? (
            <div className="py-1">
              {filteredStates.map((state) => (
                <button
                  key={state.state_id}
                  onClick={() => handleSelect(state)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{state.state_name}</p>
                    {state.capital && (
                      <p className="text-sm text-muted-foreground">Capital: {state.capital}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No states found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StateSearchBar;