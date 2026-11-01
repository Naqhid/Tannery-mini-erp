import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from './services/api';
import { useAuth } from './lib/authContext';
import './index.css';

type CostRow = { a: string; name: string; s: string; rate: number; val: number };
const money = (n: number) => '₹' + n.toLocaleString('en-IN');
export default function App() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
 const userInitials = (user?.full_name || user?.username || 'U')
   .split(' ')
   .map((p) => p.charAt(0))
   .slice(0, 2)
   .join('')
   .toUpperCase();
 const [activeScreen, setActiveScreen] = useState('home');
 const [activeSheet, setActiveSheet] = useState<string | null>(null);
 const [articleFilter, setArticleFilter] = useState('all');
 const [orders, setOrders] = useState<any[]>([]);
 const [materials, setMaterials] = useState<any[]>([]);
 const [production, setProduction] = useState<any[]>([]);
 const [processStages, setProcessStages] = useState<any[]>([]);
 const [dashboard, setDashboard] = useState<any>({});
 const [loading, setLoading] = useState(true);
 const [apiError, setApiError] = useState('');
 const [lastUpdated, setLastUpdated] = useState(new Date());
 const rows = (r:any) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.rows) ? r.data.rows : Array.isArray(r?.rows) ? r.rows : [];
 const num = (v:any) => Number(v ?? 0) || 0;
 const pick = (o:any, ...keys:string[]) => { for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && o[k] !== '') return o[k]; return '—'; };
 const orderQty = (o:any) => num(pick(o,'total_quantity','total_qty','order_qty','order_quantity','quantity'));
 const materialValue = (m:any) => num(pick(m,'stock_value','inventory_value','total_value','value','current_value'));
 const lowStock = Array.isArray(dashboard?.lowStock) ? dashboard.lowStock : materials.filter((m:any) => { const q=num(pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty')); const min=num(pick(m,'minimum_stock','min_stock','reorder_level','minimum_qty','min_qty')); return min > 0 && q <= min; });
 // WIP quantity per stage name, aggregated from the production-status data.
 const wipByStage = useMemo(() => {
  const map = new Map<string,{qty:number;count:number}>();
  production.forEach((p:any)=>{
   const stage=String(pick(p,'stage_name','process_stage','stage','process_name')).trim();
   if (!stage || stage === '—') return;
   const qty=num(pick(p,'wip_qty','balance_qty'));
   const prev=map.get(stage.toLowerCase())||{qty:0,count:0};
   prev.qty+=qty; prev.count+=1; map.set(stage.toLowerCase(),prev);
  });
  return map;
 }, [production]);

 // All stages from the Process Stage master (ordered by seq), each carrying its
 // current WIP quantity (0 when no work is in progress). This guarantees every
 // configured stage is listed, not only the ones that happen to have WIP.
 const allStages = useMemo(() => {
  const active = processStages.filter((s:any)=>String(pick(s,'status')||'Active').toLowerCase()!=='inactive');
  if (active.length) {
   return active
    .map((s:any)=>{
     const name=String(pick(s,'name','stage_name','stage')||'—').trim();
     const uomRaw=pick(s,'uom','unit','unit_name');
     const uom=uomRaw && uomRaw !== '—' ? String(uomRaw).trim() : '';
     const hit=wipByStage.get(name.toLowerCase());
     return { stage:name, seq:num(pick(s,'seq')), uom, qty:hit?hit.qty:0, count:hit?hit.count:0 };
    })
    .sort((a,b)=>a.seq-b.seq);
  }
  // Fallback: no master available — derive stages from production data.
  return [...wipByStage.entries()].map(([k,v])=>({ stage:k, seq:0, uom:'', qty:v.qty, count:v.count })).sort((a,b)=>b.qty-a.qty);
 }, [processStages, wipByStage]);

 // Descending-by-quantity view used by the "Top WIP stages" card.
 const wipStages = useMemo(() => [...allStages].sort((a,b)=>b.qty-a.qty), [allStages]);
 const stageCosts = Array.isArray(dashboard?.stageCosts) ? dashboard.stageCosts : [];
 const aggregateCostRows = (items:any[], quantityField:string):CostRow[] => {
  const grouped = new Map<string,{a:string;name:string;s:string;qty:number;cost:number}>();
  items.forEach((item:any) => {
    const article = String(item.article || '—').trim().replace(/\s+/g,' ');
    const stage = String(item.stage || '—').trim().replace(/\s+/g,' ');
    const key = `${article.toLocaleLowerCase()}|${stage.toLocaleLowerCase()}`;
   const row = grouped.get(key) || { a:article,name:article,s:stage,qty:0,cost:0 };
   row.qty += num(item[quantityField]);
   row.cost += num(item.total_cost);
   grouped.set(key,row);
  });
  return [...grouped.values()].map(row => ({a:row.a,name:row.name,s:row.s,rate:row.qty > 0 ? row.cost / row.qty : 0,val:row.cost}));
 };
 const finished: CostRow[] = aggregateCostRows(stageCosts.filter((c:any) => num(c.completed_qty) > 0), 'completed_qty');
 const wip: CostRow[] = aggregateCostRows(stageCosts.filter((c:any) => num(c.wip_qty) > 0), 'wip_qty');
 const filteredFinished = useMemo(() => finished.filter(x => articleFilter === 'all' || x.a === articleFilter || x.name === articleFilter), [articleFilter, stageCosts]);
 const filteredWip = useMemo(() => wip.filter(x => articleFilter === 'all' || x.a === articleFilter || x.name === articleFilter), [articleFilter, stageCosts]);
 const loadData = useCallback(async () => { setLoading(true); setApiError(''); const errs:string[]=[]; const tasks = [
  apiGet<any>('/dashboard/stats').then(r=>setDashboard(r?.data ?? r)).catch(e=>errs.push('Dashboard: '+(e?.message||'failed'))),
  apiGet<any>('/sales-orders?page=1&limit=200').then(r=>setOrders(rows(r))).catch(e=>errs.push('Orders: '+(e?.message||'failed'))),
  apiGet<any>('/materials?page=1&limit=500').then(r=>setMaterials(rows(r))).catch(e=>errs.push('Inventory: '+(e?.message||'failed'))),
    apiGet<any>('/production-status/orders?page=1&limit=200').then(r=>setProduction(rows(r))).catch(e=>errs.push('Production: '+(e?.message||'failed'))),
    apiGet<any>('/process-stages?page=1&limit=200&sortBy=seq&sortOrder=asc').then(r=>setProcessStages(rows(r))).catch(e=>errs.push('Stages: '+(e?.message||'failed')))
 ]; await Promise.all(tasks); setApiError(errs.join(' · ')); setLastUpdated(new Date()); setLoading(false); }, []);
 useEffect(()=>{ void loadData(); }, [loadData]);
 const totalOrders = orders.length;
 const openOrders = orders.filter((o:any)=>!/complete|closed|cancel|shipped|delivered/i.test(String(pick(o,'status','order_status'))));
 const totalOrderedQty = orders.reduce((s:number,o:any)=>s+orderQty(o),0);
 const totalInventory = dashboard?.inventoryValue?.total != null ? num(dashboard.inventoryValue.total) : materials.reduce((sum:number,m:any)=>sum+materialValue(m),0);
 // Show every material category/type, including those that currently value 0.
 // Seed the map from all materials so zero-value categories still appear, then
 // overlay the ledger-accurate values from the backend breakdown when present.
 const inventoryBreakdown = useMemo(() => {
  const map = new Map<string, number>();
  materials.forEach((m:any) => {
   const k = String(pick(m,'category_name','material_type','type','category','group_name') || 'Other').trim() || 'Other';
   map.set(k, (map.get(k) || 0) + materialValue(m));
  });
  if (Array.isArray(dashboard?.inventoryValue?.breakdown)) {
   dashboard.inventoryValue.breakdown.forEach((item:any) => {
    const k = String(item.category || 'Other').trim() || 'Other';
    map.set(k, num(item.value));
   });
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
 }, [materials, dashboard?.inventoryValue?.breakdown]);
 const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 // Build a continuous last-6-month window from the production-status data as a
 // resilient fallback when the dashboard trend comes back empty/all-zero. Uses
 // each order's latest transaction date and its completed (output) quantity.
 const productionOutputFallback = useMemo(() => {
  const now = new Date();
  const buckets: { key:string; label:string; value:number }[] = [];
  for (let i=5;i>=0;i--) {
   const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
   buckets.push({ key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label:`${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`, value:0 });
  }
  const byKey = new Map(buckets.map(b=>[b.key,b]));
  production.forEach((p:any)=>{
   const qty = num(pick(p,'completed_qty','output_qty'));
   if (qty <= 0) return;
   const raw = pick(p,'transaction_date','production_date','updated_at','plan_date');
   if (!raw || raw === '—') return;
   const d = new Date(raw);
   if (isNaN(d.getTime())) return;
   const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
   const b = byKey.get(key);
   if (b) b.value += qty;
  });
  return buckets;
 }, [production]);
 const dashboardTrend = Array.isArray(dashboard?.productionOutputTrend) ? dashboard.productionOutputTrend : [];
 const dashboardHasOutput = dashboardTrend.some((point:any) => num(point.value) > 0);
 const productionOutputTrend = dashboardHasOutput ? dashboardTrend : productionOutputFallback;
 const hasProductionOutput = productionOutputTrend.some((point:any) => num(point.value) > 0);
 const configuredMinimums = materials.filter((m:any) => num(m.reorder_level) > 0).length;
 const stockEmptyMessage = materials.length > 0 && configuredMinimums === 0
  ? 'No minimum stock levels are configured, so stock alerts cannot be calculated.'
  : 'No materials are currently at or below minimum stock.';
 const totalWip = wipStages.reduce((s:any,x:any)=>s+x.qty,0);
 const sheetContent: Record<string, { title: string; body: React.ReactNode }> = {
 orders: { title: 'Total sales orders', body: <><div className="big">{orders.length} orders</div><p>{totalOrderedQty.toLocaleString('en-IN')} sqft in the returned sales-order records.</p><p>Counts are based on records returned by the sales-order API.</p><p>Recommended drill-down: customer, order no., article, colour, order quantity, dispatched quantity and balance quantity.</p></> },
 openorders: { title: 'Open orders', body: <><div className="big">{openOrders.length} open orders</div><p>Orders are classified as open using their current sales-order status.</p></> },
 inventory: { title: 'Inventory valuation', body: <><div className="big">{money(totalInventory)}</div><p>Live stock value from the stock ledger.</p></> },
 wip: { title: 'Top WIP stages', body: <><p>Current work in progress by stage (quantity in each stage's unit of measure).</p>{allStages.length ? <ul>{allStages.map((stage:any)=><li key={stage.stage}>{stage.stage}: {stage.qty.toLocaleString('en-IN')}{stage.uom ? ` ${stage.uom}` : ''}</li>)}</ul> : <p>No process stages configured in the master.</p>}</> },
 stock: { title: 'Stock exceptions', body: <><div className="big" style={{ color: '#d94a54' }}>{lowStock.length} items need attention</div>{lowStock.length ? <ul>{lowStock.map((item:any)=><li key={item.id}>{pick(item,'item','name','material_name')}: {pick(item,'qty','current_qty')} (minimum {pick(item,'threshold','reorder_level')})</li>)}</ul> : <p>{stockEmptyMessage}</p>}</> },
 period: { title: 'Reporting period', body: <><p>Order and stock cards show the current snapshot. The production chart shows the last six months of recorded output.</p></> },
};
 const orderStatuses = orders.reduce((a:any,o:any)=>{const k=String(pick(o,'status','order_status'));a[k]=(a[k]||0)+1;return a;},{});
 const renderCostRows = (rows: CostRow[]) => rows.length ? rows.map((x, i) => <tr key={`${x.a}-${x.s}-${i}`}><td>{x.name}</td><td><span className="stagechip">{x.s}</span></td><td>{money(x.rate)}</td><td>{money(x.val)}</td></tr>) : <tr><td colSpan={4}>No costing data for this article and stage</td></tr>;
 const showScreen = (id: string) => { setActiveScreen(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
 const openSheet = (key: string) => setActiveSheet(key);
 const closeSheet = () => setActiveSheet(null);
 const syncFilter = (value: string) => setArticleFilter(value);
 const currentSheet = activeSheet ? sheetContent[activeSheet] : null;
 return <>
<div className={"shell"}>
<header className={"top"}>
<div className={"toprow"}><div className={"brand"} style={{ gap: 9, alignItems: 'center', flexWrap: 'nowrap' }}><img src={`${import.meta.env.BASE_URL}images/product-logo-white.png`} alt="Corix logo" style={{ height: 36, width: 'auto', objectFit: 'contain' }} /><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#fff', lineHeight: 1 }}>CORIX</div><img src={`${import.meta.env.BASE_URL}images/company-logo-silver.png`} alt="AKM Leather" style={{ height: 84, width: 'auto', objectFit: 'contain' }} /></div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className={"avatar"} title={user?.full_name || user?.username || ''}>{userInitials}</div><button className={"pill"} onClick={handleLogout} title="Sign out" style={{ cursor: 'pointer' }}>⎋ Logout</button></div></div>
<div className={"greeting"}><div className={"eyebrow"}>MANAGEMENT DASHBOARD</div><h2>Good morning</h2><p>Leather operations overview · {loading ? 'Loading live data…' : apiError ? 'Some data unavailable' : 'Live data from your Tannery ERP backend'}</p></div>
<div className={"datebar"}><span className={"pill"}>📅 {lastUpdated.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className={"pill"}>⌁ All units</span><span className={"pill"}><button className={"pill refreshpill"} onClick={() => void loadData()}>{loading ? '↻ Loading…' : '↻ Refresh live data'}</button></span></div>
</header>
<main>
<section className={`screen ${activeScreen === 'home' ? 'active' : ''}`} id={"home"}>
<div className={"sectionhead"}><h3>Order & inventory summary</h3><button onClick={() => openSheet('period')}>Current snapshot ▾</button></div>
<div className={"grid"}>
<div className={"metric"} onClick={() => openSheet('orders')}><div className={"metrichead"}><div className={"ico"}>▤</div><span className={"trend"}>Live</span></div><div className={"value"}>{loading ? '—' : totalOrders.toLocaleString('en-IN')}</div><div className={"label"}>Total sales orders</div><div className={"subvalue"}>{loading ? 'Loading…' : `${totalOrderedQty.toLocaleString('en-IN')} sqft ordered`}</div></div>
<div className={"metric"} onClick={() => openSheet('openorders')}><div className={"metrichead"}><div className={"ico"} style={{background: "#fff4e5", color: "#b9750a"}}>◷</div><span style={{fontSize: "10px", color: "#c98212", fontWeight: "700"}}>Open</span></div><div className={"value"}>{loading ? '—' : openOrders.length.toLocaleString('en-IN')}</div><div className={"label"}>Open orders</div><div className={"subvalue"}>Based on current order status</div></div>
<div className={"metric wide"} onClick={() => openSheet('inventory')}><div><div className={"metrichead"}><div className={"ico"}>▦</div><span className={"trend"}>Stock value</span></div><div className={"value"}>{loading ? '—' : `₹ ${totalInventory.toLocaleString('en-IN')}`}</div><div className={"label"}>Total inventory valuation</div></div><div className={"right"}><div style={{fontSize: "10px", color: "#718096"}}>Items tracked</div><b style={{fontSize: "17px"}}>{loading ? '—' : materials.length.toLocaleString('en-IN')}</b><div style={{fontSize: "10px", color: "#718096", marginTop: "4px"}}>Materials in stock ledger</div></div></div>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Quick visual analysis</h3><span>{loading ? 'Loading API…' : 'Live API data'}</span></div>
<div className={"chartgrid"}>
<div className={"chartbox"}><div className={"charttitle"}>Order status</div><div className={"donutwrap"}><div className={"donut"}><div className={"donutcenter"}>{loading ? '—' : totalOrders}<small>orders</small></div></div><div className={"legend"}>{Object.entries(orderStatuses).slice(0,3).map(([status,count]:any,i:number)=><div key={status}><i style={{background: ["#8a9a87","#d6c69f","#b8b5aa"][i]}}></i>{status} {count}</div>)}{!orders.length && <div>No order status data</div>}</div></div><div className={"chartcaption"}>Order count by current status</div></div>
<div className={"chartbox"}><div className={"charttitle"}>Production output</div>{hasProductionOutput ? <div className={"trendchart"}>{productionOutputTrend.map((point:any,i:number)=>{const qty=num(point.value); const max=Math.max(1,...productionOutputTrend.map((x:any)=>num(x.value))); return <div className={"trendcol"} key={point.label}><div className={`trendbar ${i===productionOutputTrend.length-1?'highlight':''}`} title={`${point.label}: ${qty.toLocaleString('en-IN')}`} style={{height: `${qty ? Math.max(8,qty/max*88) : 0}%`}}></div><div className={"trendlabel"}>{String(point.label).split(' ')[0]}</div></div>})}</div> : <div className={"trendchart"} style={{alignItems:'center',justifyContent:'center',fontSize:'10px',color:'var(--muted)'}}>No production output in the last six months</div>}<div className={"chartcaption"}>Actual output quantity · last six months</div></div>
</div>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Top WIP stages</h3><span>Process sequence</span></div>
{allStages.map((s:any,i:number)=><div className={"stage"} key={s.stage}><div className={"stageline"}><b>{s.stage}</b><span>{s.qty.toLocaleString('en-IN')}{s.uom ? ` ${s.uom}` : ''} · {totalWip ? Math.round(s.qty/totalWip*100) : 0}%</span></div><div className={"track"}><div className={`bar ${i%3===1?'teal':i%3===2?'orange':''}`} style={{width: `${Math.max(0, s.qty/Math.max(1,...allStages.map((x:any)=>x.qty))*100)}%`}}></div></div></div>)}{!allStages.length && <p>{loading ? 'Loading production stages…' : 'No process stages configured in the master.'}</p>}
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Stock-out / below-minimum items</h3><span style={{color: "var(--red)"}}>{loading ? 'Loading…' : `${lowStock.length} need attention`}</span></div>
{lowStock.slice(0,3).map((m:any,i:number)=><div className={"stockrow"} key={m.id ?? i}><div className={"stockicon"}>!</div><div className={"rowmain"}><b>{pick(m,'item','name','material_name','item_name','description')}</b><small>Minimum {pick(m,'threshold','minimum_stock','min_stock','reorder_level','minimum_qty')}</small></div><div className={"qty"}>{m.qty ?? `${pick(m,'available_qty','current_stock','stock_qty','quantity','current_qty')} ${pick(m,'uom','unit','unit_name')}`}<small>{pick(m,'status') !== '—' ? pick(m,'status') : 'LOW STOCK'}</small></div></div>)}{!lowStock.length && <p>{loading ? 'Loading stock exceptions…' : stockEmptyMessage}</p>}
<button className={"detailbtn"} style={{width: "100%", marginTop: "12px"}} onClick={() => openSheet('stock')}>Open stock exceptions →</button>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Costing snapshot</h3><span>Actual stage costs · ₹</span></div>
<div className={"filter"}><select id={"articleFilter"} value={articleFilter} onChange={(event) => syncFilter(event.target.value)}><option value={"all"}>All articles</option>{Array.from(new Set(finished.map(x=>x.a))).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
<div style={{fontSize: "11px", fontWeight: "800", margin: "2px 0 5px"}}>Finished cost by article & stage</div>
<div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"finishedTable"}>{renderCostRows(filteredFinished)}</tbody></table></div>
<div style={{fontSize: "11px", fontWeight: "800", margin: "17px 0 5px"}}>WIP cost by article & stage</div>
<div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"wipTable"}>{renderCostRows(filteredWip)}</tbody></table></div>
<button className={"detailbtn"} style={{width: "100%", marginTop: "12px"}} onClick={() => showScreen('costing')}>Open detailed costing →</button>
</div>
<div className={"notice"}><b>Management watch:</b> {configuredMinimums === 0 ? 'Configure minimum stock levels to enable stock-out and below-minimum alerts.' : 'Review stock exceptions before releasing the next production batches.'} Check WIP ageing and order delivery dates alongside these totals.</div>
<div className={"footnote"}>{apiError ? `API warning: ${apiError}` : loading ? 'Loading live ERP data…' : `Connected to ERP APIs · Updated ${lastUpdated.toLocaleTimeString()}`}</div>
</section>
<section className={`screen ${activeScreen === 'orders' ? 'active' : ''}`} id={"orders"}>
<div className={"screenhead"}><h2>Orders</h2><p>Sales order status and outstanding quantity</p></div>
<main style={{paddingTop: 0}}>
<div className={"kpi2"}><div className={"metric"}><div className={"label"}>Total orders</div><div className={"value"}>{totalOrders}</div><div className={"subvalue"}>{totalOrderedQty.toLocaleString('en-IN')} sqft</div></div><div className={"metric"}><div className={"label"}>Open orders</div><div className={"value"}>{openOrders.length}</div><div className={"subvalue"}>Calculated from current statuses</div></div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>Open orders requiring attention</h3><span>Current status</span></div>
{openOrders.slice(0,10).map((o:any,i:number)=><div className={"costrow"} key={o.id ?? i}><div className={"rowmain"}><b>{pick(o,'order_no','order_number','sales_order_no','code')} · {pick(o,'customer_name','customer','customer_code')}</b><small>{pick(o,'article_name','product_name','article','product')} · {pick(o,'due_date','delivery_date','order_date')}</small></div><div className={"qty"}>{orderQty(o).toLocaleString('en-IN')} sqft<small>{pick(o,'status','order_status')}</small></div></div>)}{!openOrders.length && <p>{loading ? 'Loading open orders…' : 'No open orders returned by the backend.'}</p>}</div>
<div className={"notice"}>Suggested KPI: show <b>overdue open orders</b> and <b>on-time delivery %</b> next to open order quantity.</div>
</main>
</section>
<section className={`screen ${activeScreen === 'inventory' ? 'active' : ''}`} id={"inventory"}>
<div className={"screenhead"}><h2>Inventory</h2><p>Valuation and stock exceptions</p></div>
<main style={{paddingTop: 0}}>
<div className={"metric wide"}><div><div className={"label"}>Total inventory value</div><div className={"value"}>{loading ? '—' : `₹ ${totalInventory.toLocaleString('en-IN')}`}</div><div className={"label"}>Live valuation from stock ledger</div></div><div className={"ico"}>▦</div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>Value by category</h3><span>₹ INR</span></div>
{inventoryBreakdown.map(([category,value]:any,i:number)=><div className={"stage"} key={category}><div className={"stageline"}><b>{category}</b><span>{money(num(value))}</span></div><div className={"track"}><div className={`bar ${i===1?'teal':i===2?'orange':''}`} style={{width: `${Math.max(0,num(value)/Math.max(1,...inventoryBreakdown.map((x:any)=>num(x[1])))*100)}%`}}></div></div></div>)}{!inventoryBreakdown.length && <p>{loading ? 'Loading inventory categories…' : 'No material categories found.'}</p>}</div>
<div className={"panel"}><div className={"paneltitle"}><h3>Stock exceptions</h3><span style={{color: "var(--red)"}}>{lowStock.length} items</span></div>
{lowStock.slice(0,8).map((m:any,i:number)=><div className={"stockrow"} key={m.id ?? i}><div className={"stockicon"}>!</div><div className={"rowmain"}><b>{pick(m,'item','name','material_name','item_name','description')}</b><small>Minimum {pick(m,'threshold','minimum_stock','reorder_level')}</small></div><div className={"qty"}>{m.qty ?? `${pick(m,'available_qty','current_stock','stock_qty','quantity','current_qty')} ${pick(m,'uom','unit','unit_name')}`}<small>{pick(m,'status') !== '—' ? pick(m,'status') : 'LOW'}</small></div></div>)}{!lowStock.length && <p>{loading ? 'Loading stock exceptions…' : stockEmptyMessage}</p>}</div>
<div className={"notice green-notice"}>Recommended: display stock on hand, allocated quantity, available quantity, reorder level and last receipt date for each exception.</div>
</main>
</section>
<section className={`screen ${activeScreen === 'costing' ? 'active' : ''}`} id={"costing"}>
<div className={"screenhead"}><h2>Cost analysis</h2><p>Finished leather and in-process batch cost</p></div>
<main style={{paddingTop: 0}}>
<div className={"filter"}><select id={"articleFilter2"} value={articleFilter} onChange={(event) => syncFilter(event.target.value)}><option value={"all"}>All articles</option>{Array.from(new Set(finished.map(x=>x.a))).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
<div className={"panel"}><div className={"paneltitle"}><h3>Finished cost by article & stage</h3><span>₹/pc</span></div><div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"finishedTable2"}>{renderCostRows(filteredFinished)}</tbody></table></div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>WIP cost by article & stage</h3><span>₹/pc</span></div><div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"wipTable2"}>{renderCostRows(filteredWip)}</tbody></table></div></div>
<div className={"notice"}>For reliable cost comparison, include batch number, sale order, article, colour, stage, quantity basis, cost as-of date and cost components (material, chemicals, labour, overhead).</div>
</main>
</section>
<section className={`screen ${activeScreen === 'production' ? 'active' : ''}`} id={"production"}>
<div className={"screenhead"}><h2>Production WIP</h2><p>Stage-wise quantity currently in process</p></div>
<main style={{paddingTop: 0}}>
<div className={"metric wide"}><div><div className={"label"}>Active WIP stages</div><div className={"value"}>{loading ? '—' : allStages.filter((s:any)=>s.qty>0).length}</div><div className={"label"}>Of {allStages.length} process stage{allStages.length === 1 ? '' : 's'} in master</div></div><div className={"ico"}>⇄</div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>All stages · process sequence</h3><span>per stage UOM</span></div>
{allStages.map((s:any,i:number)=><div className={"stage"} key={s.stage}><div className={"stageline"}><b>{s.stage}</b><span>{s.qty.toLocaleString('en-IN')}{s.uom ? ` ${s.uom}` : ''}</span></div><div className={"track"}><div className={`bar ${i%3===1?'teal':i%3===2?'orange':''}`} style={{width: `${Math.max(0,s.qty/Math.max(1,...allStages.map((x:any)=>x.qty))*100)}%`}}></div></div></div>)}{!allStages.length && <p>{loading ? 'Loading production stages…' : 'No process stages configured in the master.'}</p>}</div>
<div className={"notice"}>Useful addition: WIP ageing buckets (0–3 days, 4–7 days, over 7 days) and stage-wise planned vs actual yield.</div>
</main>
</section>
</main>
<nav className={"bottomnav"}>
<button className={`navitem ${activeScreen === 'home' ? 'active' : ''}`} data-screen={"home"} onClick={() => showScreen('home')}><span className={"navico"}>⌂</span>Dashboard</button>
<button className={`navitem ${activeScreen === 'orders' ? 'active' : ''}`} data-screen={"orders"} onClick={() => showScreen('orders')}><span className={"navico"}>▤</span>Orders</button>
<button className={`navitem ${activeScreen === 'production' ? 'active' : ''}`} data-screen={"production"} onClick={() => showScreen('production')}><span className={"navico"}>⇄</span>Production</button>
<button className={`navitem ${activeScreen === 'inventory' ? 'active' : ''}`} data-screen={"inventory"} onClick={() => showScreen('inventory')}><span className={"navico"}>▦</span>Inventory</button>
<button className={`navitem ${activeScreen === 'costing' ? 'active' : ''}`} data-screen={"costing"} onClick={() => showScreen('costing')}><span className={"navico"}>₹</span>Costing</button>
</nav>
</div>
<div className={`overlay ${activeSheet ? 'show' : ''}`} id={"overlay"} onClick={(event) => { if (event.target === event.currentTarget) closeSheet(); }}><div className={"sheet"}><div className={"sheettop"}><h3 id={"sheetTitle"}>{currentSheet?.title ?? 'Details'}</h3><button className={"close"} onClick={closeSheet}>×</button></div><div id={"sheetBody"}>{currentSheet?.body}</div></div></div>

</>;
}
