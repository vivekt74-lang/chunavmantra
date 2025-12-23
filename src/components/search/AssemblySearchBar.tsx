// src/components/search/AssemblySearchBar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import type { AssemblyConstituency } from '@/types';

interface AssemblySearchBarProps {
  stateId?: number;
  onAssemblySelect: (assembly: AssemblyConstituency) => void;
  placeholder?: string;
  className?: string;
}

const AssemblySearchBar: React.FC<AssemblySearchBarProps> = ({
  stateId,
  onAssemblySelect,
  placeholder = 'Search assemblies...',
  className
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assemblies, setAssemblies] = useState<AssemblyConstituency[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stateId) {
      loadAssemblies(stateId);
    } else {
      setAssemblies([]);
      setError(null);
    }
  }, [stateId]);

  const loadAssemblies = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getStateAssemblies(id);
      if (data && Array.isArray(data)) {
        setAssemblies(data);
      } else {
        setAssemblies([]);
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Failed to load assemblies:', error);
      setAssemblies([]);
      setError('Failed to load assemblies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssemblies = useMemo(() => {
    if (!assemblies || assemblies.length === 0) return [];

    if (!query.trim()) {
      // Show first 10 assemblies when no query
      return assemblies.slice(0, 10);
    }

    const searchTerm = query.toLowerCase();
    return assemblies.filter(assembly => {
      const constituencyName = assembly.constituency_name?.toLowerCase() || '';
      const district = assembly.district?.toLowerCase() || '';
      return constituencyName.includes(searchTerm) || district.includes(searchTerm);
    }).slice(0, 10);
  }, [assemblies, query]);

  const handleSelect = (assembly: AssemblyConstituency) => {
    onAssemblySelect(assembly);
    setQuery(assembly.constituency_name || '');
    setIsOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (!(e.target as Element).closest('.assembly-search-container')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!stateId) {
    return (
      <div className={cn('relative assembly-search-container', className)}>
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
    <div className={cn('relative assembly-search-container', className)}>
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
              <p className="text-sm text-muted-foreground">Loading assemblies...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => stateId && loadAssemblies(stateId)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredAssemblies.length > 0 ? (
            <div className="py-1">
              {filteredAssemblies.map((assembly) => (
                <button
                  key={assembly.constituency_id}
                  onClick={() => handleSelect(assembly)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-foreground truncate">
                      {assembly.constituency_name || `Assembly ${assembly.constituency_id}`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{assembly.district || 'Unknown District'}</span>
                      {assembly.total_voters && (
                        <>
                          <span>•</span>
                          <span>{assembly.total_voters.toLocaleString()} voters</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              No assemblies found for "{query}"
            </div>
          ) : assemblies.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No assemblies available for this state
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AssemblySearchBar;