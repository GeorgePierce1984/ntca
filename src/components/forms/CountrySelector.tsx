import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { countries, type Country } from '@/data/countries';
import { CENTRAL_ASIA_COUNTRIES } from '@/constants/options';

interface CountrySelectorProps {
  selectedCountry?: Country;
  onSelect: (country: Country) => void;
  placeholder?: string;
  className?: string;
  showPhoneCode?: boolean;
  filterToCentralAsia?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelect,
  placeholder = "Select a country",
  className = "",
  showPhoneCode = false,
  filterToCentralAsia = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const availableCountries = useMemo(() => {
    if (!filterToCentralAsia) {
      return countries;
    }
    return countries.filter(country => 
      CENTRAL_ASIA_COUNTRIES.some(ca => 
        ca.value.toLowerCase() === country.name.toLowerCase()
      )
    );
  }, [filterToCentralAsia]);
  
  const [filteredCountries, setFilteredCountries] = useState(availableCountries);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableCountries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(availableCountries);
    }
  }, [searchQuery, availableCountries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between w-full text-left"
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              {showPhoneCode && (
                <span className="text-neutral-500">({selectedCountry.phoneCode})</span>
              )}
            </>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[200px] pb-2">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  {showPhoneCode && (
                    <span className="text-neutral-500 text-sm">{country.phoneCode}</span>
                  )}
                </div>
                {selectedCountry?.code === country.code && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </button>
            ))}
            
            {filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-center text-neutral-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 