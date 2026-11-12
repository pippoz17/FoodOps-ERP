import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartNoAxesCombined, Download, CalendarDays, Package, IndianRupee, Trash2, ClipboardCheck, Percent, SlidersHorizontal } from 'lucide-react';
import { api, money, number } from '../services';
import { PageHeading, Button, SectionCard, StatusPill, Table } from '../components/UI';

const chartColors = ['#173F35','#78977A','#D47B59','#E7B85C','#8EAA91','#B8C6B5','#6B8174'];
const tooltipStyle = { border: '1px solid #E5E8E1', borderRadius: 12, boxShadow: '0 12px 32px rgba(23,63,53,.10)', fontSize: 12 };
const dateKey = value => value ? new Date(`${value}T00:00:00`) : null;
const localDate = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const compareText = (current, previous, period) => {
  if (!period) return '';
  if (!previous) return current ? 'No previous-period baseline' : 'No records in either period';
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs previous ${period}`;
};

export default function ReportsPage({ toast }) {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [waste, setWaste] = useState([]);
  const [tab, setTab] = useState('overview');
  const [range, setRange] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [supplierFilter, setSupplierFilter] = useState('All suppliers');
  const [compare, setCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, i, r, p, w] = await Promise.all([
        api.get('/reports/summary'), api.get('/inventory'), api.get('/recipes'),
        api.get('/purchase-orders'), api.get('/waste'),
      ]);
      setSummary(s); setInventory(i); setRecipes(r); setPurchases(p); setWaste(w);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : null;
  const today = new Date();
  const todayKey = localDate(today);
  const startDate = rangeDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - rangeDays) : null;
  const previousStart = rangeDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - rangeDays * 2) : null;
  const currentStartKey = startDate ? localDate(startDate) : null;
  const previousStartKey = previousStart ? localDate(previousStart) : null;

  const filteredInventory = useMemo(() => inventory.filter(x => categoryFilter === 'All categories' || x.category === categoryFilter), [inventory, categoryFilter]);
  const filteredPurchases = useMemo(() => purchases.filter(x => {
    const d = dateKey(x.order_date);
    return (supplierFilter === 'All suppliers' || String(x.supplier_id) === supplierFilter) && (!startDate || (d && d >= startDate));
  }), [purchases, supplierFilter, currentStartKey]);
  const filteredWaste = useMemo(() => waste.filter(x => {
    const d = dateKey(x.waste_date);
    return !startDate || (d && d >= startDate);
  }), [waste, currentStartKey]);

  const inventoryValue = filteredInventory.reduce((sum, x) => sum + x.inventory_value, 0);
  const purchaseValue = filteredPurchases.reduce((sum, x) => sum + x.total, 0);
  const wasteValue = filteredWaste.reduce((sum, x) => sum + x.estimated_cost, 0);
  const previousPurchases = rangeDays ? purchases.filter(x => {
    const d = dateKey(x.order_date);
    return d && d >= previousStart && d < startDate && (supplierFilter === 'All suppliers' || String(x.supplier_id) === supplierFilter);
  }).reduce((sum, x) => sum + x.total, 0) : 0;
  const previousWaste = rangeDays ? waste.filter(x => {
    const d = dateKey(x.waste_date);
    return d && d >= previousStart && d < startDate;
  }).reduce((sum, x) => sum + x.estimated_cost, 0) : 0;

  const topCategories = [...new Set(filteredInventory.map(x => x.category))].map(c => ({ name: c, value: filteredInventory.filter(x => x.category === c).reduce((sum, x) => sum + x.inventory_value, 0) })).sort((a, b) => b.value - a.value);
  const spendBySupplier = [...new Set(filteredPurchases.map(x => x.supplier_name))].map(s => ({ name: s, value: filteredPurchases.filter(x => x.supplier_name === s).reduce((sum, x) => sum + x.total, 0) })).sort((a, b) => b.value - a.value);
  const wasteTrend = [...filteredWaste].sort((a,b)=>a.waste_date.localeCompare(b.waste_date)).map(x=>({date:x.waste_date.slice(5),cost:x.estimated_cost}));
  const categories = [...new Set(inventory.map(x => x.category))].sort();
  const suppliers = [...new Map(purchases.map(x => [String(x.supplier_id), { id: String(x.supplier_id), name: x.supplier_name }])).values()].sort((a, b) => a.name.localeCompare(b.name));

  const inventoryColumns = [
    { key: 'name', label: 'INGREDIENT' }, { key: 'category', label: 'CATEGORY' },
    { key: 'quantity', label: 'ON HAND', render: r => `${number(r.quantity)} ${r.unit}` },
    { key: 'purchase_price', label: 'UNIT COST', render: r => money(r.purchase_price) },
    { key: 'inventory_value', label: 'VALUE', render: r => <b>{money(r.inventory_value)}</b> },
    { key: 'status', label: 'STATUS', render: r => <StatusPill status={r.status} /> },
  ];
  const recipeColumns = [
    { key: 'name', label: 'RECIPE' }, { key: 'total_cost', label: 'TOTAL COST', render: r => money(r.total_cost) },
    { key: 'cost_per_serving', label: 'COST / SERVING', render: r => money(r.cost_per_serving) },
    { key: 'selling_price', label: 'SELLING PRICE', render: r => money(r.selling_price) },
    { key: 'food_cost_percentage', label: 'FOOD COST', render: r => `${number(r.food_cost_percentage)}%` },
    { key: 'profit_margin', label: 'PROFIT MARGIN', render: r => <b className="text-green">{number(r.profit_margin)}%</b> },
  ];

  const exportReport = type => {
    const params = new URLSearchParams();
    if (type === 'inventory' && categoryFilter !== 'All categories') params.set('category', categoryFilter);
    if (type === 'purchases' && supplierFilter !== 'All suppliers') params.set('supplier_id', supplierFilter);
    if (rangeDays && ['purchases', 'waste'].includes(type)) {
      params.set('from', currentStartKey);
      params.set('to', todayKey);
    }
    const query = params.toString();
    api.download(`/reports/${type}.csv${query ? `?${query}` : ''}`, `foodops-${type}.csv`).catch(e => toast(e.message, 'error'));
  };
  const currentExport = tab === 'overview' ? 'inventory' : tab === 'suppliers' ? 'purchases' : tab;
  const comparePeriod = rangeDays ? `${rangeDays} days` : '';

  return <div className="page-content">
    <PageHeading eyebrow="INSIGHTS / BUSINESS INTELLIGENCE" title="Reports & analytics" description="Understand stock value, purchase spend, recipe profitability and food waste."
      actions={<div className="report-range"><CalendarDays size={15} /><select value={range} onChange={e => setRange(e.target.value)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All recorded time</option></select></div>} />
    <div className="report-filter-toolbar">
      <div className="report-filter-label"><SlidersHorizontal size={15} /><span>REPORT FILTERS</span></div>
      <label><span>Inventory category</span><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option>All categories</option>{categories.map(x => <option key={x}>{x}</option>)}</select></label>
      <label><span>Purchase supplier</span><select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}><option>All suppliers</option>{suppliers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="report-compare-toggle"><input type="checkbox" checked={compare} onChange={e => setCompare(e.target.checked)} disabled={!rangeDays} /><span>Compare previous period</span></label>
    </div>
    <div className="report-kpi-grid">
      <div><div className="report-kpi-icon"><Package size={17} /></div><span>INVENTORY VALUATION</span><strong>{money(inventoryValue)}</strong><small>{filteredInventory.length} active items</small></div>
      <div><div className="report-kpi-icon report-icon-green"><IndianRupee size={17} /></div><span>PURCHASE ORDER VALUE</span><strong>{money(purchaseValue)}</strong><small>{filteredPurchases.length} purchase orders</small>{compare && rangeDays && <em className="report-compare">{compareText(purchaseValue, previousPurchases, comparePeriod)}</em>}</div>
      <div><div className="report-kpi-icon report-icon-amber"><Trash2 size={17} /></div><span>RECORDED WASTE COST</span><strong>{money(wasteValue)}</strong><small>{filteredWaste.length} waste records</small>{compare && rangeDays && <em className="report-compare">{compareText(wasteValue, previousWaste, comparePeriod)}</em>}</div>
      <div><div className="report-kpi-icon report-icon-violet"><Percent size={17} /></div><span>AVERAGE FOOD COST</span><strong>{number(summary?.average_food_cost)}%</strong><small>{summary?.recipe_count || 0} recipes evaluated</small></div>
      <div><div className="report-kpi-icon report-icon-blue"><ClipboardCheck size={17} /></div><span>SOP COMPLETION</span><strong>{number(summary?.sop_completion)}%</strong><small>Today's checklist progress</small></div>
    </div>
    <div className="report-tab-bar">
      {[["overview", "Overview"], ["inventory", "Inventory"], ["recipes", "Recipe costing"], ["suppliers", "Purchasing"], ["waste", "Waste"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'report-tab-active' : ''}>{label}</button>)}
      <div className="tabs-spacer" /><Button variant="outline" size="small" onClick={() => exportReport(currentExport)}><Download size={14} />Export current report</Button>
    </div>
    {tab === 'overview' && <div className="report-chart-grid">
      <SectionCard title="Inventory valuation by category" subtitle="Current stock value across ingredient groups"><div className="report-donut-wrap">{topCategories.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={topCategories} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={3} stroke="none">{topCategories.map((x,i)=><Cell key={x.name} fill={chartColors[i%chartColors.length]}/>)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Legend/></PieChart></ResponsiveContainer> : <div className="empty-mini">No inventory matches this category filter.</div>}</div><div className="report-inline-legend">{topCategories.slice(0, 6).map((x, i) => <div key={x.name}><span className={`category-dot category-dot-${i}`} />{x.name}<b>{money(x.value)}</b></div>)}</div></SectionCard>
      <SectionCard title="Purchase spend by supplier" subtitle="Purchase order value for the selected date range and supplier"><div className="chart-area chart-medium">{spendBySupplier.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={spendBySupplier}><CartesianGrid vertical={false} stroke="#EAEDE7" strokeDasharray="3 4"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}} tickFormatter={v=>`₹${number(v,0)}`}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Bar dataKey="value" name="Purchase order value" fill="#173F35" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer> : <div className="empty-mini">No purchase orders match these filters.</div>}</div></SectionCard>
      <SectionCard title="Recorded waste trend" subtitle="Individual waste entries across the selected period" className="report-wide-card"><div className="chart-area chart-medium">{filteredWaste.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={wasteTrend}><CartesianGrid vertical={false} stroke="#EAEDE7" strokeDasharray="3 4"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}} tickFormatter={v=>`₹${number(v,0)}`}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Line type="monotone" dataKey="cost" name="Waste cost" stroke="#D47B59" strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer> : <div className="empty-mini">No waste records in the selected period.</div>}</div></SectionCard>
    </div>}
    {tab === 'inventory' && <SectionCard title="Inventory valuation report" subtitle="Calculated from available quantity multiplied by current purchase price" className="flush-section"><div className="table-toolbar"><span className="results-count">{filteredInventory.length} active ingredients · {money(inventoryValue)} total</span><Button size="small" variant="outline" onClick={() => exportReport('inventory')}><Download size={14} />CSV</Button></div><Table columns={inventoryColumns} rows={filteredInventory} emptyTitle="No inventory records match" /></SectionCard>}
    {tab === 'recipes' && <SectionCard title="Recipe profitability report" subtitle="Live costing uses current inventory purchase prices" className="flush-section"><div className="table-toolbar"><span className="results-count">{recipes.length} recipes · target food cost guidance: 25–35%</span><Button size="small" variant="outline" onClick={() => exportReport('recipes')}><Download size={14} />CSV</Button></div><Table columns={recipeColumns} rows={recipes} /></SectionCard>}
    {tab === 'suppliers' && <><SectionCard title="Supplier purchase performance" subtitle="Total recorded value by supplier"><div className="chart-area chart-medium">{spendBySupplier.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={spendBySupplier} layout="vertical" margin={{left:18}}><CartesianGrid horizontal={false} stroke="#EAEDE7" strokeDasharray="3 4"/><XAxis type="number" axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}}/><YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} tick={{fill:"#87938B",fontSize:10}}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Bar dataKey="value" name="Purchase order value" fill="#173F35" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer> : <div className="empty-mini">No purchase orders match these filters.</div>}</div></SectionCard><SectionCard title="Purchase order ledger" className="flush-section"><Table columns={[{ key: 'order_number', label: 'ORDER' }, { key: 'supplier_name', label: 'SUPPLIER' }, { key: 'order_date', label: 'DATE' }, { key: 'status', label: 'STATUS', render: r => <StatusPill status={r.status} /> }, { key: 'total', label: 'VALUE', render: r => money(r.total) }]} rows={filteredPurchases} emptyTitle="No purchase orders match" /></SectionCard></>}
    {tab === 'waste' && <SectionCard title="Food waste analysis" subtitle="Recorded events and associated financial impact" className="flush-section"><div className="table-toolbar"><span className="results-count">{filteredWaste.length} events · {money(wasteValue)} cost</span><Button size="small" variant="outline" onClick={() => exportReport('waste')}><Download size={14} />CSV</Button></div><Table columns={[{ key: 'waste_date', label: 'DATE' }, { key: 'item_name', label: 'ITEM' }, { key: 'category', label: 'CATEGORY' }, { key: 'quantity', label: 'QUANTITY', render: r => `${number(r.quantity)} ${r.unit}` }, { key: 'reason', label: 'REASON' }, { key: 'estimated_cost', label: 'COST', render: r => <b>{money(r.estimated_cost)}</b> }]} rows={filteredWaste} /></SectionCard>}
    {loading && <div className="report-loading-note">Refreshing report data…</div>}
    <div className="report-footnote"><ChartNoAxesCombined size={15} /><span>Reports are calculated from records currently stored in FoodOps ERP. Date filters apply to purchases and waste; category filters apply to inventory; supplier filters apply to purchase orders. Inventory and recipe valuation always reflect current balances and prices.</span></div>
  </div>;
}
