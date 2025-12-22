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

  useEffect(() => {
    if (stateId) {
      loadAssemblies(stateId);
    } else {
      setAssemblies([]);
    }
  }, [stateId]);

  const loadAssemblies = async (id: number) => {
    setLoading(true);
    try {
      const data = await apiService.getStateAssemblies(id);
      setAssemblies(data);
    } catch (error) {
      console.error('Failed to load assemblies:', error);
      setAssemblies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssemblies = useMemo(() => {
    if (!query.trim() || assemblies.length === 0) return assemblies.slice(0, 10);

    return assemblies.filter(assembly =>
      assembly.constituency_name.toLowerCase().includes(query.toLowerCase()) ||
      assembly.district.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }, [assemblies, query]);

  const handleSelect = (assembly: AssemblyConstituency) => {
    onAssemblySelect(assembly);
    setQuery(assembly.constituency_name);
    setIsOpen(false);
  };

  if (!stateId) {
    return (
      <div className={cn('relative', className)}>
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
            <div className="p-4 text-center text-muted-foreground">Loading assemblies...</div>
          ) : filteredAssemblies.length > 0 ? (
            <div className="py-1">
              {filteredAssemblies.map((assembly) => (
                <button
                  key={assembly.constituency_id}
                  onClick={() => handleSelect(assembly)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{assembly.constituency_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assembly.district} • {assembly.total_voters.toLocaleString()} voters
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No assemblies found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssemblySearchBar;