import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { ArrowRight, ArrowLeft, Printer, QrCode, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

type Step = 'qr' | 'grade' | 'putaway' | 'dispatch' | 'picking';

const STEPS: { key: Step; no: string; label: string; title: string; desc: string }[] = [
  { key: 'qr', no: '01', label: 'QR generation', title: 'Leather QR generation', desc: 'Select a receipt lot and generate a unique QR code for every leather piece received.' },
  { key: 'grade', no: '02', label: 'Inspection & grade', title: 'Inspection & grade mapping', desc: 'Select a grade and scan each leather QR code with its sq.ft.' },
  { key: 'putaway', no: '03', label: 'Put-away', title: 'Put-away process', desc: 'Scan each graded leather and assign a warehouse rack location.' },
  { key: 'dispatch', no: '04', label: 'Dispatch / pick list', title: 'Dispatch transaction & pick list', desc: 'Enter dispatch requirement and generate a pick list from available stock.' },
  { key: 'picking', no: '05', label: 'Picking & confirm', title: 'Picking & dispatch confirmation', desc: 'Scan picked leathers against the pick list and confirm dispatch.' },
];

const GRADES = [
  { v: 'A', l: 'A - First quality' },
  { v: 'B', l: 'B - Second quality' },
  { v: 'C', l: 'C - Third quality' },
  { v: 'D', l: 'D - Reject' },
];

interface Lot { id: number; lot_no: string; supplier_name: string; article: string; receipt_date: string; qty: number; qr_generated: number; piece_count: number }
interface Piece { id: number; piece_code: string; grade: string | null; sqft: number | null; rack_location: string | null; status: string; picked: number; lot_no: string; article: string }
interface PickListRow { id: number; pick_no: string; dispatch_ref: string; customer_name: string; qty: number; status: string; item_count: number; picked_count: number }
interface PickDetail extends PickListRow { items: { piece_code: string; grade: string; rack_location: string; picked: number; article: string }[] }
interface Stats { lots_pending: number; qr_count: number; awaiting_putaway: number; open_picks: number; in_stock: number }

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';
const labelCls = 'block text-xs font-medium text-slate-500 mb-1';
const primaryBtn = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
const ghostBtn = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg disabled:opacity-50';
const th = 'text-left px-3 py-2 text-[11px] uppercase tracking-wide text-slate-500 font-semibold bg-slate-50';
const td = 'px-3 py-2 text-sm text-slate-700 border-t border-slate-100';

const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

function QrImg({ value, size = 72 }: { value: string; size?: number }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { margin: 1, width: size * 3 }).then((u) => alive && setSrc(u)).catch(() => {});
    return () => { alive = false; };
  }, [value, size]);
  return src ? <img src={src} alt={value} style={{ width: size, height: size }} className="mx-auto" /> : <div style={{ width: size, height: size }} className="mx-auto bg-slate-100" />;
}

function ScanInput({ value, onChange, placeholder, onEnter, autoFocus, inputRef }: { value: string; onChange: (v: string) => void; placeholder: string; onEnter?: () => void; autoFocus?: boolean; inputRef?: React.RefObject<HTMLInputElement> }) {
  return (
    <>
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
          autoComplete="off"
          autoFocus={autoFocus}
          ref={inputRef}
        />
      </div>
    </>
  );
}

// Searchable dropdown that also accepts free text (value is whatever is typed or picked)
function ComboInput({ value, onChange, options, placeholder, onPick }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; hint?: string; label?: string }[];
  placeholder?: string;
  onPick?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const q = value.trim().toLowerCase();
  const filtered = options.filter((o) => !q || o.value.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q)).slice(0, 50);
  return (
    <div className="relative">
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {filtered.map((o) => (
            <li key={o.value}>
              <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                onMouseDown={(e) => { e.preventDefault(); onChange(o.value); onPick?.(o.value); setOpen(false); }}>
                <span className="text-slate-800">{o.label || o.value}</span>
                {o.hint && <span className="block text-xs text-slate-500">{o.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextBar({ step, canNext, nextHint, onNext }: { step: Step; canNext: boolean; nextHint: string; onNext: () => void }) {
  const navigate = useNavigate();
  const idx = STEPS.findIndex((s) => s.key === step);
  const prev = STEPS[idx - 1];
  const next = STEPS[idx + 1];
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
      {prev ? (
        <button className={ghostBtn} onClick={() => navigate(`/rm-warehouse/${prev.key}`)}><ArrowLeft size={16} /> Back</button>
      ) : <span />}
      <div className="flex items-center gap-3">
        {!canNext && <span className="text-xs text-slate-500">{nextHint}</span>}
        {next ? (
          <button className={primaryBtn} disabled={!canNext} onClick={onNext}>Next: {next.label} <ArrowRight size={16} /></button>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={16} /> Last step</span>
        )}
      </div>
    </div>
  );
}

// ---------------- Step 1 ----------------
function StepQr({ reload, stats }: { reload: () => void; stats: Stats | null }) {
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotId, setLotId] = useState<number | ''>('');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [maxQty, setMaxQty] = useState<number | null>(null);
  const [form, setForm] = useState({ lot_no: '', supplier_name: '', article: '', receipt_date: new Date().toISOString().slice(0, 10), qty: '' });

  const loadLots = useCallback(async (selectId?: number) => {
    const r = await api<{ data: Lot[] }>('/rm-warehouse/lots');
    setLots(r.data);
    setLotId((cur) => selectId ?? (cur || r.data[0]?.id || ''));
  }, []);
  useEffect(() => { loadLots().catch((e) => toast.error(errMsg(e))); }, [loadLots]);

  const [lookups, setLookups] = useState<{ grns: { lot_no: string; supplier_name: string; article: string; qty: number; receipt_date: string }[]; suppliers: string[]; articles: string[] }>({ grns: [], suppliers: [], articles: [] });
  const loadLookups = useCallback(() => {
    api<{ data: typeof lookups }>('/rm-warehouse/lot-lookups').then((r) => setLookups(r.data)).catch(() => {});
  }, []);
  useEffect(() => { loadLookups(); }, [loadLookups]);
  const pickGrn = (no: string) => {
    const g = lookups.grns.find((x) => x.lot_no === no);
    if (g) {
      setMaxQty(g.qty > 0 ? g.qty : null);
      setForm((f) => ({ ...f, lot_no: g.lot_no, supplier_name: g.supplier_name || f.supplier_name, article: g.article || f.article, qty: g.qty > 0 ? String(g.qty) : f.qty }));
    }
  };
  const onQtyChange = (v: string) => {
    if (maxQty != null && Number(v) > maxQty) { toast.warn(`Qty cannot exceed receipt qty (${maxQty})`); v = String(maxQty); }
    setForm((f) => ({ ...f, qty: v }));
  };

  const lot = lots.find((l) => l.id === lotId);
  const [lotText, setLotText] = useState('');
  useEffect(() => { setLotText(lot?.lot_no || ''); }, [lot?.id, lot?.lot_no]);
  useEffect(() => {
    if (!lot?.qr_generated) { setPieces([]); return; }
    api<{ data: Piece[] }>(`/rm-warehouse/pieces?lot_id=${lot.id}&limit=2000`).then((r) => setPieces(r.data)).catch(() => {});
  }, [lot?.id, lot?.qr_generated]);

  const createLot = async () => {
    try {
      setBusy(true);
      if (maxQty != null && Number(form.qty) > maxQty) { toast.error(`Qty cannot exceed receipt qty (${maxQty})`); return; }
      const r = await api<{ data: { id: number } }>('/rm-warehouse/lots', { method: 'POST', body: JSON.stringify({ ...form, qty: Number(form.qty) }) });
      toast.success('Receipt lot created');
      setShowNew(false);
      setForm({ ...form, lot_no: '', supplier_name: '', article: '', qty: '', receipt_date: new Date().toISOString().slice(0, 10) });
      setMaxQty(null);
      await loadLots(r.data.id);
      reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const generate = async () => {
    if (!lot) return;
    try {
      setBusy(true);
      const r = await api<{ message: string }>(`/rm-warehouse/lots/${lot.id}/generate-qr`, { method: 'POST' });
      toast.success(r.message);
      await loadLots(lot.id);
      reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const removeLot = async () => {
    if (!lot || !window.confirm(`Delete lot ${lot.lot_no}?`)) return;
    try {
      await api(`/rm-warehouse/lots/${lot.id}`, { method: 'DELETE' });
      toast.success('Lot deleted');
      setLotId('');
      await loadLots();
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const printLabels = async () => {
    if (!pieces.length) return toast.info('Generate QR codes first');
    const imgs = await Promise.all(pieces.map((p) => QRCode.toDataURL(p.piece_code, { margin: 1, width: 240 })));
    const w = window.open('', '_blank');
    if (!w) return toast.error('Allow pop-ups to print labels');
    w.document.write(`<html><head><title>QR labels ${lot?.lot_no}</title></head><body style="font-family:Arial"><h3>QR labels ${lot?.lot_no}</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${pieces.map((p, i) => `<div style="border:1px solid #aaa;padding:8px;text-align:center;page-break-inside:avoid"><img src="${imgs[i]}" width="110" height="110"/><div style="font:11px monospace">${p.piece_code}</div></div>`).join('')}</div><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  };

  const anyGenerated = lots.some((l) => l.qr_generated);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-800">1. Generate QR codes by receipt lot</h2>
        <button className={ghostBtn} onClick={() => setShowNew((s) => !s)}><Plus size={16} /> New receipt lot</button>
      </div>

      {showNew && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 mb-4 rounded-lg border border-blue-200 bg-blue-50/40">
          <div><label className={labelCls}>Lot / GRN no.</label>
            <ComboInput value={form.lot_no} onChange={(v) => { setForm({ ...form, lot_no: v }); setMaxQty(null); }} onPick={pickGrn} placeholder="Search GRN or type new"
              options={lookups.grns.map((g) => ({ value: g.lot_no, hint: g.supplier_name }))} /></div>
          <div><label className={labelCls}>Supplier</label>
            <ComboInput value={form.supplier_name} onChange={(v) => setForm({ ...form, supplier_name: v })} placeholder="Search or type supplier"
              options={lookups.suppliers.map((s) => ({ value: s }))} /></div>
          <div><label className={labelCls}>Article</label>
            <ComboInput value={form.article} onChange={(v) => setForm({ ...form, article: v })} placeholder="Search or type article"
              options={lookups.articles.map((a) => ({ value: a }))} /></div>
          <div><label className={labelCls}>Receipt date</label><input type="date" className={`${inputCls} bg-slate-100`} value={form.receipt_date} disabled readOnly /></div>
          <div><label className={labelCls}>Qty (pcs){maxQty != null ? ` · max ${maxQty}` : ''}</label><input type="number" min={1} max={maxQty ?? undefined} className={inputCls} value={form.qty} onChange={(e) => onQtyChange(e.target.value)} /></div>
          <div className="md:col-span-5"><button className={primaryBtn} disabled={busy} onClick={createLot}>Save lot</button></div>
        </div>
      )}

      {lots.length === 0 ? (
        <p className="text-sm text-slate-500 py-6">No receipt lots yet. Click “New receipt lot” to add one.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className={labelCls}>Receipt lot / GRN</label>
              <ComboInput value={lotText} placeholder="Search or type lot / GRN"
                onChange={(v) => {
                  setLotText(v);
                  const m = lots.find((l) => l.lot_no.toLowerCase() === v.trim().toLowerCase());
                  if (m) setLotId(m.id);
                }}
                onPick={(v) => { const m = lots.find((l) => l.lot_no === v); if (m) setLotId(m.id); }}
                options={lots.map((l) => ({ value: l.lot_no, hint: `${l.supplier_name} · ${l.qty} pcs${l.qr_generated ? ' ✓' : ''}` }))} />
            </div>
            <div><label className={labelCls}>Supplier</label><input className={inputCls} readOnly value={lot?.supplier_name || ''} /></div>
            <div><label className={labelCls}>Article</label><input className={inputCls} readOnly value={lot?.article || ''} /></div>
            <div><label className={labelCls}>Receipt date</label><input className={inputCls} readOnly value={lot ? fmtDate(lot.receipt_date) : ''} /></div>
            <div><label className={labelCls}>Qty (pcs)</label><input className={inputCls} readOnly value={lot ? lot.qty : ''} /></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className={primaryBtn} disabled={busy || !lot || !!lot.qr_generated} onClick={generate}><QrCode size={16} /> Generate QR codes for selected lot</button>
            <button className={ghostBtn} onClick={printLabels} disabled={!pieces.length}><Printer size={16} /> Print labels</button>
            {lot && !lot.qr_generated && <button className={ghostBtn} onClick={removeLot}><Trash2 size={16} /> Delete lot</button>}
          </div>
          <p className="text-xs text-slate-500 mt-3">Each leather receives a unique ID linked to its GRN.</p>
          {pieces.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(115px,1fr))] gap-3 mt-4">
              {pieces.slice(0, 40).map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-lg p-2 text-center">
                  <QrImg value={p.piece_code} />
                  <div className="font-mono text-[11px] mt-1">{p.piece_code}</div>
                </div>
              ))}
              {pieces.length > 40 && <div className="text-xs text-slate-500 self-center">+ {pieces.length - 40} more (use Print labels)</div>}
            </div>
          )}
        </>
      )}
      <NextBar step="qr" canNext={anyGenerated || (stats?.qr_count ?? 0) > 0} nextHint="Generate QR codes for a lot to continue" onNext={() => navigate('/rm-warehouse/grade')} />
    </>
  );
}

// ---------------- Step 2 ----------------
function StepGrade({ reload, onTotals }: { reload: () => void; onTotals: (t: { pieces: number; sqft: number }) => void }) {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [grade, setGrade] = useState('');
  const [code, setCode] = useState('');
  const [sqft, setSqft] = useState('');
  const [busy, setBusy] = useState(false);
  const sqftRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => api<{ data: Piece[] }>('/rm-warehouse/pieces?stage=grade').then((r) => setPieces(r.data)).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try {
      setBusy(true);
      await api('/rm-warehouse/pieces/grade', { method: 'POST', body: JSON.stringify({ piece_code: code, grade, sqft: Number(sqft) }) });
      toast.success('Grade and sq.ft saved');
      setCode(''); setSqft('');
      await load(); reload();
      codeRef.current?.focus();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const graded = pieces.filter((p) => p.grade).length;
  const totalSqft = pieces.reduce((s, p) => s + (p.grade ? Number(p.sqft) || 0 : 0), 0);
  useEffect(() => { onTotals({ pieces: graded, sqft: totalSqft }); }, [graded, totalSqft, onTotals]);
  return (
    <>
      <h2 className="text-base font-semibold text-slate-800 mb-3">2. Inspection & grade mapping</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className={labelCls}>Grade master</label>
          <select className={inputCls} value={grade} onChange={(e) => setGrade(e.target.value)}><option value="">None</option>{GRADES.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}</select></div>
        <div><label className={labelCls}>Scan / enter leather QR ID</label><ScanInput autoFocus inputRef={codeRef} value={code} onChange={(v) => setCode(v.toUpperCase())} onEnter={() => sqftRef.current?.focus()} placeholder="Click here, then scan with USB scanner" /></div>
        <div><label className={labelCls}>Sq.ft per piece</label><input ref={sqftRef} type="number" min="0.01" step="0.01" className={inputCls} value={sqft} onChange={(e) => setSqft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !busy && grade && code && sqft) save(); }} placeholder="e.g. 5.25" /></div>
      </div>
      <button className={`${primaryBtn} mt-4`} disabled={busy || !grade || !code || !sqft} onClick={save}>Save grade & sq.ft for scanned leather</button>

      <div className="overflow-auto mt-4 max-h-96 border border-slate-200 rounded-lg">
        <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Leather ID</th><th className={th}>GRN</th><th className={th}>Article</th><th className={th}>Grade</th><th className={th}>Sq.ft / piece</th></tr></thead>
          <tbody>{pieces.map((p) => (
            <tr key={p.id}><td className={`${td} font-mono`}>{p.piece_code}</td><td className={td}>{p.lot_no}</td><td className={td}>{p.article}</td><td className={td}>{p.grade || 'Pending'}</td><td className={td}>{p.sqft == null ? '—' : Number(p.sqft).toFixed(2)}</td></tr>
          ))}{pieces.length === 0 && <tr><td className={td} colSpan={5}>No leather yet. Generate QR codes in step 1.</td></tr>}</tbody></table>
      </div>
      <NextBar step="grade" canNext={graded > 0} nextHint="Grade at least one leather to continue" onNext={() => navigate('/rm-warehouse/putaway')} />
    </>
  );
}

// ---------------- Step 3 ----------------
function StepPutaway({ reload, stats }: { reload: () => void; stats: Stats | null }) {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [racks, setRacks] = useState<{ code: string; name: string }[]>([]);
  const [code, setCode] = useState('');
  const [rack, setRack] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<{ data: Piece[] }>('/rm-warehouse/pieces?stage=putaway').then((r) => setPieces(r.data)).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => {
    load();
    api<{ data: { code: string; name: string }[] }>('/rm-warehouse/racks').then((r) => { setRacks(r.data); if (r.data[0]) setRack(r.data[0].code); }).catch(() => {});
  }, [load]);

  const save = async () => {
    try {
      setBusy(true);
      await api('/rm-warehouse/pieces/putaway', { method: 'POST', body: JSON.stringify({ piece_code: code, rack_location: rack }) });
      toast.success('Put-away confirmed');
      setCode('');
      await load(); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const stored = pieces.filter((p) => p.rack_location).length;
  return (
    <>
      <h2 className="text-base font-semibold text-slate-800 mb-3">3. Put-away scanned leathers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className={labelCls}>Scan leather QR ID</label><ScanInput value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder="LEA-26041-001" /></div>
        <div><label className={labelCls}>Rack location</label>
          {racks.length > 0 ? (
            <select className={inputCls} value={rack} onChange={(e) => setRack(e.target.value)}>{racks.map((r) => <option key={r.code} value={r.code}>{r.code}{r.name ? ` · ${r.name}` : ''}</option>)}</select>
          ) : (
            <input className={inputCls} value={rack} onChange={(e) => setRack(e.target.value)} placeholder="RACK-A-01-02" />
          )}</div>
      </div>
      <button className={`${primaryBtn} mt-4`} disabled={busy || !code || !rack} onClick={save}>Confirm put-away</button>
      <div className="overflow-auto mt-4 max-h-96 border border-slate-200 rounded-lg">
        <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Leather ID</th><th className={th}>Grade</th><th className={th}>Location</th><th className={th}>Status</th></tr></thead>
          <tbody>{pieces.map((p) => (
            <tr key={p.id}><td className={`${td} font-mono`}>{p.piece_code}</td><td className={td}>{p.grade || '—'}</td><td className={td}>{p.rack_location || '—'}</td><td className={td}>{p.rack_location ? 'Stored' : 'Awaiting'}</td></tr>
          ))}{pieces.length === 0 && <tr><td className={td} colSpan={4}>No graded leather yet.</td></tr>}</tbody></table>
      </div>
      <NextBar step="putaway" canNext={stored > 0 || (stats?.in_stock ?? 0) > 0} nextHint="Put away at least one leather to continue" onNext={() => navigate('/rm-warehouse/dispatch')} />
    </>
  );
}

// ---------------- Step 4 ----------------
function StepDispatch({ reload }: { reload: () => void }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<{ name: string; secondary_uom: string; secondary_qty: number | null }[]>([]);
  const [parties, setParties] = useState<{ type: string; name: string; address: string }[]>([]);
  const [partyKey, setPartyKey] = useState('');
  const [address, setAddress] = useState('');
  const [lists, setLists] = useState<PickListRow[]>([]);
  const [f, setF] = useState({ dispatch_ref: '', customer_name: '', article: '', grade: '', qty: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<{ data: PickListRow[] }>('/rm-warehouse/pick-lists').then((r) => setLists(r.data)).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => {
    load();
    api<{ data: typeof articles }>('/rm-warehouse/articles').then((r) => setArticles(r.data)).catch(() => {});
    api<{ data: typeof parties }>('/rm-warehouse/parties').then((r) => setParties(r.data || [])).catch(() => {});
  }, [load]);

  const PRODUCTION = 'Production|Production';
  const [partyText, setPartyText] = useState('');
  const [articleText, setArticleText] = useState('');
  const articleInvalid = articleText.trim() !== '' && !f.article;
  const partyOptions = useMemo(() => [
    { key: PRODUCTION, value: 'Production', hint: 'Internal' },
    ...parties.map((p) => ({ key: `${p.type}|${p.name}`, value: `${p.name} (${p.type})`, hint: p.address || p.type })),
  ], [parties]);
  const pickParty = (key: string) => {
    setPartyKey(key);
    if (key === PRODUCTION) { setF((s) => ({ ...s, customer_name: 'Production' })); setAddress(''); return; }
    const p = parties.find((x) => `${x.type}|${x.name}` === key);
    setF((s) => ({ ...s, customer_name: p?.name || '' }));
    setAddress(p?.address || '');
  };

  const make = async () => {
    try {
      setBusy(true);
      const r = await api<{ data: { id: number } }>('/rm-warehouse/pick-lists', { method: 'POST', body: JSON.stringify({ ...f, qty: Number(f.qty), party_type: partyKey.split('|')[0], address }) });
      toast.success('Pick list generated');
      reload();
      navigate(`/rm-warehouse/picking?pick=${r.data.id}`);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const open = lists.filter((l) => l.status === 'Open');
  return (
    <>
      <h2 className="text-base font-semibold text-slate-800 mb-3">4. Dispatch transaction & pick list</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className={labelCls}>Dispatch reference</label><input className={inputCls} value={f.dispatch_ref} onChange={(e) => setF({ ...f, dispatch_ref: e.target.value })} placeholder="DSP-26091" /></div>
        <div><label className={labelCls}>Customer / Supplier / Production</label>
          <ComboInput value={partyText} placeholder="Search customer, supplier or production"
            onChange={(v) => {
              setPartyText(v);
              const k = partyOptions.find((o) => o.value.toLowerCase() === v.trim().toLowerCase())?.key;
              pickParty(k || '');
            }}
            onPick={(v) => { const k = partyOptions.find((o) => o.value === v)?.key; if (k) pickParty(k); }}
            options={partyOptions.map((o) => ({ value: o.value, hint: o.hint }))} /></div>
        <div className="md:col-span-3"><label className={labelCls}>Address</label>
          <textarea className={inputCls} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Auto-filled from master data" /></div>
        <div><label className={labelCls}>Article</label>
          <ComboInput value={articleText} placeholder="All articles (search to filter)"
            onChange={(v) => {
              setArticleText(v);
              const m = articles.find((a) => a.name.toLowerCase() === v.trim().toLowerCase());
              setF((s) => ({ ...s, article: m ? m.name : '' }));
            }}
            options={articles.map((a) => ({ value: a.name, label: a.secondary_qty != null ? `${a.name} - ${a.secondary_qty} ${a.secondary_uom}` : a.name }))} /></div>
        <div><label className={labelCls}>Grade</label>
          <select className={inputCls} value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })}><option value="">Any grade</option>{GRADES.slice(0, 3).map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}</select></div>
        <div><label className={labelCls}>Required quantity</label><input type="number" min={1} className={inputCls} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></div>
      </div>
      <button className={`${primaryBtn} mt-4`} disabled={busy || articleInvalid || !f.dispatch_ref || !f.customer_name || !f.qty} onClick={make}>Generate pick list</button>
      <div className="overflow-auto mt-4 border border-slate-200 rounded-lg">
        <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Pick list</th><th className={th}>Dispatch ref</th><th className={th}>Customer</th><th className={th}>Qty</th><th className={th}>Status</th><th className={th}></th></tr></thead>
          <tbody>{lists.map((l) => (
            <tr key={l.id}><td className={td}>{l.pick_no}</td><td className={td}>{l.dispatch_ref}</td><td className={td}>{l.customer_name}</td><td className={td}>{l.qty}</td><td className={td}>{l.status === 'Open' ? 'Open' : 'Dispatched'}</td>
              <td className={td}>{l.status === 'Open' && <button className="text-blue-600 text-sm hover:underline" onClick={() => navigate(`/rm-warehouse/picking?pick=${l.id}`)}>Pick</button>}</td></tr>
          ))}{lists.length === 0 && <tr><td className={td} colSpan={6}>No pick lists yet.</td></tr>}</tbody></table>
      </div>
      <NextBar step="dispatch" canNext={open.length > 0} nextHint="Generate a pick list to continue" onNext={() => navigate(`/rm-warehouse/picking?pick=${open[0].id}`)} />
    </>
  );
}

// ---------------- Step 5 ----------------
function StepPicking({ reload }: { reload: () => void }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const pickId = params.get('pick') || '';
  const [open, setOpen] = useState<PickListRow[]>([]);
  const [detail, setDetail] = useState<PickDetail | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const loadOpen = useCallback(() => api<{ data: PickListRow[] }>('/rm-warehouse/pick-lists?status=Open').then((r) => setOpen(r.data)).catch((e) => toast.error(errMsg(e))), []);
  const loadDetail = useCallback(async () => {
    if (!pickId) { setDetail(null); return; }
    try { setDetail((await api<{ data: PickDetail }>(`/rm-warehouse/pick-lists/${pickId}`)).data); } catch (e) { toast.error(errMsg(e)); }
  }, [pickId]);
  useEffect(() => { loadOpen(); }, [loadOpen]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  const pick = async () => {
    if (!detail || !code) return;
    try {
      setBusy(true);
      await api(`/rm-warehouse/pick-lists/${detail.id}/pick`, { method: 'POST', body: JSON.stringify({ piece_code: code }) });
      setCode('');
      await loadDetail();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const dispatch = async () => {
    if (!detail) return;
    try {
      setBusy(true);
      await api(`/rm-warehouse/pick-lists/${detail.id}/dispatch`, { method: 'POST' });
      toast.success('Dispatch confirmed');
      setParams({});
      await loadOpen(); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const pickedCount = detail?.items.filter((i) => i.picked).length ?? 0;
  const allPicked = !!detail && detail.items.length > 0 && pickedCount === detail.items.length;
  return (
    <>
      <h2 className="text-base font-semibold text-slate-800 mb-3">5. Picking & dispatch confirmation</h2>
      <div className="max-w-md">
        <label className={labelCls}>Pick list</label>
        <select className={inputCls} value={pickId} onChange={(e) => setParams(e.target.value ? { pick: e.target.value } : {})}>
          <option value="">Select pick list</option>
          {open.map((l) => <option key={l.id} value={l.id}>{l.pick_no} · {l.dispatch_ref} · {l.qty} pcs</option>)}
        </select>
      </div>
      {detail ? (
        <>
          <p className="text-sm text-slate-500 mt-3">{detail.customer_name} · {pickedCount} of {detail.items.length} picked</p>
          <div className="max-w-md mt-2"><label className={labelCls}>Scan leather QR ID</label>
            <ScanInput value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder="Scan allocated leather ID" onEnter={pick} /></div>
          <button className={`${primaryBtn} mt-3`} disabled={busy || !code} onClick={pick}>Verify & pick</button>
          <div className="overflow-auto mt-4 border border-slate-200 rounded-lg">
            <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Leather ID</th><th className={th}>Rack location</th><th className={th}>Grade</th><th className={th}>Pick status</th></tr></thead>
              <tbody>{detail.items.map((i) => (
                <tr key={i.piece_code}><td className={`${td} font-mono`}>{i.piece_code}</td><td className={td}>{i.rack_location}</td><td className={td}>{i.grade}</td><td className={td}>{i.picked ? 'Picked' : 'Pending'}</td></tr>
              ))}</tbody></table>
          </div>
          <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy || !allPicked} onClick={dispatch}>
            <CheckCircle2 size={16} /> Confirm dispatch
          </button>
        </>
      ) : (
        <div className="mt-3 text-sm text-slate-500">
          {open.length === 0 ? (
            <>
              <p>No open pick lists. Earlier pick lists are already dispatched. Create a new one in step 4 (needs graded and put-away stock).</p>
              <button className={`${ghostBtn} mt-3`} onClick={() => navigate('/rm-warehouse/dispatch')}>Go to Dispatch / pick list</button>
            </>
          ) : (
            <p>Choose an open pick list from the dropdown above.</p>
          )}
        </div>
      )}
      <NextBar step="picking" canNext={false} nextHint="" onNext={() => {}} />
    </>
  );
}

// ---------------- Page ----------------
export default function RMWarehouse() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const step: Step = (STEPS.find((s) => s.key === stepParam)?.key) ?? 'qr';
  const meta = STEPS.find((s) => s.key === step)!;
  const [stats, setStats] = useState<Stats | null>(null);

  const reload = useCallback(() => {
    api<{ data: Stats }>('/rm-warehouse/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload, step]);

  const [gradeTotals, setGradeTotals] = useState({ pieces: 0, sqft: 0 });
  const onGradeTotals = useCallback((t: { pieces: number; sqft: number }) => setGradeTotals(t), []);

  const allKpis = useMemo(() => [
    { l: 'Receipt lots pending QR', v: stats?.lots_pending ?? 0 },
    { l: 'QR-tagged leathers', v: stats?.qr_count ?? 0 },
    { l: 'Awaiting put-away', v: stats?.awaiting_putaway ?? 0 },
    { l: 'Open pick lists', v: stats?.open_picks ?? 0 },
  ], [stats]);
  const kpis = step === 'grade'
    ? [...allKpis, { l: 'Total scanned pieces', v: gradeTotals.pieces }, { l: 'Total sq.ft', v: gradeTotals.sqft.toFixed(2) }]
    : allKpis;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{meta.title}</h1>
        <p className="text-sm text-slate-500">{meta.desc}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((s) => (
          <button key={s.key} onClick={() => navigate(`/rm-warehouse/${s.key}`)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap border ${s.key === step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
            {s.no} · {s.label}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-2 gap-3 ${step === 'grade' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'}`}>
        {kpis.map((k) => (
          <div key={k.l} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">{k.l}</div>
            <div className="text-2xl font-semibold text-slate-800 mt-1">{k.v}</div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        {step === 'qr' && <StepQr reload={reload} stats={stats} />}
        {step === 'grade' && <StepGrade reload={reload} onTotals={onGradeTotals} />}
        {step === 'putaway' && <StepPutaway reload={reload} stats={stats} />}
        {step === 'dispatch' && <StepDispatch reload={reload} />}
        {step === 'picking' && <StepPicking reload={reload} />}
      </section>
    </div>
  );
}
