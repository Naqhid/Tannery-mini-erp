import { useState, useEffect, useCallback, useRef } from 'react';
import api from './api';

interface DropdownOption {
  id: number;
  code: string;
  name: string;
  value_mm?: number;
  rank?: number;
  gst_rate?: number;
  hex_code?: string;
  seq?: number;
  machine_type?: string;
  capacity?: string;
  description?: string;
  // Group master fields
  category_id?: number;
  hsn_code?: string;
  // Product specific fields
  leather_type?: string;
  thickness?: string;
  uom?: string;
  leather_type_id?: number;
  uom_id?: number;
  thickness_id?: number;
  finish_type_id?: number;
  color_id?: number;
}

interface DropdownState {
  data: DropdownOption[];
  loading: boolean;
  error: string | null;
}

type DropdownType =
  | 'product-categories'
  | 'leather-types'
  | 'uom'
  | 'thickness'
  | 'standard-sizes'
  | 'colors'
  | 'finish-types'
  | 'grades'
  | 'hsn-codes'
  | 'process-stages'
  | 'machines'
  | 'group-master'
  | 'products'
  | 'materials'
  | 'customers';

export function useDropdown(type: DropdownType) {
  const [state, setState] = useState<DropdownState>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let endpoint = `/${type}/dropdown`;
      if (type === 'products') endpoint = '/products/dropdown';
      if (type === 'materials') endpoint = '/materials/dropdown';
      if (type === 'customers') endpoint = '/customers/dropdown';
      const res = await api<{ data: DropdownOption[] }>(endpoint);
      setState({ data: res.data || [], loading: false, error: null });
    } catch (err) {
      setState({ data: [], loading: false, error: (err as Error).message });
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const options = state.data.map(item => ({
    value: String(item.id),
    label: item.name,
    code: item.code,
    ...item,
  }));

  return {
    ...state,
    options,
    refetch: fetchData,
  };
}

export function useDropdowns(types: DropdownType[]) {
  // Stabilize the types array - only re-run when actual content changes
  const typesKey = types.join(',');
  const typesRef = useRef(types);
  if (typesRef.current.join(',') !== typesKey) {
    typesRef.current = types;
  }

  const [states, setStates] = useState<Record<DropdownType, DropdownState>>(() => {
    const initial: Record<string, DropdownState> = {};
    types.forEach(type => {
      initial[type] = { data: [], loading: true, error: null };
    });
    return initial as Record<DropdownType, DropdownState>;
  });

  const fetchedRef = useRef(false);

  const fetchData = useCallback(async (type: DropdownType) => {
    setStates(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null },
    }));
    try {
      let endpoint = `/${type}/dropdown`;
      if (type === 'products') endpoint = '/products/dropdown';
      if (type === 'materials') endpoint = '/materials/dropdown';
      if (type === 'customers') endpoint = '/customers/dropdown';
      const res = await api<{ data: DropdownOption[] }>(endpoint);
      setStates(prev => ({
        ...prev,
        [type]: { data: res.data || [], loading: false, error: null },
      }));
    } catch (err) {
      setStates(prev => ({
        ...prev,
        [type]: { data: [], loading: false, error: (err as Error).message },
      }));
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    typesRef.current.forEach(type => fetchData(type));
  }, [typesKey, fetchData]);

  const result: Record<string, { data: DropdownOption[]; options: { value: string; label: string; code: string }[]; loading: boolean; error: string | null }> = {};

  types.forEach(type => {
    const state = states[type];
    if (state) {
      result[type] = {
        ...state,
        options: state.data.map(item => ({
          value: String(item.id),
          label: item.name,
          code: item.code,
        })),
      };
    } else {
      result[type] = {
        data: [],
        options: [],
        loading: true,
        error: null,
      };
    }
  });

  return result;
}

export default useDropdown;
