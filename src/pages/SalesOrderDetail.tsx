import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Trash2, Save, X, Edit2, Printer, Copy, Upload, Paperclip,
  Eye, Download, ChevronDown,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

// ---- Types ----
interface Customer { id: number; code: string; name: string; contact_person?: string; address?: string; }
interface SalesOrderItem {
  _key?: string;
  item_code: string;
  item_description: string;
  leather_type: string;
  finish_color: string;
  thickness: string;
  uom: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  amount: number;
}
interface DeliveryItem { item_code: string; item_description: string; uom: string; ordered_qty: number; shipped_qty: number; pending_qty: number; }
interface PaymentReceipt { id?: number; receipt_no?: string; receipt_date: string; payment_mode: string; amount: number; remarks: string; }
interface Invoice { id?: number; invoice_no?: string; invoice_date?: string; invoice_amount: number; paid_amount: number; balance: number; status: string; }
interface Attachment { id?: number; file_name: string; file_type?: string; category: string; uploaded_at?: string; remarks?: string; }

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
  deliveries: any[];
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
  _key: '', item_code: '', item_description: '', leather_type: '', finish_color: '',
  thickness: '', uom: 'Sq.Ft.', quantity: 0, unit_price: 0, discount_percent: 0, amount: 0,
};

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Confirmed: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
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
  const [activeTab, setActiveTab] = useState<'items' | 'delivery' | 'payment' | 'attachments' | 'remarks'>('items');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesOrderItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState<SalesOrderItem>({ ...emptyItem });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newReceipt, setNewReceipt] = useState<PaymentReceipt>({ receipt_date: '', payment_mode: 'Bank Transfer', amount: 0, remarks: '' });
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ delivery_no: '', delivery_date: '', delivery_from: '', transporter: '', vehicle_no: '', lr_no: '', no_of_packages: '', delivery_to: '', delivery_instructions: '', status: 'Draft' });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api<{ data: Customer[] }>('/customers?limit=500');
      setCustomers(res.data || []);
    } catch { setCustomers([]); }
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
        items: (d.items || []).map(i => ({ ...i, _key: String(Math.random()) })),
        deliveries: d.deliveries || [],
        receipts: d.receipts || [],
        invoices: d.invoices || [],
        attachments: d.attachments || [],
      });
    } catch { toast.error('Failed to load order'); navigate('/sales-orders'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchCustomers(); fetchOrder(); }, [fetchCustomers, fetchOrder]);

  const updateField = (field: keyof SalesOrderFull, value: any) => {
    setOrder(prev => {
      const updated = { ...prev, [field]: value };
      const tots = calcTotals(updated.items, Number(updated.discount), Number(updated.freight), Number(updated.tax_percent));
      return { ...updated, ...tots };
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === Number(customerId));
    setOrder(prev => ({
      ...prev,
      customer_id: customer ? customer.id : null,
      contact_person: customer?.contact_person || prev.contact_person,
      delivery_address: customer?.address || prev.delivery_address,
    }));
  };

  // Items
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ ...emptyItem, _key: String(Math.random()) });
    setShowItemModal(true);
  };

  const openEditItem = (item: SalesOrderItem) => {
    setEditingItem(item);
    setItemForm({ ...item });
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    const computed = calcItem(itemForm);
    let newItems: SalesOrderItem[];
    if (editingItem) {
      newItems = order.items.map(i => i._key === editingItem._key ? computed : i);
    } else {
      newItems = [...order.items, computed];
    }
    const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
    setOrder(prev => ({ ...prev, items: newItems, ...tots }));
    setShowItemModal(false);
  };

  const handleDeleteItem = (key: string) => {
    const newItems = order.items.filter(i => i._key !== key);
    const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
    setOrder(prev => ({ ...prev, items: newItems, ...tots }));
  };

  const handleSave = async () => {
    if (!order.customer_id) { toast.error('Customer is required'); return; }
    if (!order.order_date) { toast.error('Order date is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...order,
        items: order.items.map(({ _key, ...rest }) => rest),
      };
      if (isNew) {
        const res = await api('/sales-orders', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Sales order created!');
        navigate(`/sales-orders/${res.data.id}`);
      } else {
        const res = await api(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Sales order updated!');
        fetchOrder();
      }
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally { setSaving(false); }
  };

  const handleCopyOrder = async () => {
    const newOrder = {
      ...order,
      id: undefined,
      order_no: undefined,
      status: 'Draft',
      customer_po_no: '',
      items: order.items.map(({ _key, ...rest }) => rest),
    };
    try {
      const res = await api('/sales-orders', { method: 'POST', body: JSON.stringify(newOrder) });
      toast.success('Order copied!');
      navigate(`/sales-orders/${res.data.id}`);
    } catch (err) { toast.error('Failed to copy: ' + (err as Error).message); }
  };

  // Delivery
  const handleSaveDelivery = async () => {
    if (isNew) { toast.info('Save the order first'); return; }
    try {
      const items: DeliveryItem[] = order.items.map(i => ({
        item_code: i.item_code, item_description: i.item_description, uom: i.uom,
        ordered_qty: i.quantity, shipped_qty: i.quantity, pending_qty: 0,
      }));
      await api(`/sales-orders/${id}/delivery`, { method: 'POST', body: JSON.stringify({ ...deliveryForm, delivery_to: order.delivery_address, items }) });
      toast.success('Delivery note created!');
      setShowDeliveryModal(false);
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

  // Attachments
  const handleFileUpload = async (file: File) => {
    if (isNew) { toast.info('Save the order first'); return; }
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('tannery_token');
      const res = await fetch(`/api/sales-orders/${id}/attachments`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      toast.success('File uploaded!');
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

  const customerOptions = [
    { value: '', label: 'Select customer *' },
    ...customers.map(c => ({ value: String(c.id), label: `${c.name}` })),
  ];

  const totalReceived = order.receipts.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalInvoiced = order.invoices.reduce((s, i) => s + Number(i.invoice_amount || 0), 0);
  const balance = order.grand_total - totalReceived;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;

  const tabs = [
    { id: 'items' as const, label: 'Items' },
    { id: 'delivery' as const, label: 'Delivery & Shipping' },
    { id: 'payment' as const, label: 'Payment Details' },
    { id: 'attachments' as const, label: 'Attachments' },
    { id: 'remarks' as const, label: 'Remarks' },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Sales Order</h1>
            {order.order_no && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-semibold text-gray-700">{order.order_no}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
              </>
            )}
          </div>
          <nav className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600">Home</button>
            <span>›</span>
            <button onClick={() => navigate('/sales-orders')} className="hover:text-gray-600">Sales Orders</button>
            {order.order_no && <><span>›</span><span className="text-gray-600">{order.order_no}</span></>}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                <Printer size={13} /> Print
              </button>
              <button onClick={handleCopyOrder} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                <Copy size={13} /> Copy
              </button>
            </>
          )}
          <button onClick={() => navigate('/sales-orders/new')} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
            <Plus size={13} /> New Sales Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select label="Customer" required options={customerOptions} value={String(order.customer_id || '')} onChange={(e) => handleCustomerChange(e.target.value)} />
            <Input label="Order Date" required type="date" value={order.order_date} onChange={(e) => updateField('order_date', e.target.value)} />
            <Input label="Customer PO No." value={order.customer_po_no} placeholder="PO number" onChange={(e) => updateField('customer_po_no', e.target.value)} />
            <Select label="Order Type" options={ORDER_TYPE_OPTS.map(o => ({ value: o, label: o }))} value={order.order_type} onChange={(e) => updateField('order_type', e.target.value)} />
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Contact Person" value={order.contact_person} placeholder="Contact name" onChange={(e) => updateField('contact_person', e.target.value)} />
            <Input label="Delivery Date" type="date" value={order.delivery_date} onChange={(e) => updateField('delivery_date', e.target.value)} />
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-900 mb-1">Delivery Address</label>
              <textarea rows={3} value={order.delivery_address} onChange={(e) => updateField('delivery_address', e.target.value)} placeholder="Delivery address" className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white" />
            </div>
            <Select label="Price List" options={[{ value: '', label: 'Select price list' }, { value: 'Standard Export Price List', label: 'Standard Export Price List' }, { value: 'Standard Domestic Price List', label: 'Standard Domestic Price List' }]} value={order.price_list} onChange={(e) => updateField('price_list', e.target.value)} />
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select label="Payment Terms" options={[{ value: '', label: 'Select terms' }, ...PAYMENT_TERMS_OPTS.map(o => ({ value: o, label: o }))]} value={order.payment_terms} onChange={(e) => updateField('payment_terms', e.target.value)} />
            <Select label="Currency" options={CURRENCY_OPTS.map(o => ({ value: o.split(' - ')[0], label: o }))} value={order.currency} onChange={(e) => updateField('currency', e.target.value)} />
            <Input label="Sales Person" value={order.sales_person} placeholder="Sales person name" onChange={(e) => updateField('sales_person', e.target.value)} />
            <Select label="Status" options={['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => ({ value: s, label: s }))} value={order.status} onChange={(e) => updateField('status', e.target.value)} />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200 border-b-transparent' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'items' && (
              <button onClick={openAddItem} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={12} /> Add Item
              </button>
            )}
            {activeTab === 'attachments' && (
              <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                <Upload size={12} /> Upload File
              </button>
            )}
          </div>

          <div className="p-5">
            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['#', 'Item Code', 'Item Description', 'Leather Type', 'Finish / Color', 'Thickness (mm)', 'UOM', 'Quantity', 'Unit Price (₹)', 'Discount (%)', 'Amount (₹)', 'Action'].map(h => (
                          <th key={h} className="text-left py-2.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.length === 0 ? (
                        <tr><td colSpan={12} className="py-8 text-center text-gray-400">No items added yet. Click "Add Item" to start.</td></tr>
                      ) : order.items.map((item, i) => (
                        <tr key={item._key || i} className="hover:bg-blue-50/30">
                          <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{item.item_code || '—'}</td>
                          <td className="py-2.5 px-3 text-gray-900 font-medium">{item.item_description || '—'}</td>
                          <td className="py-2.5 px-3 text-gray-600">{item.leather_type || '—'}</td>
                          <td className="py-2.5 px-3 text-gray-600">{item.finish_color || '—'}</td>
                          <td className="py-2.5 px-3 text-gray-600">{item.thickness || '—'}</td>
                          <td className="py-2.5 px-3 text-gray-600">{item.uom}</td>
                          <td className="py-2.5 px-3 text-gray-900">{item.quantity.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-gray-900">{item.unit_price.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={item.discount_percent}
                              onChange={(e) => {
                                const updated = calcItem({ ...item, discount_percent: Number(e.target.value) });
                                const newItems = order.items.map(i2 => i2._key === item._key ? updated : i2);
                                const tots = calcTotals(newItems, Number(order.discount), Number(order.freight), Number(order.tax_percent));
                                setOrder(prev => ({ ...prev, items: newItems, ...tots }));
                              }}
                              min={0} max={100} step={0.01}
                              className="w-16 px-1.5 py-1 border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditItem(item)} className="p-1 text-blue-400 hover:text-blue-600"><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteItem(item._key!)} className="p-1 text-rose-400 hover:text-rose-600"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Terms */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-900 mb-2">Terms & Conditions</label>
                    <textarea
                      rows={4}
                      value={order.terms_conditions}
                      onChange={(e) => updateField('terms_conditions', e.target.value)}
                      placeholder="Enter terms and conditions..."
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white"
                    />
                  </div>

                  {/* Totals */}
                  <div className="w-full lg:w-72 space-y-2">
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600">Sub Total</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(order.sub_total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600">Discount</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={order.discount} onChange={(e) => updateField('discount', Number(e.target.value))} min={0} className="w-20 px-2 py-1 text-xs border border-gray-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <span className="text-gray-500 text-xs">{formatCurrency(order.discount)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600">Freight</span>
                      <input type="number" value={order.freight} onChange={(e) => updateField('freight', Number(e.target.value))} min={0} className="w-28 px-2 py-1 text-xs border border-gray-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600">Tax (GST {order.tax_percent}%)</span>
                      <span className="text-gray-900">{formatCurrency(order.tax_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold py-2 border-t border-gray-300">
                      <span className="text-gray-900">Grand Total</span>
                      <span className="text-blue-700">{formatCurrency(order.grand_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery & Shipping Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Delivery Notes ({order.deliveries.length})</h3>
                  <button onClick={() => setShowDeliveryModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                    <Plus size={12} /> Create Delivery Note
                  </button>
                </div>

                {order.deliveries.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg text-sm">No delivery notes created yet</div>
                ) : order.deliveries.map((dn: any) => (
                  <div key={dn.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-medium text-gray-700">{dn.delivery_no}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${dn.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{dn.status}</span>
                      </div>
                      <span className="text-xs text-gray-500">{dn.delivery_date ? new Date(dn.delivery_date).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3 text-xs">
                      <div><span className="text-gray-500">Transporter:</span> <span className="font-medium text-gray-800 ml-1">{dn.transporter || '—'}</span></div>
                      <div><span className="text-gray-500">Vehicle No.:</span> <span className="font-medium text-gray-800 ml-1">{dn.vehicle_no || '—'}</span></div>
                      <div><span className="text-gray-500">LR / AWB No.:</span> <span className="font-medium text-gray-800 ml-1">{dn.lr_no || '—'}</span></div>
                      <div><span className="text-gray-500">Packages:</span> <span className="font-medium text-gray-800 ml-1">{dn.no_of_packages || '—'}</span></div>
                    </div>
                    {dn.delivery_instructions && (
                      <div className="px-4 pb-3 text-xs text-gray-600"><span className="font-medium">Instructions:</span> {dn.delivery_instructions}</div>
                    )}
                  </div>
                ))}

                {/* Item Summary */}
                {order.items.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Item Summary</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {['#', 'Item Code', 'Item Description', 'UOM', 'Order Qty', 'Shipped Qty', 'Pending Qty'].map(h => (
                              <th key={h} className="text-left py-2.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {order.items.map((item, i) => (
                            <tr key={item._key || i} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3">{i + 1}</td>
                              <td className="py-2.5 px-3 font-mono">{item.item_code || '—'}</td>
                              <td className="py-2.5 px-3">{item.item_description}</td>
                              <td className="py-2.5 px-3">{item.uom}</td>
                              <td className="py-2.5 px-3">{item.quantity.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-green-700 font-medium">{item.quantity.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-blue-600">0</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-semibold border-t border-gray-200">
                            <td colSpan={4} className="py-2.5 px-3">Total</td>
                            <td className="py-2.5 px-3">{order.items.reduce((s, i) => s + i.quantity, 0).toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-3">{order.items.reduce((s, i) => s + i.quantity, 0).toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-3">0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-5">
                {/* Order Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Sales Order No.', value: order.order_no || '—' },
                    { label: 'Customer', value: order.customer_name || customers.find(c => c.id === order.customer_id)?.name || '—' },
                    { label: 'Order Date', value: order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '—' },
                    { label: 'Order Amount (₹)', value: formatCurrency(order.grand_total) },
                    { label: 'Payment Terms', value: order.payment_terms || '—' },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Amount Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Amount Summary</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Order Amount (₹)', value: formatCurrency(order.grand_total) },
                        { label: 'Advance Received (₹)', value: formatCurrency(totalReceived) },
                        { label: 'Total Invoiced (₹)', value: formatCurrency(totalInvoiced) },
                        { label: 'Balance Amount (₹)', value: formatCurrency(balance), highlight: true },
                      ].map(row => (
                        <div key={row.label} className={`flex items-center justify-between py-2 px-3 rounded-lg ${row.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'}`}>
                          <span className={`text-xs font-medium ${row.highlight ? 'text-blue-700' : 'text-gray-600'}`}>{row.label}</span>
                          <span className={`text-sm font-bold ${row.highlight ? 'text-blue-700' : 'text-gray-900'}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Terms</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Payment Terms</label>
                        <p className="text-sm font-medium text-gray-800">{order.payment_terms || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                        <p className="text-sm font-medium text-gray-800">
                          {order.delivery_date ? new Date(new Date(order.delivery_date).getTime() + (order.payment_terms === '30 Days' ? 30 : order.payment_terms === '45 Days' ? 45 : 60) * 86400000).toLocaleDateString('en-IN') : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button onClick={() => setShowReceiptModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                        <Plus size={12} /> Add Payment Receipt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {order.receipts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {['#', 'Receipt No.', 'Receipt Date', 'Payment Mode', 'Amount (₹)', 'Remarks', 'Action'].map(h => (
                              <th key={h} className="text-left py-2.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {order.receipts.map((r: any, i) => (
                            <tr key={r.id || i} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3">{i + 1}</td>
                              <td className="py-2.5 px-3 font-mono text-blue-600">{r.receipt_no}</td>
                              <td className="py-2.5 px-3">{r.receipt_date ? new Date(r.receipt_date).toLocaleDateString('en-IN') : '—'}</td>
                              <td className="py-2.5 px-3">{r.payment_mode}</td>
                              <td className="py-2.5 px-3 font-semibold">{formatCurrency(r.amount)}</td>
                              <td className="py-2.5 px-3 text-gray-600">{r.remarks || '—'}</td>
                              <td className="py-2.5 px-3">
                                <button onClick={() => r.id && handleDeleteReceipt(r.id)} className="p-1 text-rose-400 hover:text-rose-600"><Trash2 size={12} /></button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                            <td colSpan={4} className="py-2.5 px-3">Total Received (₹)</td>
                            <td className="py-2.5 px-3">{formatCurrency(totalReceived)}</td>
                            <td colSpan={2} />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Invoice Details */}
                {order.invoices.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Details</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {['Invoice No.', 'Invoice Date', 'Invoice Amount (₹)', 'Paid Amount (₹)', 'Balance (₹)', 'Status'].map(h => (
                              <th key={h} className="text-left py-2.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {order.invoices.map((inv: any, i) => (
                            <tr key={inv.id || i} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-mono text-blue-600">{inv.invoice_no}</td>
                              <td className="py-2.5 px-3">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN') : '—'}</td>
                              <td className="py-2.5 px-3 font-semibold">{formatCurrency(inv.invoice_amount)}</td>
                              <td className="py-2.5 px-3">{formatCurrency(inv.paid_amount)}</td>
                              <td className="py-2.5 px-3 font-semibold text-blue-700">{formatCurrency(inv.balance)}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />

                {order.attachments.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={24} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600">Click to upload or drag files here</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, PNG, JPG</p>
                    {uploadingFile && <p className="text-xs text-blue-600 mt-2 animate-pulse">Uploading...</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['#', 'File Name', 'Category', 'File Type', 'Uploaded By', 'Uploaded On', 'Remarks', 'Action'].map(h => (
                            <th key={h} className="text-left py-2.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.attachments.map((att: any, i) => (
                          <tr key={att.id || i} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                            <td className="py-2.5 px-3"><a href={att.file_path} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline flex items-center gap-1"><Paperclip size={11} /> {att.file_name}</a></td>
                            <td className="py-2.5 px-3 text-gray-600">{att.category}</td>
                            <td className="py-2.5 px-3 text-gray-600">{att.file_type || '—'}</td>
                            <td className="py-2.5 px-3 text-gray-600">Admin User</td>
                            <td className="py-2.5 px-3 text-gray-600">{att.uploaded_at ? new Date(att.uploaded_at).toLocaleString('en-IN') : '—'}</td>
                            <td className="py-2.5 px-3 text-gray-600">{att.remarks || '—'}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1">
                                <a href={att.file_path} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-blue-600"><Eye size={13} /></a>
                                <a href={att.file_path} download className="p-1 text-gray-400 hover:text-green-600"><Download size={13} /></a>
                                <button onClick={() => att.id && handleDeleteAttachment(att.id)} className="p-1 text-gray-400 hover:text-rose-600"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-4 py-2.5 text-xs text-gray-500 border-t border-gray-100">Total {order.attachments.length} Files</div>
                  </div>
                )}
              </div>
            )}

            {/* Remarks Tab */}
            {activeTab === 'remarks' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-900">Remarks / Notes</label>
                <textarea
                  rows={6}
                  value={order.remarks}
                  onChange={(e) => updateField('remarks', e.target.value)}
                  placeholder="Enter any remarks or notes..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50/50">
          {!isNew && order.order_no && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700">Created By</span><p className="mt-0.5">Admin User</p></div>
              <div><span className="font-medium text-gray-700">Created On</span><p className="mt-0.5">{order.order_date}</p></div>
            </div>
          )}
          {isNew && <div />}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/sales-orders')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50">
              <Save size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
              <button onClick={() => setShowItemModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Item Code" value={itemForm.item_code} placeholder="e.g. ITM-00045" onChange={(e) => setItemForm(p => ({ ...p, item_code: e.target.value }))} />
              <Input label="Item Description" required value={itemForm.item_description} placeholder="e.g. Finished Leather" onChange={(e) => setItemForm(p => ({ ...p, item_description: e.target.value }))} />
              <Input label="Leather Type" value={itemForm.leather_type} placeholder="e.g. Cow, Buffalo" onChange={(e) => setItemForm(p => ({ ...p, leather_type: e.target.value }))} />
              <Input label="Finish / Color" value={itemForm.finish_color} placeholder="e.g. Black Finish" onChange={(e) => setItemForm(p => ({ ...p, finish_color: e.target.value }))} />
              <Input label="Thickness (mm)" value={itemForm.thickness} placeholder="e.g. 1.2 - 1.4" onChange={(e) => setItemForm(p => ({ ...p, thickness: e.target.value }))} />
              <Input label="UOM" value={itemForm.uom} placeholder="e.g. Sq.Ft." onChange={(e) => setItemForm(p => ({ ...p, uom: e.target.value }))} />
              <Input label="Quantity" required type="number" value={String(itemForm.quantity)} onChange={(e) => setItemForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
              <Input label="Unit Price (₹)" required type="number" value={String(itemForm.unit_price)} onChange={(e) => setItemForm(p => ({ ...p, unit_price: Number(e.target.value) }))} />
              <Input label="Discount (%)" type="number" value={String(itemForm.discount_percent)} min={0} max={100} onChange={(e) => setItemForm(p => ({ ...p, discount_percent: Number(e.target.value) }))} />
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-medium text-gray-900 mb-1">Amount (₹)</label>
                <div className="px-2.5 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg font-semibold">
                  {formatCurrency(calcItem(itemForm).amount)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{editingItem ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Create Delivery Note</h3>
              <button onClick={() => setShowDeliveryModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Delivery Note No." value={deliveryForm.delivery_no} placeholder="Auto-generated" onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_no: e.target.value }))} />
              <Input label="Delivery Date" type="date" value={deliveryForm.delivery_date} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_date: e.target.value }))} />
              <Input label="Delivery From" value={deliveryForm.delivery_from} placeholder="e.g. Main Warehouse" onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_from: e.target.value }))} />
              <Input label="Transporter" value={deliveryForm.transporter} placeholder="Transporter name" onChange={(e) => setDeliveryForm(p => ({ ...p, transporter: e.target.value }))} />
              <Input label="Vehicle No." value={deliveryForm.vehicle_no} placeholder="Vehicle number" onChange={(e) => setDeliveryForm(p => ({ ...p, vehicle_no: e.target.value }))} />
              <Input label="LR / AWB No." value={deliveryForm.lr_no} placeholder="LR or AWB number" onChange={(e) => setDeliveryForm(p => ({ ...p, lr_no: e.target.value }))} />
              <Input label="No. of Packages" type="number" value={deliveryForm.no_of_packages} onChange={(e) => setDeliveryForm(p => ({ ...p, no_of_packages: e.target.value }))} />
              <Select label="Status" options={[{ value: 'Draft', label: 'Draft' }, { value: 'Dispatched', label: 'Dispatched' }, { value: 'Delivered', label: 'Delivered' }]} value={deliveryForm.status} onChange={(e) => setDeliveryForm(p => ({ ...p, status: e.target.value }))} />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">Delivery Instructions</label>
                <textarea rows={2} value={deliveryForm.delivery_instructions} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_instructions: e.target.value }))} placeholder="Enter delivery instructions..." className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowDeliveryModal(false)} className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveDelivery} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add Payment Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <Input label="Receipt Date" required type="date" value={newReceipt.receipt_date} onChange={(e) => setNewReceipt(p => ({ ...p, receipt_date: e.target.value }))} />
              <Select label="Payment Mode" options={['Bank Transfer', 'Cheque', 'Cash', 'NEFT', 'RTGS', 'UPI'].map(m => ({ value: m, label: m }))} value={newReceipt.payment_mode} onChange={(e) => setNewReceipt(p => ({ ...p, payment_mode: e.target.value }))} />
              <Input label="Amount (₹)" required type="number" value={String(newReceipt.amount)} onChange={(e) => setNewReceipt(p => ({ ...p, amount: Number(e.target.value) }))} />
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
                <textarea rows={2} value={newReceipt.remarks} onChange={(e) => setNewReceipt(p => ({ ...p, remarks: e.target.value }))} placeholder="e.g. Advance Received" className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowReceiptModal(false)} className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveReceipt} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
