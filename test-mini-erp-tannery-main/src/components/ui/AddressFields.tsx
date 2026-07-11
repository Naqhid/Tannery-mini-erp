import { useState, useEffect, useCallback } from 'react';
import Select from './Select';
import Input from './Input';

interface AddressData {
  country_id?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  pin_code?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  billing_address?: string;
  shipping_address?: string;
}

interface AddressFieldsProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  showBillingShipping?: boolean;
  showAddressTextarea?: boolean;
  addressLabel?: string;
  className?: string;
}

// Cache for API responses to avoid repeated calls
const cache: {
  countries: string[];
  states: Record<string, string[]>;
  cities: Record<string, string[]>;
} = {
  countries: [],
  states: {},
  cities: {},
};

export default function AddressFields({
  value,
  onChange,
  showBillingShipping = false,
  showAddressTextarea = true,
  addressLabel = 'Address',
  className = '',
}: AddressFieldsProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch all countries on mount
  const fetchCountries = useCallback(async () => {
    if (cache.countries.length > 0) {
      setCountries(cache.countries);
      return;
    }
    setLoadingCountries(true);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
      const data = await res.json();
      if (data && !data.error && data.data) {
        const names = data.data.map((c: { name: string }) => c.name).sort();
        cache.countries = names;
        setCountries(names);
      }
    } catch {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states');
        const data = await res.json();
        if (data && !data.error && data.data) {
          const names = data.data.map((c: { name: string }) => c.name).sort();
          cache.countries = names;
          setCountries(names);
        }
      } catch {
        setCountries([]);
      }
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Fetch states when country changes
  const fetchStates = useCallback(async (country: string) => {
    if (!country) {
      setStates([]);
      return;
    }
    if (cache.states[country]) {
      setStates(cache.states[country]);
      return;
    }
    setLoadingStates(true);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });
      const data = await res.json();
      if (data && !data.error && data.data?.states) {
        const names = data.data.states.map((s: { name: string }) => s.name).sort();
        cache.states[country] = names;
        setStates(names);
      } else {
        setStates([]);
      }
    } catch {
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  // Fetch cities when state changes
  const fetchCities = useCallback(async (country: string, state: string) => {
    if (!country || !state) {
      setCities([]);
      return;
    }
    const cacheKey = `${country}__${state}`;
    if (cache.cities[cacheKey]) {
      setCities(cache.cities[cacheKey]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, state }),
      });
      const data = await res.json();
      if (data && !data.error && data.data) {
        const names = (data.data as string[]).sort();
        cache.cities[cacheKey] = names;
        setCities(names);
      } else {
        setCities([]);
      }
    } catch {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (value.country) {
      fetchStates(value.country);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [value.country, fetchStates]);

  // Load cities when state changes
  useEffect(() => {
    if (value.country && value.state) {
      fetchCities(value.country, value.state);
    } else {
      setCities([]);
    }
  }, [value.country, value.state, fetchCities]);

  const handleCountryChange = (country: string) => {
    onChange({
      ...value,
      country,
      country_id: null,
      state: '',
      state_id: null,
      city: '',
      city_id: null,
      pin_code: '',
    });
  };

  const handleStateChange = (state: string) => {
    onChange({
      ...value,
      state,
      state_id: null,
      city: '',
      city_id: null,
      pin_code: '',
    });
  };

  const handleCityDropdownChange = (city: string) => {
    onChange({
      ...value,
      city,
      city_id: null,
    });
  };

  const handleManualCityChange = (city: string) => {
    onChange({
      ...value,
      city,
      city_id: null,
    });
  };

  const countryOptions = [
    { value: '', label: loadingCountries ? 'Loading countries...' : 'Select country' },
    ...countries.map(c => ({ value: c, label: c })),
    // Include current country if not in fetched list yet
    ...(value.country && !countries.includes(value.country) ? [{ value: value.country, label: value.country }] : []),
  ];

  const stateOptions = [
    { value: '', label: loadingStates ? 'Loading states...' : value.country ? 'Select state' : 'Select country first' },
    ...states.map(s => ({ value: s, label: s })),
    // Include current state if not in fetched list yet
    ...(value.state && !states.includes(value.state) ? [{ value: value.state, label: value.state }] : []),
  ];

  const cityOptions = [
    { value: '', label: loadingCities ? 'Loading cities...' : value.state ? 'Select city' : 'Select state first' },
    ...cities.map(c => ({ value: c, label: c })),
    // Include current city in options if it exists but not in the fetched list
    ...(value.city && !cities.includes(value.city) ? [{ value: value.city, label: value.city }] : []),
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {showBillingShipping ? (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">
              Billing Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={value.billing_address || ''}
              onChange={(e) => onChange({ ...value, billing_address: e.target.value })}
              placeholder="Enter billing address..."
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none placeholder-gray-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Shipping Address</label>
            <textarea
              rows={3}
              value={value.shipping_address || ''}
              onChange={(e) => onChange({ ...value, shipping_address: e.target.value })}
              placeholder="Enter shipping address (or same as billing)..."
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all resize-none placeholder-gray-400 bg-white"
            />
          </div>
        </>
      ) : showAddressTextarea && (
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">{addressLabel}</label>
          <textarea
            rows={3}
            value={value.address || ''}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder={`Enter ${addressLabel.toLowerCase()}...`}
            className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400 transition-all resize-none placeholder-gray-400 bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Country"
          options={countryOptions}
          value={value.country || ''}
          onChange={(e) => handleCountryChange(e.target.value)}
        />
        <Select
          label="State"
          options={stateOptions}
          value={value.state || ''}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={!value.country}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Select
            label="City"
            options={cityOptions}
            value={value.city || ''}
            onChange={(e) => handleCityDropdownChange(e.target.value)}
            disabled={!value.state}
          />
          <Input
            label="Or type city manually"
            value={value.city && !cities.includes(value.city) ? value.city : ''}
            placeholder="Enter city if not in list"
            onChange={(e) => handleManualCityChange(e.target.value)}
            disabled={!value.state}
          />
        </div>
        <Input
          label="Pin Code"
          value={value.pin_code || ''}
          placeholder="Enter pin code"
          onChange={(e) => onChange({ ...value, pin_code: e.target.value })}
        />
      </div>
    </div>
  );
}
