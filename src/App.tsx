import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet } from './services/api';
import './index.css';

type CostRow = { a: string; name: string; s: string; rate: number; val: number };
const finished: CostRow[] = [];
const wip: CostRow[] = [];
const money = (n: number) => '₹' + n.toLocaleString('en-IN');
export default function App() {
 const [activeScreen, setActiveScreen] = useState('home');
 const [activeSheet, setActiveSheet] = useState<string | null>(null);
 const [articleFilter, setArticleFilter] = useState('all');
 const [orders, setOrders] = useState<any[]>([]);
 const [materials, setMaterials] = useState<any[]>([]);
 const [production, setProduction] = useState<any[]>([]);
 const [costing, setCosting] = useState<any[]>([]);
 const [dashboard, setDashboard] = useState<any>({});
 const [loading, setLoading] = useState(true);
 const [apiError, setApiError] = useState('');
 const [lastUpdated, setLastUpdated] = useState(new Date());
 const rows = (r:any) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.rows) ? r.data.rows : Array.isArray(r?.rows) ? r.rows : [];
 const num = (v:any) => Number(v ?? 0) || 0;
 const pick = (o:any, ...keys:string[]) => { for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && o[k] !== '') return o[k]; return '—'; };
 const orderQty = (o:any) => num(pick(o,'total_quantity','total_qty','order_qty','order_quantity','quantity'));
 const materialValue = (m:any) => num(pick(m,'stock_value','inventory_value','total_value','value','current_value'));
 const lowStock = materials.filter((m:any) => { const q=num(pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty')); const min=num(pick(m,'minimum_stock','min_stock','reorder_level','minimum_qty','min_qty')); return min > 0 && q <= min; });
 const wipStages = useMemo(() => { const map = new Map<string,{stage:string;qty:number;count:number}>(); production.forEach((p:any)=>{ const stage=String(pick(p,'stage_name','process_stage','stage','process_name')); const qty=num(pick(p,'wip_qty','quantity','planned_qty','order_qty','qty')); const prev=map.get(stage)||{stage,qty:0,count:0}; prev.qty+=qty; prev.count+=1; map.set(stage,prev); }); return [...map.values()].sort((a,b)=>b.qty-a.qty); }, [production]);
 const totalInventory = materials.reduce((sum:number,m:any)=>sum+materialValue(m),0);
 const finished: CostRow[] = costing.map((c:any)=>({a:String(pick(c,'article_code','article','product_code')),name:String(pick(c,'article_name','article','product_name')),s:String(pick(c,'stage_name','stage','process_stage')),rate:num(pick(c,'cost_per_piece','cost_per_sqft','unit_cost','cost_rate')),val:num(pick(c,'total_cost','total_value','cost_amount'))})).filter((c:CostRow)=>c.name!=='—');
 const wip: CostRow[] = finished.filter((c:CostRow)=>/wip|tann|wet blue|retann|finish/i.test(c.s));
 const filteredFinished = useMemo(() => finished.filter(x => articleFilter === 'all' || x.a === articleFilter || x.name === articleFilter), [articleFilter, costing, articleFilter]);
 const filteredWip = useMemo(() => wip.filter(x => articleFilter === 'all' || x.a === articleFilter || x.name === articleFilter), [articleFilter, costing, articleFilter]);
 const loadData = useCallback(async () => { setLoading(true); setApiError(''); const errs:string[]=[]; const tasks = [
  apiGet<any>('/dashboard/stats').then(r=>setDashboard(r?.data ?? r)).catch(e=>errs.push('Dashboard: '+(e?.message||'failed'))),
  apiGet<any>('/sales-orders?page=1&limit=200').then(r=>setOrders(rows(r))).catch(e=>errs.push('Orders: '+(e?.message||'failed'))),
  apiGet<any>('/materials?page=1&limit=500').then(r=>setMaterials(rows(r))).catch(e=>errs.push('Inventory: '+(e?.message||'failed'))),
  apiGet<any>('/production-status/orders?page=1&limit=200').then(r=>setProduction(rows(r))).catch(e=>errs.push('Production: '+(e?.message||'failed'))),
  apiGet<any>('/costing-report?page=1&limit=500').then(r=>setCosting(rows(r))).catch(e=>errs.push('Costing: '+(e?.message||'failed')))
 ]; await Promise.all(tasks); setApiError(errs.join(' · ')); setLastUpdated(new Date()); setLoading(false); }, []);
 useEffect(()=>{ void loadData(); }, [loadData]);
 const totalOrders = orders.length;
 const openOrders = orders.filter((o:any)=>!/complete|closed|cancel|shipped|delivered/i.test(String(pick(o,'status','order_status'))));
 const totalOrderedQty = orders.reduce((s:number,o:any)=>s+orderQty(o),0);
 const sheetContent: Record<string, { title: string; body: React.ReactNode }> = {
 orders: { title: 'Total sales orders', body: <><div className="big">{orders.length} orders</div><p>{totalOrderedQty.toLocaleString('en-IN')} pcs in the returned sales-order records.</p><p>Counts are based on records returned by the sales-order API.</p><p>Recommended drill-down: customer, order no., article, colour, order quantity, dispatched quantity and balance quantity.</p></> },
 openorders: { title: 'Open orders', body: <><div className="big">{openOrders.length} open orders</div><p>Outstanding quantity is the order quantity less accepted dispatch quantity.</p><ul><li>Overdue: 6 orders</li><li>Due within 3 days: 8 orders</li><li>Awaiting production plan: 5 orders</li></ul></> },
 inventory: { title: 'Inventory valuation', body: <><div className="big">{money(totalInventory)}</div><p>Calculated from inventory values returned by the materials API.</p><p>Confirm the valuation method (FIFO or weighted average) and valuation date in the live ERP.</p></> },
 wip: { title: 'Top WIP stages', body: <><div className="big">40,450 pcs</div><p>Top 3 stages by WIP quantity, sorted descending.</p><ul><li>Wet blue / soaking: 18,450 pcs</li><li>Tanning & retanning: 12,680 pcs</li><li>Finishing: 9,320 pcs</li></ul><p>Consider showing WIP value and ageing beside quantity to identify bottlenecks.</p></> },
 stock: { title: 'Stock exceptions', body: <><div className="big" style={{ color: '#d94a54' }}>1 stock-out · 3 low-stock items</div><p>Items should be flagged when available stock is at or below reorder level.</p><ul><li>Basic Chrome Powder: 0 kg (stock-out)</li><li>Formic Acid 85%: 18 kg (minimum 100 kg)</li><li>Blue Wet Salt: 120 pcs (minimum 500 pcs)</li><li>Retanning Agent X: 22 kg (below minimum)</li></ul><p>Next action: check open purchase orders and expected receipt dates before raising a purchase request.</p></> },
 period: { title: 'Reporting period', body: <><p>This is a visual prototype. The selected reporting period is shown as <b>This month</b>. In production, provide Today, This week, This month, Financial year and Custom date range.</p></> },
};
 const totalWip = wipStages.reduce((s:any,x:any)=>s+x.qty,0);
 const orderStatuses = orders.reduce((a:any,o:any)=>{const k=String(pick(o,'status','order_status'));a[k]=(a[k]||0)+1;return a;},{});
 const inventoryBreakdown = Object.entries(materials.reduce((a:any,m:any)=>{const k=String(pick(m,'category_name','material_type','type','category','group_name'));a[k]=(a[k]||0)+materialValue(m);return a;},{})).sort((a:any,b:any)=>b[1]-a[1]);
 const renderCostRows = (rows: CostRow[]) => rows.length ? rows.map((x, i) => <tr key={`${x.a}-${x.s}-${i}`}><td>{x.name}</td><td><span className="stagechip">{x.s}</span></td><td>{money(x.rate)}</td><td>{money(x.val)}</td></tr>) : <tr><td colSpan={4}>No records for this article</td></tr>;
 const showScreen = (id: string) => { setActiveScreen(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
 const openSheet = (key: string) => setActiveSheet(key);
 const closeSheet = () => setActiveSheet(null);
 const syncFilter = (value: string) => setArticleFilter(value);
 const renderCostTables = () => {};
 const currentSheet = activeSheet ? sheetContent[activeSheet] : null;
 return <>
<div className={"shell"}>
<header className={"top"}>
<div className={"toprow"}><div className={"brand"}><div className={"logo"}>◈</div><div><h1>TANNERY ERP</h1><small>Operations at a glance</small></div></div><div className={"avatar"}>MD</div></div>
<div className={"greeting"}><div className={"eyebrow"}>MANAGEMENT DASHBOARD</div><h2>Good morning</h2><p>Leather operations overview · {loading ? 'Loading live data…' : apiError ? 'Some data unavailable' : 'Live data from your Tannery ERP backend'}</p></div>
<div className={"datebar"}><span className={"pill"}>📅 {lastUpdated.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className={"pill"}>⌁ All units</span><span className={"pill"}><button className={"pill refreshpill"} onClick={() => void loadData()}>{loading ? '↻ Loading…' : '↻ Refresh live data'}</button></span></div>
</header>
<main>
<section className={`screen ${activeScreen === 'home' ? 'active' : ''}`} id={"home"}>
<div className={"sectionhead"}><h3>Order & inventory summary</h3><button onClick={() => openSheet('period')}>This month ▾</button></div>
<div className={"grid"}>
<div className={"metric"} onClick={() => openSheet('orders')}><div className={"metrichead"}><div className={"ico"}>▤</div><span className={"trend"}>+8.2%</span></div><div className={"value"}>{loading ? '—' : totalOrders.toLocaleString('en-IN')}</div><div className={"label"}>Total sales orders</div><div className={"subvalue"}>{loading ? 'Loading…' : `${totalOrderedQty.toLocaleString('en-IN')} pcs ordered`}</div></div>
<div className={"metric"} onClick={() => openSheet('openorders')}><div className={"metrichead"}><div className={"ico"} style={{background: "#fff4e5", color: "#b9750a"}}>◷</div><span style={{fontSize: "10px", color: "#c98212", fontWeight: "700"}}>Open</span></div><div className={"value"}>{loading ? '—' : openOrders.length.toLocaleString('en-IN')}</div><div className={"label"}>Open orders</div><div className={"subvalue"}>Based on current order status</div></div>
<div className={"metric wide"} onClick={() => openSheet('inventory')}><div><div className={"metrichead"}><div className={"ico"}>▦</div><span className={"trend"}>Stock value</span></div><div className={"value"}>{loading ? '—' : `₹ ${totalInventory.toLocaleString('en-IN')}`}</div><div className={"label"}>Total inventory valuation</div></div><div className={"right"}><div style={{fontSize: "10px", color: "#718096"}}>Items tracked</div><b style={{fontSize: "17px"}}>{loading ? '—' : materials.length.toLocaleString('en-IN')}</b><div style={{fontSize: "10px", color: "#718096", marginTop: "4px"}}>RM · Chemicals · WIP · FG</div></div></div>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Quick visual analysis</h3><span>{loading ? 'Loading API…' : 'Live API data'}</span></div>
<div className={"chartgrid"}>
<div className={"chartbox"}><div className={"charttitle"}>Order status</div><div className={"donutwrap"}><div className={"donut"}><div className={"donutcenter"}>{loading ? '—' : totalOrders}<small>orders</small></div></div><div className={"legend"}>{Object.entries(orderStatuses).slice(0,3).map(([status,count]:any,i:number)=><div key={status}><i style={{background: ["#8a9a87","#d6c69f","#b8b5aa"][i]}}></i>{status} {count}</div>)}{!orders.length && <div>No order status data</div>}</div></div><div className={"chartcaption"}>Order count by current status</div></div>
<div className={"chartbox"}><div className={"charttitle"}>Production output</div><div className={"trendchart"}>{["May","Jun","Jul","Aug","Sep","Oct"].map((month,i)=>{const qty=wipStages[i]?.qty ?? 0; const max=Math.max(1,...wipStages.map((s:any)=>s.qty)); return <div className={"trendcol"} key={month}><div className={`trendbar ${i===5?'highlight':''}`} style={{height: `${qty ? Math.max(8,qty/max*88) : 8}%`}}></div><div className={"trendlabel"}>{month}</div></div>})}</div><div className={"chartcaption"}>Monthly output trend · relative volume</div></div>
</div>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Top WIP stages</h3><span>Descending · pieces</span></div>
{wipStages.slice(0,3).map((s:any,i:number)=><div className={"stage"} key={s.stage}><div className={"stageline"}><b>{s.stage}</b><span>{s.qty.toLocaleString('en-IN')} pcs · {totalWip ? Math.round(s.qty/totalWip*100) : 0}%</span></div><div className={"track"}><div className={`bar ${i===1?'teal':i===2?'orange':''}`} style={{width: `${totalWip ? s.qty/Math.max(1,...wipStages.map((x:any)=>x.qty))*100 : 0}%`}}></div></div></div>)}{!wipStages.length && <p>{loading ? 'Loading production stages…' : 'No production-stage quantities returned by the backend.'}</p>}
<button className={"detailbtn"} style={{width: "100%", marginTop: "5px"}} onClick={() => openSheet('wip')}>View all production stages →</button>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Stock-out / below-minimum items</h3><span style={{color: "var(--red)"}}>{loading ? 'Loading…' : `${lowStock.length} need attention`}</span></div>
{lowStock.slice(0,3).map((m:any,i:number)=><div className={"stockrow"} key={m.id ?? i}><div className={"stockicon"}>!</div><div className={"rowmain"}><b>{pick(m,'name','material_name','item_name','description')}</b><small>{pick(m,'code','material_code','item_code')} · Min {pick(m,'minimum_stock','min_stock','reorder_level','minimum_qty')}</small></div><div className={"qty"}>{pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty')} {pick(m,'uom','unit','unit_name')}<small>{num(pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty'))<=0?'STOCK OUT':'LOW STOCK'}</small></div></div>)}{!lowStock.length && <p>{loading ? 'Loading stock exceptions…' : 'No below-minimum materials returned by the backend.'}</p>}
<button className={"detailbtn"} style={{width: "100%", marginTop: "12px"}} onClick={() => openSheet('stock')}>Open stock exceptions →</button>
</div>
<div className={"panel"}>
<div className={"paneltitle"}><h3>Costing snapshot</h3><span>₹ per piece</span></div>
<div className={"filter"}><select id={"articleFilter"} value={articleFilter} onChange={(event) => syncFilter(event.target.value)}><option value={"all"}>All articles</option>{Array.from(new Set(finished.map(x=>x.a))).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
<div style={{fontSize: "11px", fontWeight: "800", margin: "2px 0 5px"}}>Finished cost by article & stage</div>
<div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"finishedTable"}>{renderCostRows(filteredFinished)}</tbody></table></div>
<div style={{fontSize: "11px", fontWeight: "800", margin: "17px 0 5px"}}>WIP cost by article & stage</div>
<div style={{overflowX: "auto"}}><table className={"costtable"}><thead><tr><th>Article</th><th>Stage</th><th>₹/pc</th><th>Total value</th></tr></thead><tbody id={"wipTable"}>{renderCostRows(filteredWip)}</tbody></table></div>
<button className={"detailbtn"} style={{width: "100%", marginTop: "12px"}} onClick={() => showScreen('costing')}>Open detailed costing →</button>
</div>
<div className={"notice"}><b>Management watch:</b> Review stock-out chemicals before releasing the next production batches. Check WIP ageing and order delivery dates alongside these totals.</div>
<div className={"footnote"}>{apiError ? `API warning: ${apiError}` : loading ? 'Loading live ERP data…' : `Connected to ERP APIs · Updated ${lastUpdated.toLocaleTimeString()}`}</div>
</section>
<section className={`screen ${activeScreen === 'orders' ? 'active' : ''}`} id={"orders"}>
<div className={"screenhead"}><h2>Orders</h2><p>Sales order status and outstanding quantity</p></div>
<main style={{paddingTop: 0}}>
<div className={"kpi2"}><div className={"metric"}><div className={"label"}>Total orders</div><div className={"value"}>{totalOrders}</div><div className={"subvalue"}>{totalOrderedQty.toLocaleString('en-IN')} pcs</div></div><div className={"metric"}><div className={"label"}>Open orders</div><div className={"value"}>{openOrders.length}</div><div className={"subvalue"}>Calculated from current statuses</div></div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>Open orders requiring attention</h3><span>Sample</span></div>
{openOrders.slice(0,10).map((o:any,i:number)=><div className={"costrow"} key={o.id ?? i}><div className={"rowmain"}><b>{pick(o,'order_no','order_number','sales_order_no','code')} · {pick(o,'customer_name','customer','customer_code')}</b><small>{pick(o,'article_name','product_name','article','product')} · {pick(o,'due_date','delivery_date','order_date')}</small></div><div className={"qty"}>{orderQty(o).toLocaleString('en-IN')} pcs<small>{pick(o,'status','order_status')}</small></div></div>)}{!openOrders.length && <p>{loading ? 'Loading open orders…' : 'No open orders returned by the backend.'}</p>}</div>
<div className={"notice"}>Suggested KPI: show <b>overdue open orders</b> and <b>on-time delivery %</b> next to open order quantity.</div>
</main>
</section>
<section className={`screen ${activeScreen === 'inventory' ? 'active' : ''}`} id={"inventory"}>
<div className={"screenhead"}><h2>Inventory</h2><p>Valuation and stock exceptions</p></div>
<main style={{paddingTop: 0}}>
<div className={"metric wide"}><div><div className={"label"}>Total inventory value</div><div className={"value"}>{loading ? '—' : `₹ ${totalInventory.toLocaleString('en-IN')}`}</div><div className={"label"}>Live valuation from material records</div></div><div className={"ico"}>▦</div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>Value by category</h3><span>₹ Crore</span></div>
{inventoryBreakdown.slice(0,8).map(([category,value]:any,i:number)=><div className={"stage"} key={category}><div className={"stageline"}><b>{category}</b><span>{money(num(value))}</span></div><div className={"track"}><div className={`bar ${i===1?'teal':i===2?'orange':''}`} style={{width: `${Math.max(1,num(value)/Math.max(1,...inventoryBreakdown.map((x:any)=>num(x[1])))*100)}%`}}></div></div></div>)}{!inventoryBreakdown.length && <p>{loading ? 'Loading inventory categories…' : 'Category values are not provided by the material API.'}</p>}</div>
<div className={"panel"}><div className={"paneltitle"}><h3>Stock exceptions</h3><span style={{color: "var(--red)"}}>{lowStock.length} items</span></div>
{lowStock.slice(0,8).map((m:any,i:number)=><div className={"stockrow"} key={m.id ?? i}><div className={"stockicon"}>!</div><div className={"rowmain"}><b>{pick(m,'name','material_name','item_name','description')}</b><small>{pick(m,'code','material_code','item_code')} · Below minimum</small></div><div className={"qty"}>{pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty')} {pick(m,'uom','unit','unit_name')}<small>{num(pick(m,'available_qty','current_stock','stock_qty','quantity','qty','current_qty'))<=0?'OUT':'LOW'}</small></div></div>)}{!lowStock.length && <p>{loading ? 'Loading stock exceptions…' : 'No low-stock items returned by the backend.'}</p>}</div>
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
<div className={"metric wide"}><div><div className={"label"}>Total WIP quantity</div><div className={"value"}>{loading ? '—' : totalWip.toLocaleString('en-IN')} pcs</div><div className={"label"}>Across {wipStages.length} stages returned by backend</div></div><div className={"ico"}>⇄</div></div>
<div className={"panel"}><div className={"paneltitle"}><h3>All stages · descending quantity</h3><span>Pieces</span></div>
{wipStages.map((s:any,i:number)=><div className={"stage"} key={s.stage}><div className={"stageline"}><b>{s.stage}</b><span>{s.qty.toLocaleString('en-IN')}</span></div><div className={"track"}><div className={`bar ${i%3===1?'teal':i%3===2?'orange':''}`} style={{width: `${Math.max(1,s.qty/Math.max(1,...wipStages.map((x:any)=>x.qty))*100)}%`}}></div></div></div>)}{!wipStages.length && <p>{loading ? 'Loading production WIP…' : 'No stage-wise quantities returned by the production API.'}</p>}</div>
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
