import { useState, useEffect, useCallback } from 'react';
import Select from './Select';
import Input from './Input';
import api from '../../lib/api';

interface Country {
  id: number;
  code: string;
  name: string;
  phone_code: string;
}

interface State {
  id: number;
  code: string;
  name: string;
}

interface City {
  id: number;
  name: string;
  pincode: string;
}

interface AddressData {
  country_id?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  pin_code?: string;
  city?: string;
  state?: string;
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

export default function AddressFields({
  value,
  onChange,
  showBillingShipping = false,
  showAddressTextarea = true,
  addressLabel = 'Address',
  className = '',
}: AddressFieldsProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on mount
  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const res = await api<{ data: Country[] }>('/locations/countries/dropdown');
      setCountries(res.data || []);
    } catch {
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Fetch states when country changes
  const fetchStates = useCallback(async (countryId: number) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    try {
      const res = await api<{ data: State[] }>(`/locations/states/country/${countryId}`);
      setStates(res.data || []);
    } catch {
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  // Fetch cities when state changes
  const fetchCities = useCallback(async (stateId: number) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await api<{ data: City[] }>(`/locations/cities/state/${stateId}`);
      setCities(res.data || []);
    } catch {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Load states when country_id changes
  useEffect(() => {
    if (value.country_id) {
      fetchStates(value.country_id);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [value.country_id, fetchStates]);

  // Load cities when state_id changes
  useEffect(() => {
    if (value.state_id) {
      fetchCities(value.state_id);
    } else {
      setCities([]);
    }
  }, [value.state_id, fetchCities]);

  // Auto-fill pincode when city is selected
  useEffect(() => {
    if (value.city_id && cities.length > 0) {
      const selectedCity = cities.find(c => c.id === value.city_id);
      if (selectedCity?.pincode && !value.pin_code) {
        onChange({ ...value, pin_code: selectedCity.pincode });
      }
    }
  }, [value.city_id, cities]);

  const updateField = (field: keyof AddressData, fieldValue: string | number | null) => {
    if (field === 'country_id') {
      onChange({
        ...value,
        country_id: fieldValue as number | null,
        state_id: null,
        city_id: null,
        pin_code: '',
        city: '',
        state: '',
      });
    } else if (field === 'state_id') {
      const selectedState = states.find(s => s.id === fieldValue);
      onChange({
        ...value,
        state_id: fieldValue as number | null,
        city_id: null,
        pin_code: '',
        city: '',
        state: selectedState?.name || '',
      });
    } else if (field === 'city_id') {
      const selectedCity = cities.find(c => c.id === fieldValue);
      onChange({
        ...value,
        city_id: fieldValue as number | null,
        city: selectedCity?.name || value.city || '',
        pin_code: selectedCity?.pincode || value.pin_code || '',
      });
    } else {
      onChange({ ...value, [field]: fieldValue });
    }
  };

  const countryOptions = [
    { value: '', label: loadingCountries ? 'Loading...' : 'Select country' },
    ...countries.map(c => ({ value: String(c.id), label: c.name })),
  ];

  const stateOptions = [
    { value: '', label: loadingStates ? 'Loading...' : value.country_id ? 'Select state' : 'Select country first' },
    ...states.map(s => ({ value: String(s.id), label: s.name })),
  ];

  const cityOptions = [
    { value: '', label: loadingCities ? 'Loading...' : value.state_id ? 'Select city' : 'Select state first' },
    ...cities.map(c => ({ value: String(c.id), label: c.name })),
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
              onChange={(e) => updateField('billing_address', e.target.value)}
              placeholder="Enter billing address..."
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none placeholder-gray-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Shipping Address</label>
            <textarea
              rows={3}
              value={value.shipping_address || ''}
              onChange={(e) => updateField('shipping_address', e.target.value)}
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
            onChange={(e) => updateField('address', e.target.value)}
            placeholder={`Enter ${addressLabel.toLowerCase()}...`}
            className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400 transition-all resize-none placeholder-gray-400 bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Country"
          options={countryOptions}
          value={String(value.country_id || '')}
          onChange={(e) => updateField('country_id', e.target.value ? Number(e.target.value) : null)}
        />
        <Select
          label="State"
          options={stateOptions}
          value={String(value.state_id || '')}
          onChange={(e) => updateField('state_id', e.target.value ? Number(e.target.value) : null)}
          disabled={!value.country_id}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select
            label="City"
            options={cityOptions}
            value={String(value.city_id || '')}
            onChange={(e) => updateField('city_id', e.target.value ? Number(e.target.value) : null)}
            disabled={!value.state_id}
          />
          {/* Allow manual city entry if not found */}
          {value.state_id && (
            <Input
              label="Or enter city manually"
              value={value.city || ''}
              placeholder="Type city name"
              onChange={(e) => {
                onChange({ ...value, city: e.target.value, city_id: null });
              }}
            />
          )}
        </div>
        <Input
          label="Pin Code"
          value={value.pin_code || ''}
          placeholder="Auto-filled or enter manually"
          onChange={(e) => updateField('pin_code', e.target.value)}
        />
      </div>
    </div>
  );
}
