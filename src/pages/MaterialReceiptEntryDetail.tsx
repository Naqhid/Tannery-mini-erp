import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, Truck, RotateCcw, Info, Minus, Send } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Supplier { id: number; code: string; name: string; state?: string; state_name?: string; }
interface Material { id: number; code: string; name: string; uom: string; primary_uom_name?: string; secondary_uom_name?: string; currency?: string; rate?: number | string; last_purchase_price?: number | string; standard_cost?: number | string; category_name?: string; category?: string; group_name?: string; display_name?: string; group_gst_rate?: number | string; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  primary_uom: string;
  secondary_uom: string;
  order_qty: string;
  primary_uom_qty: string;
  secondary_uom_qty: string;
  currency: string;
  exchange_rate: string;
  rate_fc: string;
  rate_inr: number;
  discount_percent: number;
  amount_fc: number;
  amount_inr: number;
  expiry_date: string;
  manufacture_date: string;
  shelf_life_months: string;
}

interface ReceiptData {
  id?: number;
  receipt_no: string;
  receipt_date: string;
  receipt_type: string;
  supplier_id: string;
  purchase_order_no: string;
  po_date: string;
  challan_no: string;
  challan_date: string;
  lr_grn_no: string;
  lr_grn_date: string;
  transporter: string;
  gate_entry_no: string;
  warehouse_id: string;
  freight: string;
  loading_charges: string;
  other_charges: string;
  gst_percent: string;
  tax_type: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', primary_uom: '', secondary_uom: '', order_qty: '', primary_uom_qty: '', secondary_uom_qty: '', currency: 'INR', exchange_rate: '1', rate_fc: '', rate_inr: 0, discount_percent: 0, amount_fc: 0, amount_inr: 0, expiry_date: '', manufacture_date: '', shelf_life_months: '' };

// Expiry date = manufacture date + shelf life (in months). Non-editable, derived.
function computeExpiryDate(manufactureDate: string, shelfLifeMonths: string): string {
  if (!manufactureDate || shelfLifeMonths === '' || shelfLifeMonths == null) return '';
  const months = parseInt(shelfLifeMonths, 10);
  if (!Number.isFinite(months)) return '';
  const d = new Date(manufactureDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

const emptyReceipt: ReceiptData = {
  receipt_no: '', receipt_date: new Date().toISOString().split('T')[0], receipt_type: 'Direct Purchase',
  supplier_id: '', purchase_order_no: '', po_date: '', challan_no: '', challan_date: '',
  lr_grn_no: '', lr_grn_date: '', transporter: '', gate_entry_no: '', warehouse_id: '',
  freight: '', loading_charges: '', other_charges: '', gst_percent: '', tax_type: 'IGST', remarks: '', status: 'Draft',
};

const RECEIPT_TYPES = [
  { value: 'Purchase Order', label: 'Purchase Order' },
  { value: 'Direct Purchase', label: 'Direct Purchase' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Sample', label: 'Sample' },
  { value: 'Return', label: 'Return' },
  { value: 'Physical Stock', label: 'Physical Stock' },
];

let _kc = 0;
const genKey = () => `row_${++_kc}_${Date.now()}`;
const NEW_RECEIPT_DRAFT_KEY = 'material-receipt-new-draft-v1';

export default function MaterialReceiptEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [receipt, setReceipt] = useState<ReceiptData>(emptyReceipt);
  const [items, setItems] = useState<Item[]>([{ ...emptyItem, _key: genKey() }]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [focusedNewRow, setFocusedNewRow] = useState<string | null>(null);
  const automaticSaveInFlight = useRef(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [wh, sup, mat] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Supplier[] }>('/suppliers?limit=500'),
        api<{ data: Material[] }>('/materials/dropdown'),
      ]);
      setWarehouses(wh.data || []);
      setSuppliers(sup.data || []);
      setMaterials(mat.data || []);
    } catch { toast.error('Failed to load dropdowns'); }
  }, []);

  const fetchReceipt = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { receipt_no: string } }>('/material-receipts/next-no');
        setReceipt((p) => ({ ...p, receipt_no: res.data.receipt_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/material-receipts/${id}`);
      const d = res.data;
      setReceipt({
        ...emptyReceipt,
        ...d,
        receipt_date: d.receipt_date?.split('T')[0] || '',
        po_date: d.po_date?.split('T')[0] || '',
        challan_date: d.challan_date?.split('T')[0] || '',
        lr_grn_date: d.lr_grn_date?.split('T')[0] || '',
        supplier_id: String(d.supplier_id || ''),
        warehouse_id: String(d.warehouse_id || ''),
        freight: String(d.freight || ''),
        loading_charges: String(d.loading_charges || ''),
        other_charges: String(d.other_charges || ''),
        gst_percent: String(d.gst_percent || ''),
        tax_type: (d as any).tax_type || 'IGST',
      });
      setIsPosted(d.status === 'Posted' || d.status === 'posted');
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        material_code: it.material_code || '',
        material_name: it.material_name || '',
        uom: it.uom || '',
        primary_uom: it.primary_uom || it.material_primary_uom || '',
        secondary_uom: it.secondary_uom || it.material_secondary_uom || '',
        order_qty: String(it.order_qty || ''),
        primary_uom_qty: String(it.primary_uom_qty || ''),
        secondary_uom_qty: String(it.secondary_uom_qty || ''),
        currency: it.currency || 'INR',
        exchange_rate: (it.currency || 'INR') === 'INR' ? '' : String(it.exchange_rate || '1'),
        rate_fc: (it.currency || 'INR') === 'INR' ? '' : String(it.rate_fc || it.rate || ''),
        rate_inr: parseFloat(it.rate_inr) || parseFloat(it.rate) || 0,
        discount_percent: parseFloat(it.discount_percent) || 0,
        amount_fc: parseFloat(it.amount_fc) || 0,
        amount_inr: parseFloat(it.amount_inr) || parseFloat(it.amount) || 0,
        manufacture_date: it.manufacture_date?.split('T')[0] || '',
        shelf_life_months: it.shelf_life_months != null ? String(it.shelf_life_months) : '',
        expiry_date: it.expiry_date?.split('T')[0]
          || computeExpiryDate(it.manufacture_date?.split('T')[0] || '', it.shelf_life_months != null ? String(it.shelf_life_months) : ''),
      })));
    } catch { toast.error('Failed to load receipt'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchReceipt(); }, [fetchDropdowns, fetchReceipt]);

  useEffect(() => {
    if (!isNew) { setDraftReady(true); return; }
    try {
      const raw = localStorage.getItem(NEW_RECEIPT_DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.receipt && Array.isArray(saved?.items)) {
          const { receipt_no: _savedReceiptNo, ...savedReceipt } = saved.receipt as ReceiptData;
          setReceipt((prev) => ({ ...prev, ...savedReceipt }));
          setItems(saved.items.length
            ? saved.items.map((item: Item) => ({ ...emptyItem, ...item, _key: genKey() }))
            : [{ ...emptyItem, _key: genKey() }]);
          setDraftStatus('Unsaved draft restored');
        }
      }
    } catch {
      localStorage.removeItem(NEW_RECEIPT_DRAFT_KEY);
    } finally {
      setDraftReady(true);
    }
  }, [isNew]);

  useEffect(() => {
    if (!isNew || !draftReady) return;
    const hasWork = items.length > 1 || items.some((item) => item.material_id || item.primary_uom_qty || item.rate_inr || item.amount_inr)
      || Boolean(receipt.warehouse_id || receipt.supplier_id || receipt.receipt_type || receipt.challan_no || receipt.remarks);
    if (!hasWork) {
      localStorage.removeItem(NEW_RECEIPT_DRAFT_KEY);
      setDraftStatus('');
      return;
    }
    try {
      localStorage.setItem(NEW_RECEIPT_DRAFT_KEY, JSON.stringify({ receipt, items, saved_at: new Date().toISOString() }));
      setDraftStatus(`Auto-saved locally at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setDraftStatus('Could not save browser draft');
    }
  }, [isNew, draftReady, receipt, items]);

  const clearLocalDraft = () => {
    localStorage.removeItem(NEW_RECEIPT_DRAFT_KEY);
    setDraftStatus('');
  };

  const HOME_STATE = 'tamil nadu';
  const stateIsIntra = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ') === HOME_STATE;

  const update = (key: string, value: any) => setReceipt((p) => {
    const next = { ...p, [key]: value };
    // Selecting a supplier decides intra (CGST+SGST) vs inter (IGST) state.
    if (key === 'supplier_id') {
      const sup = suppliers.find((s) => String(s.id) === String(value));
      const st = sup?.state_name || sup?.state || '';
      next.tax_type = stateIsIntra(st) ? 'CGST_SGST' : 'IGST';
    }
    // Physical Stock receipts carry no tax: force GST to zero.
    if (key === 'receipt_type' && value === 'Physical Stock') {
      next.gst_percent = '0';
    }
    return next;
  });

  // GST input is disabled and treated as zero for Physical Stock receipts.
  const isPhysicalStock = receipt.receipt_type === 'Physical Stock';

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      // Expiry date is derived (non-editable) = manufacture date + shelf life (months).
      if (field === 'manufacture_date' || field === 'shelf_life_months') {
        updated.expiry_date = computeExpiryDate(
          field === 'manufacture_date' ? value : updated.manufacture_date,
          field === 'shelf_life_months' ? value : updated.shelf_life_months,
        );
      }
      if (field === 'material_id') {
        const mat = materials.find((m) => String(m.id) === value);
        if (mat) {
          updated.uom = mat.uom;
          updated.material_code = mat.code;
          updated.material_name = mat.name;
          updated.primary_uom = mat.primary_uom_name || mat.uom || '';
          updated.secondary_uom = mat.secondary_uom_name || '';
          updated.currency = mat.currency || 'INR';
          const masterRate = Number(mat.rate) || Number(mat.last_purchase_price) || Number(mat.standard_cost) || 0;
          updated.rate_inr = masterRate;
          updated.rate_fc = '';
          if (updated.currency === 'INR') {
            updated.exchange_rate = '';
          } else if (!updated.exchange_rate) {
            updated.exchange_rate = '1';
          }
          if (updated.currency !== 'INR') {
            const exchangeRate = parseFloat(updated.exchange_rate) || 1;
            updated.rate_fc = (masterRate / exchangeRate).toFixed(4);
          }
          const gstRate = mat.group_gst_rate;
          if (gstRate != null && gstRate !== '') {
            setReceipt((r) => (r.gst_percent ? r : { ...r, gst_percent: String(Number(gstRate)) }));
          }
        } else {
          updated.material_code = '';
          updated.material_name = '';
          updated.uom = '';
          updated.primary_uom = '';
          updated.secondary_uom = '';
          updated.rate_inr = 0;
          updated.rate_fc = '';
          updated.amount_fc = 0;
          updated.amount_inr = 0;
        }
      }

      const isINR = (updated.currency || 'INR') === 'INR';
      const primaryQty = parseFloat(updated.primary_uom_qty) || 0;
      if (isINR) {
        updated.exchange_rate = '';
        updated.rate_fc = '';
        updated.amount_fc = 0;
        const rateInr = parseFloat(String(updated.rate_inr)) || 0;
        const discountPercent = parseFloat(String(updated.discount_percent)) || 0;
        const discountedRate = rateInr * (1 - discountPercent / 100);
        updated.rate_inr = rateInr;
        updated.amount_inr = parseFloat((discountedRate * primaryQty).toFixed(4));
      } else {
        const rateFc = parseFloat(updated.rate_fc) || 0;
        const exchangeRate = parseFloat(updated.exchange_rate) || 1;
        const discountPercent = parseFloat(String(updated.discount_percent)) || 0;
        const discountedRateFc = rateFc * (1 - discountPercent / 100);
        updated.rate_inr = parseFloat((rateFc * exchangeRate).toFixed(4));
        updated.amount_fc = parseFloat((primaryQty * discountedRateFc).toFixed(4));
        updated.amount_inr = parseFloat((updated.rate_inr * primaryQty * (1 - discountPercent / 100)).toFixed(4));
      }
      return updated;
    }));

    if (field === 'material_id') {
      focusGridField(key, 'primary_uom_qty');
    }
  };

  const focusGridField = (key: string, field: 'item' | 'primary_uom_qty' | 'rate_fc' | 'rate_inr' | 'discount_percent') => {
    requestAnimationFrame(() => {
      const selector = `[data-grid-field="${key}-${field}"]`;
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
      document.querySelector<HTMLElement>(selector)?.closest('tr')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const addItem = (focusNewRow = false) => {
    const newItem = { ...emptyItem, _key: genKey() };
    setItems((p) => [...p, newItem]);
    if (focusNewRow) setFocusedNewRow(newItem._key);
  };
  const removeItem = (key: string) => setItems((p) => p.length > 1 ? p.filter((it) => it._key !== key) : p);

  const handleClear = () => { clearLocalDraft(); setReceipt(emptyReceipt); setItems([{ ...emptyItem, _key: genKey() }]); };

  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, key: string, field: 'primary_uom_qty' | 'rate_fc' | 'rate_inr' | 'discount_percent') => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (field === 'primary_uom_qty') {
      const item = items.find((row) => row._key === key);
      focusGridField(key, item?.currency === 'INR' ? 'rate_inr' : 'rate_fc');
    } else if (field === 'rate_inr' || field === 'rate_fc') {
      focusGridField(key, 'discount_percent');
    } else {
      addItem(true);
    }
  };

  useEffect(() => {
    if (!focusedNewRow) return;
    focusGridField(focusedNewRow, 'item');
    setFocusedNewRow(null);
  }, [focusedNewRow, items]);

  const totalItems = items.filter((i) => i.material_id).length;
  const totalAmountInr = items.reduce((s, i) => s + (i.amount_inr || 0), 0);
  const freight = parseFloat(receipt.freight) || 0;
  const loadingCharges = parseFloat(receipt.loading_charges) || 0;
  const otherCharges = parseFloat(receipt.other_charges) || 0;
  const totalOtherCharges = freight + loadingCharges + otherCharges;
  const gstPercent = isPhysicalStock ? 0 : (parseFloat(receipt.gst_percent) || 0);
  const isIntra = receipt.tax_type === 'CGST_SGST';
  const gstTotal = totalAmountInr * gstPercent / 100;
  const cgstAmount = isIntra ? gstTotal / 2 : 0;
  const sgstAmount = isIntra ? gstTotal / 2 : 0;
  const igstAmount = isIntra ? 0 : gstTotal;
  const totalGstAmount = gstTotal;
  const grandTotal = totalAmountInr + totalGstAmount + totalOtherCharges;

  useEffect(() => {
    const validItems = items.filter((item) => item.material_id && (parseFloat(item.primary_uom_qty) || 0) > 0);
    if (loading || saving || isPosted || !receipt.warehouse_id || !receipt.receipt_date || !validItems.length) return;

    const timer = window.setTimeout(async () => {
      if (automaticSaveInFlight.current) return;
      automaticSaveInFlight.current = true;
      setDraftStatus('Saving draft to server…');
      const payload = {
        ...receipt,
        status: 'Draft',
        supplier_id: receipt.supplier_id ? Number(receipt.supplier_id) : null,
        warehouse_id: Number(receipt.warehouse_id),
        freight: parseFloat(receipt.freight) || 0,
        loading_charges: loadingCharges,
        other_charges: otherCharges,
        gst_percent: gstPercent,
        tax_type: receipt.tax_type,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_gst_amount: totalGstAmount,
        total_other_charges: totalOtherCharges,
        total_amount: totalAmountInr,
        grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          primary_uom: i.primary_uom,
          secondary_uom: i.secondary_uom,
          order_qty: parseFloat(i.order_qty) || 0,
          primary_uom_qty: parseFloat(i.primary_uom_qty) || 0,
          secondary_uom_qty: parseFloat(i.secondary_uom_qty) || 0,
          currency: i.currency,
          exchange_rate: parseFloat(i.exchange_rate) || 1,
          rate_fc: parseFloat(i.rate_fc) || 0,
          rate_inr: i.rate_inr,
          discount_percent: i.discount_percent,
          amount_fc: i.amount_fc,
          amount_inr: i.amount_inr,
          batch_no: null,
          expiry_date: i.expiry_date || null,
          manufacture_date: i.manufacture_date || null,
          shelf_life_months: i.shelf_life_months === '' ? null : Number(i.shelf_life_months),
        })),
      };

      try {
        if (isNew) {
          const res = await api<{ data: { id: number; receipt_no: string }; message: string }>('/material-receipts', { method: 'POST', body: JSON.stringify(payload) });
          clearLocalDraft();
          setDraftStatus('Draft saved to server');
          navigate(`/material-receipt/${res.data.id}`, { replace: true });
        } else if (id) {
          await api(`/material-receipts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
          setDraftStatus(`Draft saved to server at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
        }
      } catch {
        setDraftStatus('Could not save server draft — browser draft is safe');
      } finally {
        automaticSaveInFlight.current = false;
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [id, isNew, receipt, items, loading, saving, isPosted, freight, loadingCharges, otherCharges, gstPercent, cgstAmount, sgstAmount, igstAmount, totalGstAmount, totalOtherCharges, totalAmountInr, grandTotal, navigate]);

  const handleSave = async () => {
    if (!receipt.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!receipt.receipt_date) { toast.error('Receipt date is required'); return; }
    const validItems = items.filter((i) => i.material_id && (parseFloat(i.primary_uom_qty) > 0));
    if (!validItems.length) { toast.error('At least one item with quantity is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...receipt,
        status: 'Draft',
        supplier_id: receipt.supplier_id ? Number(receipt.supplier_id) : null,
        warehouse_id: Number(receipt.warehouse_id),
        freight, loading_charges: loadingCharges, other_charges: otherCharges,
        gst_percent: gstPercent,
        tax_type: receipt.tax_type,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_gst_amount: totalGstAmount,
        total_other_charges: totalOtherCharges,
        total_amount: totalAmountInr, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          primary_uom: i.primary_uom,
          secondary_uom: i.secondary_uom,
          order_qty: parseFloat(i.order_qty) || 0,
          primary_uom_qty: parseFloat(i.primary_uom_qty) || 0,
          secondary_uom_qty: parseFloat(i.secondary_uom_qty) || 0,
          currency: i.currency,
          exchange_rate: parseFloat(i.exchange_rate) || 1,
          rate_fc: parseFloat(i.rate_fc) || 0,
          rate_inr: i.rate_inr,
          discount_percent: i.discount_percent,
          amount_fc: i.amount_fc,
          amount_inr: i.amount_inr,
          batch_no: null,
          expiry_date: i.expiry_date || null,
          manufacture_date: i.manufacture_date || null,
          shelf_life_months: i.shelf_life_months === '' ? null : Number(i.shelf_life_months),
        })),
      };
      if (isNew) {
        const res = await api<{ data: { id: number; receipt_no: string }; message: string }>('/material-receipts', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt saved as Draft!');
        clearLocalDraft();
        navigate(`/material-receipt/${res.data.id}`);
      } else {
        const res = await api<{ message: string }>(`/material-receipts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt updated!');
      }
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handlePost = async () => {
    if (!receipt.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!receipt.receipt_date) { toast.error('Receipt date is required'); return; }
    const validItems = items.filter((i) => i.material_id && (parseFloat(i.primary_uom_qty) > 0));
    if (!validItems.length) { toast.error('At least one item with quantity is required'); return; }
    setPosting(true);
    try {
      const payload = {
        ...receipt,
        status: 'Posted',
        supplier_id: receipt.supplier_id ? Number(receipt.supplier_id) : null,
        warehouse_id: Number(receipt.warehouse_id),
        freight, loading_charges: loadingCharges, other_charges: otherCharges,
        gst_percent: gstPercent,
        tax_type: receipt.tax_type,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_gst_amount: totalGstAmount,
        total_other_charges: totalOtherCharges,
        total_amount: totalAmountInr, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          primary_uom: i.primary_uom,
          secondary_uom: i.secondary_uom,
          order_qty: parseFloat(i.order_qty) || 0,
          primary_uom_qty: parseFloat(i.primary_uom_qty) || 0,
          secondary_uom_qty: parseFloat(i.secondary_uom_qty) || 0,
          currency: i.currency,
          exchange_rate: parseFloat(i.exchange_rate) || 1,
          rate_fc: parseFloat(i.rate_fc) || 0,
          rate_inr: i.rate_inr,
          discount_percent: i.discount_percent,
          amount_fc: i.amount_fc,
          amount_inr: i.amount_inr,
          batch_no: null,
          expiry_date: i.expiry_date || null,
          manufacture_date: i.manufacture_date || null,
          shelf_life_months: i.shelf_life_months === '' ? null : Number(i.shelf_life_months),
        })),
      };
      if (isNew) {
        const res = await api<{ data: { id: number; receipt_no: string }; message: string }>('/material-receipts', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt posted!');
      } else {
        const res = await api<{ message: string }>(`/material-receipts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt posted!');
      }
      navigate('/material-receipt');
    } catch (err) { toast.error('Failed to post: ' + (err as Error).message); }
    finally { setPosting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/material-receipt')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Material Receipt' : 'Edit Material Receipt'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{receipt.receipt_no || 'Auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Receipt Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Receipt Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Receipt No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {receipt.receipt_no || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input label="Receipt Date" type="date" required value={receipt.receipt_date} onChange={(e) => update('receipt_date', e.target.value)} />
          <Select label="Supplier" required options={[{ value: '', label: 'Select supplier' }, ...suppliers.map((s) => ({ value: String(s.id), label: `${s.name}` }))]} value={receipt.supplier_id} onChange={(e) => update('supplier_id', e.target.value)} addNewPath="/supplier-master/new" addNewLabel="Add Supplier" />
          <Input label="Challan / Invoice No." value={receipt.challan_no} onChange={(e) => update('challan_no', e.target.value)} placeholder="INV-4587" />
          <Input label="Challan / Invoice Date" type="date" value={receipt.challan_date} onChange={(e) => update('challan_date', e.target.value)} />
          {/* Row 2 */}
          <Input label="Purchase Order No." value={receipt.purchase_order_no} onChange={(e) => update('purchase_order_no', e.target.value)} placeholder="Enter PO No." />
          <Input label="PO Date" type="date" value={receipt.po_date} onChange={(e) => update('po_date', e.target.value)} />
          <Input label="LR / GRN No." value={receipt.lr_grn_no} onChange={(e) => update('lr_grn_no', e.target.value)} placeholder="LR-7896" />
          <Input label="LR / GRN Date" type="date" value={receipt.lr_grn_date} onChange={(e) => update('lr_grn_date', e.target.value)} />
          <Input label="Transporter" value={receipt.transporter} onChange={(e) => update('transporter', e.target.value)} placeholder="Shree Logistics" />
          {/* Row 3 */}
          <Select label="Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={receipt.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} addNewPath="/warehouse-master/new" addNewLabel="Add Warehouse" />
          <Input label="Gate Entry No." value={receipt.gate_entry_no} onChange={(e) => update('gate_entry_no', e.target.value)} placeholder="GE-1254" />
          <Select label="Receipt Type" options={RECEIPT_TYPES} value={receipt.receipt_type} onChange={(e) => update('receipt_type', e.target.value)} />
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={receipt.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              placeholder="Material received in good condition."
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Item Details</h2>
            {draftStatus && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${draftStatus.startsWith('Could not') ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                {draftStatus}
              </span>
            )}
            <div className="relative">
              <input
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Search item by code / name / barcode"
                className="w-64 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-8"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => addItem(true)} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => { const last = items[items.length - 1]; if (last && items.length > 1) removeItem(last._key); }} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Minus size={14} /> Remove Row
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Code</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Name <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Primary UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Secondary UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Primary UOM Qty <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Sec. UOM Qty</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Currency</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Exchange Rate</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rate(FC)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rate(INR)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Discount %</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount(FC)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount(INR)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Mfg. Date</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Shelf Life (Months)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Expiry Date</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700 font-mono">{item.material_code || '-'}</td>
                  <td className="py-2.5 px-3">
                    <SearchableSelect
                      options={materials.map((m) => ({ value: String(m.id), label: m.display_name || (m.category_name ? `${m.name} (${m.category_name})` : m.name) }))}
                      value={item.material_id}
                      onChange={(val) => updateItem(item._key, 'material_id', val)}
                      placeholder="Search item..."
                      addNewPath="/chemical-master/new"
                      addNewLabel="Add Material"
                      autoFocus={focusedNewRow === item._key}
                      dataGridField={`${item._key}-item`}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.primary_uom || '-'}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.secondary_uom || 'NA'}</td>
                  <td className="py-2.5 px-3">
                    <input data-grid-field={`${item._key}-primary_uom_qty`} type="number" value={item.primary_uom_qty} onChange={(e) => updateItem(item._key, 'primary_uom_qty', e.target.value)} onKeyDown={(e) => handleGridKeyDown(e, item._key, 'primary_uom_qty')}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.secondary_uom_qty}
                      onChange={(e) => updateItem(item._key, 'secondary_uom_qty', e.target.value)}
                      disabled={!item.secondary_uom || item.secondary_uom === 'NA'}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right ${!item.secondary_uom || item.secondary_uom === 'NA' ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700 font-medium">{item.currency || 'INR'}</td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.currency === 'INR' ? '' : item.exchange_rate}
                      onChange={(e) => updateItem(item._key, 'exchange_rate', e.target.value)}
                      readOnly={item.currency === 'INR'} disabled={item.currency === 'INR'}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[70px] text-right ${item.currency === 'INR' ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder={item.currency === 'INR' ? '' : '1.00'} />
                  </td>
                  <td className="py-2.5 px-3">
                    <input data-grid-field={`${item._key}-rate_fc`} type="number" value={item.currency === 'INR' ? '' : item.rate_fc}
                      onChange={(e) => updateItem(item._key, 'rate_fc', e.target.value)}
                      onKeyDown={(e) => handleGridKeyDown(e, item._key, 'rate_fc')}
                      readOnly={item.currency === 'INR'} disabled={item.currency === 'INR'}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right ${item.currency === 'INR' ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder={item.currency === 'INR' ? '' : '0.00'} />
                  </td>
                  <td className="py-2.5 px-3">
                    {item.currency === 'INR' ? (
                      <input data-grid-field={`${item._key}-rate_inr`} type="number" value={item.rate_inr || ''}
                        onChange={(e) => updateItem(item._key, 'rate_inr', e.target.value)} onKeyDown={(e) => handleGridKeyDown(e, item._key, 'rate_inr')}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                    ) : (
                      <span className="block text-xs font-bold text-gray-700 text-right">{(item.rate_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {isPosted ? (
                      <span className="block text-xs font-bold text-gray-700 text-right">{(item.discount_percent || 0).toFixed(2)}%</span>
                    ) : (
                      <input data-grid-field={`${item._key}-discount_percent`} type="number" step="0.01" value={item.discount_percent || ''}
                        onChange={(e) => updateItem(item._key, 'discount_percent', e.target.value)} onKeyDown={(e) => handleGridKeyDown(e, item._key, 'discount_percent')}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[70px] text-right" placeholder="0" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{item.currency === 'INR' ? '' : (item.amount_fc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-teal-700 text-right">{(item.amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3">
                    <input type="date" value={item.manufacture_date}
                      onChange={(e) => updateItem(item._key, 'manufacture_date', e.target.value)}
                      disabled={isPosted}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[130px] ${isPosted ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" min="0" step="1" value={item.shelf_life_months}
                      onChange={(e) => updateItem(item._key, 'shelf_life_months', e.target.value)}
                      disabled={isPosted}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[90px] text-right ${isPosted ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="0" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="date" value={item.expiry_date} readOnly disabled
                      title="Expiry = Manufacture date + Shelf life (months)"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 min-w-[130px]" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Totals & GST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Amount (INR)</span>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-2 border-t border-gray-100" />
            {receipt.tax_type === 'CGST_SGST' ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    GST
                    <input type="number" value={isPhysicalStock ? '0' : receipt.gst_percent} onChange={(e) => update('gst_percent', e.target.value)}
                      disabled={isPhysicalStock}
                      className={`w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isPhysicalStock ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="0" />
                    % (CGST + SGST)
                  </span>
                </div>
                <div className="flex items-center justify-between pl-3">
                  <span className="text-xs text-gray-500">CGST ({(gstPercent / 2).toFixed(2)}%)</span>
                  <span className="text-xs font-semibold text-gray-700">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between pl-3">
                  <span className="text-xs text-gray-500">SGST ({(gstPercent / 2).toFixed(2)}%)</span>
                  <span className="text-xs font-semibold text-gray-700">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  IGST
                  <input type="number" value={isPhysicalStock ? '0' : receipt.gst_percent} onChange={(e) => update('gst_percent', e.target.value)}
                    disabled={isPhysicalStock}
                    className={`w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isPhysicalStock ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="0" />
                  %
                </span>
                <span className="text-xs font-semibold text-gray-700">{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Total GST Amount</span>
              <span className="text-sm font-bold text-gray-900">{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Middle - Other Charges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Other Charges</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Freight (₹)</span>
              <input type="number" value={receipt.freight} onChange={(e) => update('freight', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Loading / Unloading (₹)</span>
              <input type="number" value={receipt.loading_charges} onChange={(e) => update('loading_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Other Charges (₹)</span>
              <input type="number" value={receipt.other_charges} onChange={(e) => update('other_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Total Other Charges (₹)</span>
              <span className="text-sm font-bold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Right - Grand Total */}
          <div className="flex flex-col justify-center items-end space-y-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total Amount (INR)</span>
              <span className="text-sm font-semibold text-gray-900">{totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total GST Amount</span>
              <span className="text-sm font-semibold text-gray-900">{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total Other Charges</span>
              <span className="text-sm font-semibold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full pt-2 border-t border-orange-200">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-lg font-black text-orange-700">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        {/* Notes */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="flex items-start gap-2 text-xs text-gray-500">
            <Info size={13} className="text-gray-400 mt-0.5 shrink-0" />
            <span>
              <strong>Note:</strong> 1. Please verify quantity and quality before saving.<br />
              2. Stock will be updated in selected warehouse after saving.
            </span>
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/material-receipt')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleClear} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <RotateCcw size={14} /> Clear
        </button>
        <button onClick={() => setShowPostConfirm(true)} disabled={posting || isPosted || isNew} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={14} /> {posting ? 'Posting...' : isPosted ? 'Posted' : 'Post'}
        </button>
        <button onClick={handleSave} disabled={saving || isPosted} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Post Confirmation Dialog */}
      {showPostConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Send size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Posting</h3>
              <p className="text-sm text-gray-600">Are you sure you want to post this Material Receipt?</p>
              <p className="text-xs text-amber-600 mt-2">Once posted, the transaction will affect inventory and stock values.</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowPostConfirm(false)}
                className="flex-1 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowPostConfirm(false); handlePost(); }}
                disabled={posting}
                className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Confirm Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
