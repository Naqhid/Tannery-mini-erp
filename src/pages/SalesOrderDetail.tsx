import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Trash2, Save, X, Printer, Copy, Upload, Paperclip,
  Eye, Download, ChevronDown, Package, Truck, CreditCard, FileText,
  MessageSquare, Calendar, IndianRupee, AlertCircle, CheckCircle2,
  Clock, Ban, Send, MoreVertical,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

// ---- Types ----
interface Customer { id: number; code: string; name: string; contact_person?: string; address?: string; billing_address?: string; shipping_address?: string; payment_terms?: string; city?: string; state?: string; }
interface SalesOrderItem {
  _key?: string;
  product_id?: number | null;
  item_code: string;
  item_description: string;
  leather_type: string;
  finish_color: string;
  thickness: string;
  uom: string;
  quantity: number;
  input_qty: number;
  unit_price: number;
  discount_percent: number;
  amount: number;
  order_date: string;
  delivery_date: string;
}
interface DeliveryNote { id?: number; delivery_no?: string; delivery_date: string; delivery_from: string; transporter: string; vehicle_no: string; lr_no: string; no_of_packages: number | string; delivery_to: string; delivery_instructions: string; status: string; }
interface PaymentReceipt { id?: number; receipt_no?: string; receipt_date: string; payment_mode: string; amount: number; remarks: string; }
interface Invoice { id?: number; invoice_no?: string; invoice_date?: string; invoice_amount: number; paid_amount: number; balance: number; status: string; due_date?: string; }
interface Attachment { id?: number; file_name: string; file_path?: string; file_type?: string; category: string; uploaded_at?: string; remarks?: string; }
interface ProductDropdown { id: number; code: string; name: string; leather_type: string; thickness: string; uom: string; leather_type_name?: string; uom_name?: string; thickness_name?: string; color_name?: string; finish_type_name?: string; display_name?: string; }

interface SalesOrderFull {
  id?: number;
  order_no?: string;
  customer_id: number | null;
  customer_name?: string;
  order_date: string;
  delivery_date: string;
  customer_po_no: string;
  order_type: string;
  contact_person: string;
  delivery_address: string;
  payment_terms: string;
  currency: string;
  price_list: string;
  sales_person: string;
  status: string;
  terms_conditions: string;
  discount: number;
  freight: number;
  tax_percent: number;
  sub_total: number;
  tax_amount: number;
  grand_total: number;
  remarks: string;
  items: SalesOrderItem[];
  deliveries: DeliveryNote[];
  receipts: PaymentReceipt[];
  invoices: Invoice[];
  attachments: Attachment[];
}

const emptyOrder: SalesOrderFull = {
  customer_id: null, order_date: new Date().toISOString().split('T')[0],
  delivery_date: '', customer_po_no: '', order_type: 'Standard', contact_person: '',
  delivery_address: '', payment_terms: '', currency: 'INR', price_list: '',
  sales_person: '', status: 'Draft', terms_conditions: '', discount: 0, freight: 0,
  tax_percent: 18, sub_total: 0, tax_amount: 0, grand_total: 0, remarks: '',
  items: [], deliveries: [], receipts: [], invoices: [], attachments: [],
};

const emptyItem: SalesOrderItem = {
  _key: '', product_id: null, item_code: '', item_description: '', leather_type: '', finish_color: '',
  thickness: '', uom: 'Sq.Ft.', quantity: 0, input_qty: 0, unit_price: 0, discount_percent: 0, amount: 0,
  order_date: '', delivery_date: '',
};

const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  Draft: { color: 'text-slate-700', icon: Clock, bg: 'bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300' },
  Confirmed: { color: 'text-emerald-700', icon: CheckCircle2, bg: 'bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300' },
  Processing: { color: 'text-blue-700', icon: Package, bg: 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300' },
  Shipped: { color: 'text-violet-700', icon: Truck, bg: 'bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300' },
  Delivered: { color: 'text-teal-700', icon: CheckCircle2, bg: 'bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-300' },
  Cancelled: { color: 'text-rose-600', icon: Ban, bg: 'bg-gradient-to-r from-rose-100 to-red-100 border-rose-300' },
};

const PAYMENT_TERMS_OPTS = ['Advance', '30 Days', '45 Days', '60 Days', '90 Days', 'Letter of Credit'];
const CURRENCY_OPTS = ['INR - Indian Rupee', 'USD - US Dollar', 'EUR - Euro', 'GBP - British Pound'];
const ORDER_TYPE_OPTS = ['Standard', 'Export', 'Sample', 'Replacement'];
const ATTACHMENT_CATS = ['Commercial Documents', 'Packing Documents', 'Transport Documents', 'Quality Documents', 'Others'];

function calcItem(item: SalesOrderItem): SalesOrderItem {
  const disc = (item.unit_price * item.quantity * item.discount_percent) / 100;
  const amount = parseFloat(((item.unit_price * item.quantity) - disc).toFixed(2));
  return { ...item, amount };
}

function calcTotals(items: SalesOrderItem[], discount: number, freight: number, taxPercent: number) {
  const subTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const taxable = subTotal - discount + freight;
  const taxAmount = parseFloat(((taxable * taxPercent) / 100).toFixed(2));
  const grandTotal = parseFloat((taxable + taxAmount).toFixed(2));
  return { sub_total: parseFloat(subTotal.toFixed(2)), tax_amount: taxAmount, grand_total: grandTotal };
}


export default function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [order, setOrder] = useState<SalesOrderFull>(emptyOrder);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'payment' | 'attachments' | 'remarks'>('items');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesOrderItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState<SalesOrderItem>({ ...emptyItem });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newReceipt, setNewReceipt] = useState<PaymentReceipt>({ receipt_date: '', payment_mode: 'Bank Transfer', amount: 0, remarks: '' });
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryNote>({ delivery_date: '', delivery_from: '', transporter: '', vehicle_no: '', lr_no: '', no_of_packages: '', delivery_to: '', delivery_instructions: '', status: 'Draft' });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<Invoice>({ invoice_date: '', invoice_amount: 0, paid_amount: 0, balance: 0, status: 'Pending', due_date: '' });
  const [uploadCategory, setUploadCategory] = useState('Others');
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api<{ data: Customer[] }>('/customers?limit=500');
      setCustomers(res.data || []);
    } catch { setCustomers([]); }
  }, []);

  const [products, setProducts] = useState<ProductDropdown[]>([]);
  const fetchProducts = useCallback(async () => {
    try {
      const res = await api<{ data: ProductDropdown[] }>('/products/dropdown');
      setProducts(res.data || []);
    } catch { setProducts([]); }
  }, []);

  const fetchOrder = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: SalesOrderFull }>(`/sales-orders/${id}`);
      const d = res.data;
      setOrder({
        ...emptyOrder,
        ...d,
        order_date: d.order_date?.split('T')[0] || '',
        delivery_date: d.delivery_date?.split('T')[0] || '',
        discount: Number(d.discount) || 0,
        freight: Number(d.freight) || 0,
        tax_percent: Number(d.tax_percent) || 18,
        sub_total: Number(d.sub_total) || 0,
        tax_amount: Number(d.tax_amount) || 0,
        grand_total: Number(d.grand_total) || 0,
        items: (d.items || []).map(i => ({ ...i, _key: String(Math.random()), quantity: Number(i.quantity) || 0, input_qty: Number(i.input_qty) || 0, unit_price: Number(i.unit_price) || 0, discount_percent: Number(i.discount_percent) || 0, amount: Number(i.amount) || 0, order_date: i.order_date?.split('T')[0] || '', delivery_date: i.delivery_date?.split('T')[0] || '' })),
        deliveries: d.deliveries || [],
        receipts: d.receipts || [],
        invoices: d.invoices || [],
        attachments: d.attachments || [],
      });
    } catch { toast.error('Failed to load order'); navigate('/sales-orders'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  const fetchNextOrderNo = useCallback(async () => {
    if (!isNew) return;
    try {
      const res = await api<{ data: { order_no: string } }>('/sales-orders/next-no');
      if (res.data?.order_no) {
        setOrder(prev => ({ ...prev, order_no: res.data.order_no }));
      }
    } catch { /* ignore preview failure */ }
  }, [isNew]);

  useEffect(() => { fetchCustomers(); fetchProducts(); fetchOrder(); fetchNextOrderNo(); }, [fetchCustomers, fetchProducts, fetchOrder, fetchNextOrderNo]);

  const updateField = (field: keyof SalesOrderFull, value: any) => {
    setOrder(prev => {
      const updated = { ...prev, [field]: value };
      const tots = calcTotals(updated.items, Number(updated.discount), Number(updated.freight), Number(updated.tax_percent));
      return { ...updated, ...tots };
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === Number(customerId));
    // Auto-populate delivery & shipping details based on customer selection
    const shipping = customer?.shipping_address || customer?.billing_address || customer?.address || '';
    setOrder(prev => ({
      ...prev,
      customer_id: customer ? customer.id : null,
      contact_person: customer?.contact_person || prev.contact_person,
      delivery_address: shipping || prev.delivery_address,
      payment_terms: customer?.payment_terms || prev.payment_terms,
    }));
    // Pre-fill delivery note defaults for the delivery tab
    setDeliveryForm(prev => ({
      ...prev,
      delivery_to: shipping || prev.delivery_to,
    }));
  };

  // Items
  const openAddItem = () => { setEditingItem(null); setItemForm({ ...emptyItem, _key: String(Math.random()) }); setShowItemModal(true); };
  const openEditItem = (item: SalesOrderItem) => { setEditingItem(item); setItemForm({ ...item }); setShowItemModal(true); };

  const handleSaveItem = async () => {
    if (!itemForm.item_description) { toast.error('Item description is required'); return; }
    if (!itemForm.quantity) { toast.error('Quantity is required'); return; }
    const computed = calcItem(itemForm);
    let newItems: SalesOrderItem[];
    if (editingItem) {
      newItems = order.items.map(i => i._key === editingItem._key ? computed : i);
    } else {
      newItems = [...order.items, computed];
    }
    const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
    const updatedOrder = { ...order, items: newItems, ...tots };

    // For new orders that haven't been saved yet, just update local state
    if (isNew) {
      setOrder(updatedOrder);
      setShowItemModal(false);
      return;
    }

    // For existing orders, call the API immediately
    try {
      const payload = { ...updatedOrder, items: newItems.map(({ _key, ...rest }) => rest) };
      await api(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success(editingItem ? 'Item updated!' : 'Item added!');
      setShowItemModal(false);
      fetchOrder();
    } catch (err) { toast.error('Failed to save item: ' + (err as Error).message); }
  };

  const handleDeleteItem = async (key: string) => {
    const newItems = order.items.filter(i => i._key !== key);
    const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
    const updatedOrder = { ...order, items: newItems, ...tots };

    if (isNew) {
      setOrder(updatedOrder);
      return;
    }

    try {
      const payload = { ...updatedOrder, items: newItems.map(({ _key, ...rest }) => rest) };
      await api(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Item removed!');
      fetchOrder();
    } catch (err) { toast.error('Failed to delete item: ' + (err as Error).message); }
  };

  const handleSave = async () => {
    if (!order.customer_id) { toast.error('Customer is required'); return; }
    if (!order.order_date) { toast.error('Order date is required'); return; }
    setSaving(true);
    try {
      const payload = { ...order, items: order.items.map(({ _key, ...rest }) => rest) };
      if (isNew) {
        // Let the backend generate a fresh order number to avoid duplicates
        delete (payload as any).order_no;
        const res = await api<any>('/sales-orders', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Sales order created!');
        navigate('/sales-orders');
      } else {
        const res = await api<any>(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Sales order updated!');
        navigate('/sales-orders');
      }
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleCopyOrder = async () => {
    const newOrder = { ...order, id: undefined, order_no: undefined, status: 'Draft', customer_po_no: '', items: order.items.map(({ _key, ...rest }) => rest) };
    try {
      const res = await api<any>('/sales-orders', { method: 'POST', body: JSON.stringify(newOrder) });
      toast.success('Order copied!');
      navigate(`/sales-orders/${res.data.id}`);
    } catch (err) { toast.error('Failed to copy: ' + (err as Error).message); }
  };

  // Delivery
  const handleSaveDelivery = async () => {
    if (isNew) { toast.info('Save the order first'); return; }
    try {
      const items = order.items.map(i => ({ item_code: i.item_code, item_description: i.item_description, uom: i.uom, ordered_qty: i.quantity, shipped_qty: i.quantity, pending_qty: 0 }));
      await api(`/sales-orders/${id}/delivery`, { method: 'POST', body: JSON.stringify({ ...deliveryForm, delivery_to: order.delivery_address, items }) });
      toast.success('Delivery note created!');
      setShowDeliveryModal(false);
      setDeliveryForm({ delivery_date: '', delivery_from: '', transporter: '', vehicle_no: '', lr_no: '', no_of_packages: '', delivery_to: '', delivery_instructions: '', status: 'Draft' });
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const handleDeleteDelivery = async (dnId: number) => {
    try {
      await api(`/sales-orders/${id}/delivery/${dnId}`, { method: 'DELETE' });
      toast.success('Delivery note deleted!');
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  // Payment Receipt
  const handleSaveReceipt = async () => {
    if (isNew) { toast.info('Save the order first'); return; }
    if (!newReceipt.receipt_date || !newReceipt.amount) { toast.error('Date and Amount are required'); return; }
    try {
      await api(`/sales-orders/${id}/payments`, { method: 'POST', body: JSON.stringify(newReceipt) });
      toast.success('Payment receipt added!');
      setShowReceiptModal(false);
      setNewReceipt({ receipt_date: '', payment_mode: 'Bank Transfer', amount: 0, remarks: '' });
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const handleDeleteReceipt = async (receiptId: number) => {
    try {
      await api(`/sales-orders/${id}/payments/${receiptId}`, { method: 'DELETE' });
      toast.success('Receipt removed!');
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  // Invoices
  const handleSaveInvoice = async () => {
    if (isNew) { toast.info('Save the order first'); return; }
    if (!invoiceForm.invoice_amount) { toast.error('Invoice amount is required'); return; }
    try {
      const payload = { ...invoiceForm, balance: (invoiceForm.invoice_amount || 0) - (invoiceForm.paid_amount || 0) };
      await api(`/sales-orders/${id}/invoices`, { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Invoice created!');
      setShowInvoiceModal(false);
      setInvoiceForm({ invoice_date: '', invoice_amount: 0, paid_amount: 0, balance: 0, status: 'Pending', due_date: '' });
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await api(`/sales-orders/${id}/invoices/${invoiceId}`, { method: 'DELETE' });
      toast.success('Invoice deleted!');
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  // Attachments
  const handleFileUpload = async () => {
    if (isNew) { toast.info('Save the order first'); return; }
    if (!selectedFile) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('category', uploadCategory);
      fd.append('remarks', uploadRemarks);
      const token = localStorage.getItem('tannery_token');
      const res = await fetch(`/api/sales-orders/${id}/attachments`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      toast.success('File uploaded!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadCategory('Others');
      setUploadRemarks('');
      fetchOrder();
    } catch (err) { toast.error('Upload failed: ' + (err as Error).message); }
    finally { setUploadingFile(false); }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await api(`/sales-orders/${id}/attachments/${attachmentId}`, { method: 'DELETE' });
      toast.success('Attachment removed!');
      fetchOrder();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const totalReceived = order.receipts.reduce((s, r) => s + Number(r.amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    </div>
  );

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Draft;
  const StatusIcon = statusConfig.icon;

  const tabs = [
    { id: 'items' as const, label: 'Items', icon: Package, count: order.items.length },
    { id: 'payment' as const, label: 'Payment Details', icon: CreditCard, count: order.receipts.length },
    { id: 'attachments' as const, label: 'Attachments', icon: Paperclip, count: order.attachments.length },
    { id: 'remarks' as const, label: 'Remarks', icon: MessageSquare },
  ];


  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 shadow-xl shadow-blue-300/40 ring-2 ring-white/50">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {isNew ? 'New Sales Order' : `Sales Order`}
                </h1>
                {!isNew && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} shadow-sm`}>
                    <StatusIcon size={14} />
                    {order.status}
                  </span>
                )}
              </div>
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-medium">
                <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600 transition-colors">Home</button>
                <span>›</span>
                <button onClick={() => navigate('/sales-orders')} className="hover:text-blue-600 transition-colors">Sales Orders</button>
                {order.order_no && <><span>›</span><span className="text-gray-600 font-semibold">{order.order_no}</span></>}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Printer size={15} /> Print
              </button>
              <button onClick={handleCopyOrder} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Copy size={15} /> Duplicate
              </button>
            </>
          )}
          <button onClick={() => navigate('/sales-orders/new')} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-blue-300/40 hover:shadow-xl hover:scale-105 transition-all active:scale-95">
            <Plus size={15} /> New Order
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Form Section */}
        <div className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Order No.</label>
              <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono font-bold min-h-[38px] flex items-center">
                {order.order_no || <span className="italic text-gray-400 font-normal">Generating...</span>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Customer <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={customers.map(c => ({ value: String(c.id), label: c.name }))}
                value={String(order.customer_id || '')}
                onChange={(v) => handleCustomerChange(v)}
                placeholder="Select customer *"
              />
            </div>
            <Input label="Order Date" required type="date" value={order.order_date} onChange={(e) => updateField('order_date', e.target.value)} />
            <Input label="Customer PO No." value={order.customer_po_no} placeholder="PO reference number" onChange={(e) => updateField('customer_po_no', e.target.value)} />
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Order Type" options={ORDER_TYPE_OPTS.map(o => ({ value: o, label: o }))} value={order.order_type} onChange={(e) => updateField('order_type', e.target.value)} />
            <Input label="Contact Person" value={order.contact_person} placeholder="Contact name" onChange={(e) => updateField('contact_person', e.target.value)} />
            <Select label="Payment Terms" options={[{ value: '', label: 'Select terms' }, ...PAYMENT_TERMS_OPTS.map(o => ({ value: o, label: o }))]} value={order.payment_terms} onChange={(e) => updateField('payment_terms', e.target.value)} />
            <Select label="Currency" options={CURRENCY_OPTS.map(o => ({ value: o.split(' - ')[0], label: o }))} value={order.currency} onChange={(e) => updateField('currency', e.target.value)} />
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Address</label>
              <textarea rows={3} value={order.delivery_address} onChange={(e) => updateField('delivery_address', e.target.value)} placeholder="Delivery address" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white transition-all" />
            </div>
            <Select label="Status" options={['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => ({ value: s, label: s }))} value={order.status} onChange={(e) => updateField('status', e.target.value)} />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100">
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <div className="flex items-center gap-0.5 bg-gray-100/80 p-1 rounded-xl">
              {tabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-sm border border-gray-200/60'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <TabIcon size={13} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div>
              {activeTab === 'items' && (
                <button onClick={() => {
                  const newItem: SalesOrderItem = { ...emptyItem, _key: String(Math.random()) };
                  setOrder(prev => ({ ...prev, items: [...prev.items, newItem] }));
                }} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                  <Plus size={13} /> Add Item
                </button>
              )}
              {activeTab === 'payment' && !isNew && (
                null
              )}
              {activeTab === 'attachments' && !isNew && (
                <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                  <Upload size={13} /> Upload File
                </button>
              )}
            </div>
          </div>

          <div className="p-6">

            {/* ==================== ITEMS TAB ==================== */}
            {activeTab === 'items' && (
              <div className="space-y-5">
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                        {['#', 'Article Code', 'Article', 'Color', 'Thickness', 'UOM', 'Qty', 'Input', 'Order Date', 'Delivery Date', `Rate (${order.currency || 'INR'})`, 'Discount %', `Amount (${order.currency || 'INR'})`, ''].map(h => (
                          <th key={h} className="text-left py-3 px-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.length === 0 ? (
                        <tr><td colSpan={14} className="py-12 text-center">
                          <Package size={32} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-sm font-medium text-gray-500">No items added yet</p>
                          <p className="text-xs text-gray-400 mt-1">Click "Add Item" to add a row</p>
                        </td></tr>
                      ) : order.items.map((item, i) => (
                        <tr key={item._key || i} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3.5 text-gray-400 font-medium">{i + 1}</td>
                          <td className="py-2.5 px-3.5">
                            <input value={item.item_code} readOnly className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 min-w-[90px] cursor-not-allowed" placeholder="Code" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <SearchableSelect
                              options={[{ value: '', label: '-- Select Article --' }, ...products.map(p => ({ value: String(p.id), label: p.name }))]}
                              value={item.product_id ? String(item.product_id) : ''}
                              onChange={(val) => {
                                const productId = Number(val);
                                const product = products.find(p => p.id === productId);
                                const newItems = order.items.map(it => it._key === item._key ? {
                                  ...it,
                                  product_id: productId || null,
                                  item_code: product?.code || '',
                                  item_description: product?.name || '',
                                  leather_type: product?.leather_type_name || product?.leather_type || '',
                                  finish_color: product?.color_name || '',
                                  thickness: product?.thickness_name || product?.thickness || '',
                                  uom: product?.uom_name || product?.uom || '',
                                } : it);
                                setOrder(prev => ({ ...prev, items: newItems }));
                              }}
                              placeholder="Search article..."
                            />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input value={item.finish_color} readOnly className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 min-w-[80px] cursor-not-allowed" placeholder="Color" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input value={item.thickness} readOnly className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 min-w-[60px] cursor-not-allowed" placeholder="mm" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input value={item.uom} readOnly className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 min-w-[60px] cursor-not-allowed" placeholder="UOM" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="number" value={item.quantity} onChange={(e) => {
                              const updated = calcItem({ ...item, quantity: Number(e.target.value) });
                              const newItems = order.items.map(it => it._key === item._key ? updated : it);
                              const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
                              setOrder(prev => ({ ...prev, items: newItems, ...tots }));
                            }} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-400/30 min-w-[60px]" placeholder="0" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="number" value={item.input_qty} onChange={(e) => {
                              const newItems = order.items.map(it => it._key === item._key ? { ...it, input_qty: Number(e.target.value) } : it);
                              setOrder(prev => ({ ...prev, items: newItems }));
                            }} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-400/30 min-w-[60px]" placeholder="0" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="date" value={item.order_date} onChange={(e) => {
                              const newItems = order.items.map(it => it._key === item._key ? { ...it, order_date: e.target.value } : it);
                              setOrder(prev => ({ ...prev, items: newItems }));
                            }} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 min-w-[140px]" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="date" value={item.delivery_date} onChange={(e) => {
                              const newItems = order.items.map(it => it._key === item._key ? { ...it, delivery_date: e.target.value } : it);
                              setOrder(prev => ({ ...prev, items: newItems }));
                            }} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 min-w-[140px]" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="number" value={item.unit_price} onChange={(e) => {
                              const updated = calcItem({ ...item, unit_price: Number(e.target.value) });
                              const newItems = order.items.map(it => it._key === item._key ? updated : it);
                              const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
                              setOrder(prev => ({ ...prev, items: newItems, ...tots }));
                            }} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-400/30 min-w-[70px]" placeholder="0.00" />
                          </td>
                          <td className="py-2.5 px-3.5">
                            <input type="number" value={item.discount_percent} onChange={(e) => {
                              const updated = calcItem({ ...item, discount_percent: Number(e.target.value) });
                              const newItems = order.items.map(it => it._key === item._key ? updated : it);
                              const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
                              setOrder(prev => ({ ...prev, items: newItems, ...tots }));
                            }} min={0} max={100} className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400/30" placeholder="0" />
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                          <td className="py-2.5 px-3.5">
                            <button onClick={() => handleDeleteItem(item._key!)} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Terms & Conditions</label>
                    <textarea
                      rows={4}
                      value={order.terms_conditions}
                      onChange={(e) => updateField('terms_conditions', e.target.value)}
                      placeholder="Enter terms and conditions..."
                      className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white transition-all"
                    />
                  </div>

                  <div className="w-full lg:w-80">
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">Sub Total</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.sub_total)}</span>
                      </div>
                      {(() => {
                        const itemDiscount = order.items.reduce((sum, i) => sum + ((i.unit_price * i.quantity * i.discount_percent) / 100), 0);
                        return itemDiscount > 0 ? (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-600">Item Discount</span>
                            <span className="text-sm text-rose-600 font-medium">-{formatCurrency(parseFloat(itemDiscount.toFixed(2)))}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">Additional Discount</span>
                        <div className="flex items-center gap-2">
                          <input type="number" value={order.discount} onChange={(e) => updateField('discount', Number(e.target.value))} min={0} className="w-20 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all" />
                          <span className="text-xs text-gray-500 w-20 text-right">-{formatCurrency(order.discount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">Freight</span>
                        <input type="number" value={order.freight} onChange={(e) => updateField('freight', Number(e.target.value))} min={0} className="w-28 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all" />
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">Tax ({order.tax_percent}%)</span>
                        <span className="text-sm text-gray-800 w-24 text-right">{formatCurrency(order.tax_amount)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-gray-900">Grand Total</span>
                          <span className="text-lg font-bold text-blue-700">{formatCurrency(order.grand_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ==================== PAYMENT DETAILS TAB ==================== */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Order Amount', value: formatCurrency(order.grand_total), icon: IndianRupee, color: 'from-blue-500 to-indigo-600' },
                  ].map(card => {
                    const CardIcon = card.icon;
                    return (
                      <div key={card.label} className="relative overflow-hidden rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                        <div className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 -mr-4 -mt-4`} />
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${card.color}`}>
                            <CardIcon size={12} className="text-white" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{card.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Payment Terms Sidebar */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 p-5 space-y-4">
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Payment Terms</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold text-blue-400 uppercase">Terms</p>
                          <p className="text-sm font-semibold text-blue-900 mt-0.5">{order.payment_terms || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-blue-400 uppercase">Due Date</p>
                          <p className="text-sm font-semibold text-blue-900 mt-0.5">
                            {order.order_date ? new Date(new Date(order.order_date).getTime() + (order.payment_terms === '30 Days' ? 30 : order.payment_terms === '45 Days' ? 45 : order.payment_terms === '90 Days' ? 90 : 60) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-blue-400 uppercase">Customer</p>
                          <p className="text-sm font-semibold text-blue-900 mt-0.5">{order.customer_name || customers.find(c => c.id === order.customer_id)?.name || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ==================== ATTACHMENTS TAB ==================== */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setShowUploadModal(true); } e.target.value = ''; }} />

                {order.attachments.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-14 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors mb-4">
                      <Upload size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-700 transition-colors">Click to upload or drag files here</p>
                    <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, XLS, PNG, JPG — Max 10MB</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Grid of attachment cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.attachments.map((att: any, i) => (
                        <div key={att.id || i} className="group relative border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all bg-white">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl shrink-0 ${att.file_type === 'PDF' ? 'bg-red-50' : att.file_type === 'DOC' || att.file_type === 'DOCX' ? 'bg-blue-50' : att.file_type === 'XLS' || att.file_type === 'XLSX' ? 'bg-green-50' : 'bg-purple-50'}`}>
                              <Paperclip size={16} className={`${att.file_type === 'PDF' ? 'text-red-500' : att.file_type === 'DOC' || att.file_type === 'DOCX' ? 'text-blue-500' : att.file_type === 'XLS' || att.file_type === 'XLSX' ? 'text-green-500' : 'text-purple-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{att.file_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">{att.file_type || 'FILE'}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] text-gray-400">{att.category}</span>
                              </div>
                              {att.remarks && <p className="text-xs text-gray-500 mt-1 truncate">{att.remarks}</p>}
                              <p className="text-[10px] text-gray-400 mt-1.5">{att.uploaded_at ? new Date(att.uploaded_at).toLocaleDateString('en-IN') : ''}</p>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={att.file_path} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye size={13} /></a>
                            <a href={att.file_path} download className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"><Download size={13} /></a>
                            <button onClick={() => att.id && handleDeleteAttachment(att.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 px-1">{order.attachments.length} file{order.attachments.length !== 1 ? 's' : ''} uploaded</p>
                  </div>
                )}
              </div>
            )}

            {/* ==================== REMARKS TAB ==================== */}
            {activeTab === 'remarks' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-blue-600" />
                  <label className="text-sm font-bold text-gray-800">Order Remarks & Notes</label>
                </div>
                <textarea
                  rows={8}
                  value={order.remarks}
                  onChange={(e) => updateField('remarks', e.target.value)}
                  placeholder="Enter any remarks, internal notes, or special instructions for this order..."
                  className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white transition-all leading-relaxed"
                />
                <p className="text-xs text-gray-400">Remarks are saved when you save the order. These are visible only internally.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {!isNew && order.order_no ? (
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div><span className="font-semibold text-gray-600">Created</span><p className="mt-0.5">{order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '—'}</p></div>
            </div>
          ) : <div />}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/sales-orders')} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-200/50 transition-all disabled:opacity-50">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </div>
      </div>


      {/* ==================== MODALS ==================== */}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowDeliveryModal(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100"><Truck size={14} className="text-indigo-600" /></div>
                <h3 className="text-sm font-bold text-gray-900">Create Delivery Note</h3>
              </div>
              <button onClick={() => setShowDeliveryModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Input label="Delivery Note No." value={deliveryForm.delivery_no || ''} placeholder="Auto-generated if empty" onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_no: e.target.value }))} />
              <Input label="Delivery Date" type="date" value={deliveryForm.delivery_date} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_date: e.target.value }))} />
              <Input label="Delivery From" value={deliveryForm.delivery_from} placeholder="e.g. Main Warehouse" onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_from: e.target.value }))} />
              <Input label="Transporter" value={deliveryForm.transporter} placeholder="Transporter name" onChange={(e) => setDeliveryForm(p => ({ ...p, transporter: e.target.value }))} />
              <Input label="Vehicle No." value={deliveryForm.vehicle_no} placeholder="Vehicle number" onChange={(e) => setDeliveryForm(p => ({ ...p, vehicle_no: e.target.value }))} />
              <Input label="LR / AWB No." value={deliveryForm.lr_no} placeholder="LR or AWB number" onChange={(e) => setDeliveryForm(p => ({ ...p, lr_no: e.target.value }))} />
              <Input label="No. of Packages" type="number" value={String(deliveryForm.no_of_packages)} onChange={(e) => setDeliveryForm(p => ({ ...p, no_of_packages: e.target.value }))} />
              <Select label="Status" options={[{ value: 'Draft', label: 'Draft' }, { value: 'Dispatched', label: 'Dispatched' }, { value: 'Delivered', label: 'Delivered' }]} value={deliveryForm.status} onChange={(e) => setDeliveryForm(p => ({ ...p, status: e.target.value }))} />
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Instructions</label>
                <textarea rows={2} value={deliveryForm.delivery_instructions} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_instructions: e.target.value }))} placeholder="Special delivery instructions..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setShowDeliveryModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleSaveDelivery} className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all">Create Delivery</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowReceiptModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100"><CreditCard size={14} className="text-green-600" /></div>
                <h3 className="text-sm font-bold text-gray-900">Add Payment Receipt</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Receipt Date" required type="date" value={newReceipt.receipt_date} onChange={(e) => setNewReceipt(p => ({ ...p, receipt_date: e.target.value }))} />
              <Select label="Payment Mode" options={['Bank Transfer', 'Cheque', 'Cash', 'NEFT', 'RTGS', 'UPI'].map(m => ({ value: m, label: m }))} value={newReceipt.payment_mode} onChange={(e) => setNewReceipt(p => ({ ...p, payment_mode: e.target.value }))} />
              <Input label="Amount (₹)" required type="number" value={String(newReceipt.amount)} onChange={(e) => setNewReceipt(p => ({ ...p, amount: Number(e.target.value) }))} />
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea rows={2} value={newReceipt.remarks} onChange={(e) => setNewReceipt(p => ({ ...p, remarks: e.target.value }))} placeholder="e.g. Advance payment received" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setShowReceiptModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleSaveReceipt} className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-sm transition-all">Save Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowInvoiceModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100"><FileText size={14} className="text-amber-600" /></div>
                <h3 className="text-sm font-bold text-gray-900">Create Invoice</h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Invoice Date" type="date" value={invoiceForm.invoice_date || ''} onChange={(e) => setInvoiceForm(p => ({ ...p, invoice_date: e.target.value }))} />
              <Input label="Invoice Amount (₹)" required type="number" value={String(invoiceForm.invoice_amount)} onChange={(e) => setInvoiceForm(p => ({ ...p, invoice_amount: Number(e.target.value), balance: Number(e.target.value) - p.paid_amount }))} />
              <Input label="Paid Amount (₹)" type="number" value={String(invoiceForm.paid_amount)} onChange={(e) => setInvoiceForm(p => ({ ...p, paid_amount: Number(e.target.value), balance: p.invoice_amount - Number(e.target.value) }))} />
              <Input label="Due Date" type="date" value={invoiceForm.due_date || ''} onChange={(e) => setInvoiceForm(p => ({ ...p, due_date: e.target.value }))} />
              <Select label="Status" options={['Pending', 'Partially Paid', 'Paid', 'Cancelled'].map(s => ({ value: s, label: s }))} value={invoiceForm.status} onChange={(e) => setInvoiceForm(p => ({ ...p, status: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleSaveInvoice} className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 shadow-sm transition-all">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Attachment Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100"><Upload size={14} className="text-purple-600" /></div>
                <h3 className="text-sm font-bold text-gray-900">Upload Attachment</h3>
              </div>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {selectedFile ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Paperclip size={16} className="text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-blue-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => { setSelectedFile(null); fileRef.current?.click(); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Change</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-all" onClick={() => fileRef.current?.click()}>
                  <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to select a file</p>
                </div>
              )}
              <Select label="Category" options={ATTACHMENT_CATS.map(c => ({ value: c, label: c }))} value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} />
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea rows={2} value={uploadRemarks} onChange={(e) => setUploadRemarks(e.target.value)} placeholder="Optional notes about this file..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleFileUpload} disabled={!selectedFile || uploadingFile} className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all disabled:opacity-50">
                {uploadingFile ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
