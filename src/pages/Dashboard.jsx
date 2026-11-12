import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Boxes, Wallet, PackageCheck, AlertTriangle, CalendarClock, ShoppingBag, Trash2, Percent, ArrowUpRight, ArrowRight, Clock3 } from 'lucide-react';
import { MetricCard, PageHeading, SectionCard, StatusPill, Table } from '../components/UI';
import { money, number, shortDate } from '../services';

const chartColors = ['#173F35', '#78977A', '#D47B59', '#E7B85C', '#8EAA91', '#B8C6B5', '#6B8174'];
const tooltipStyle = { border: '1px solid #E5E8E1', borderRadius: 12, boxShadow: '0 12px 32px rgba(23,63,53,.10)', fontSize: 12 };

export default function Dashboard({ data, onNavigate, loading, user }) {
  const k = data?.kpis || {};
  const charts = data?.charts || { months: [], purchases: [], waste: [], inventory: [], recipe_costs: [] };
  const spend = (charts.months || []).map((month, i) => ({ month, purchases: charts.purchases?.[i] || 0, waste: charts.waste?.[i] || 0 }));
  const recipeCostSeries = (charts.recipe_costs || []).map(item => ({ ...item, target: 30 }));
  const orderColumns = [{ key: 'order_number', label: 'ORDER' }, { key: 'supplier_name', label: 'SUPPLIER' }, { key: 'order_date', label: 'DATE', render: r => shortDate(r.order_date) }, { key: 'status', label: 'STATUS', render: r => <StatusPill status={r.status} /> }, { key: 'total', label: 'TOTAL', align: 'right', render: r => <b>{money(r.total)}</b> }];
  return <div className="page-content">
    <PageHeading eyebrow="WORKSPACE / OVERVIEW" title={`Good day, ${user?.name?.split(' ')[0] || 'there'}`} description="Here’s what’s happening across your food operations today." actions={<div className="date-chip"><span className="date-chip-dot" />{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>} />
    <div className="welcome-strip"><div className="welcome-icon"><span>✳</span></div><div><strong>Your operations at a glance</strong><p>Monitor cost, stock health and daily execution from one place.</p></div><div className="welcome-right"><span>MAIN OUTLET</span><b>Operations overview</b></div></div>
    <div className="metrics-grid">
      <MetricCard label="Inventory value" value={money(k.inventory_value)} icon={Wallet} tone="green" caption="Current stock on hand" />
      <MetricCard label="Average food cost" value={`${number(k.average_recipe_food_cost)}%`} icon={Percent} tone="blue" caption="Across saved recipes" />
      <MetricCard label="Total ingredients" value={number(k.total_ingredients, 0)} icon={Boxes} tone="violet" caption="Active inventory items" />
      <MetricCard label="Low stock items" value={number(k.low_stock_items, 0)} icon={AlertTriangle} tone="orange" caption="Needs replenishment" />
      <MetricCard label="Expiring items" value={number(k.expiring_items, 0)} icon={CalendarClock} tone="red" caption="Within the next 30 days" />
      <MetricCard label="Monthly purchase order value" value={money(k.monthly_purchase_expenses)} icon={ShoppingBag} tone="blue" caption="Orders created this month" />
      <MetricCard label="Food wastage" value={money(k.monthly_waste)} icon={Trash2} tone="orange" caption="Recorded this month" />
      <MetricCard label="Average profit margin" value={`${number(k.average_profit_margin)}%`} icon={PackageCheck} tone="green" caption="Across saved recipes" />
    </div>
    <div className="dashboard-chart-grid">
      <SectionCard title="Purchase & waste overview" subtitle="Monthly spend compared with recorded waste" action={<span className="chart-period">LAST 6 MONTHS</span>}>
        <div className="chart-legend"><span><i className="legend-green" />Purchases</span><span><i className="legend-amber" />Waste cost</span></div>
        <div className="chart-area chart-large">{loading ? <div className="skeleton-block" /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={spend} barGap={8}><CartesianGrid vertical={false} stroke="#EAEDE7" strokeDasharray="3 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#87938B', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87938B', fontSize: 10 }} tickFormatter={v => `₹${number(v,0)}`} /><Tooltip contentStyle={tooltipStyle} formatter={v => money(v)} /><Bar dataKey="purchases" name="Purchases" fill="#173F35" radius={[6,6,0,0]} maxBarSize={28} /><Bar dataKey="waste" name="Waste cost" fill="#E7B85C" radius={[6,6,0,0]} maxBarSize={28} /></BarChart></ResponsiveContainer>}</div>
      </SectionCard>
      <SectionCard title="Inventory value by category" subtitle="Where your stock value sits">
        <div className="donut-wrap">{charts.inventory?.length ? <><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.inventory} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="88%" paddingAngle={3} stroke="none">{charts.inventory.map((x,i)=><Cell key={x.name} fill={chartColors[i%chartColors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(k.inventory_value)}</strong><span>TOTAL VALUE</span></div></> : <div className="empty-mini">No inventory data</div>}</div>
        <div className="category-legend">{(charts.inventory || []).slice(0,5).map((c,i)=><div key={c.name}><span className={`category-dot category-dot-${i}`} />{c.name}<b>{money(c.value)}</b></div>)}</div>
      </SectionCard>
    </div>
    <div className="dashboard-lower-grid">
      <SectionCard title="Low stock watchlist" subtitle="Items that need attention" action={<button className="text-action" onClick={() => onNavigate('inventory')}>View inventory <ArrowRight size={14} /></button>}>
        {data?.low_stock?.length ? <div className="watchlist">{data.low_stock.map(item=><div className="watch-row" key={item.id}><div className="watch-avatar">{item.name.slice(0,1)}</div><div className="watch-main"><strong>{item.name}</strong><small>{item.item_code} · Minimum {number(item.min_stock)} {item.unit}</small></div><div className="watch-qty"><strong>{number(item.quantity)} {item.unit}</strong><StatusPill status={item.status} /></div></div>)}</div> : <div className="healthy-state"><div>✓</div><strong>Stock levels look healthy</strong><span>No replenishment alerts at the moment.</span></div>}
      </SectionCard>
      <SectionCard title="Upcoming expiry" subtitle="Ingredients approaching their expiry date" action={<button className="text-action" onClick={()=>onNavigate('inventory')}>Open inventory <ArrowRight size={14}/></button>}>
        {data?.expiring?.length ? <div className="expiry-list">{data.expiring.map(item=><div className="expiry-row" key={item.id}><div className="expiry-icon"><Clock3 size={16}/></div><div><strong>{item.name}</strong><small>Batch {item.batch_number||'—'} · {number(item.quantity)} {item.unit}</small></div><span>{shortDate(item.expiry_date)}</span></div>)}</div> : <div className="healthy-state"><div>✓</div><strong>No near-term expiries</strong><span>Nothing expires in the next 30 days.</span></div>}
      </SectionCard>
    </div>
    <div className="dashboard-chart-grid">
      <SectionCard title="Food cost by recipe" subtitle="Current cost percentage against a 30% planning reference">
        {(charts.recipe_costs||[]).length ? <div className="chart-area chart-medium"><ResponsiveContainer width="100%" height="100%"><LineChart data={recipeCostSeries}><CartesianGrid vertical={false} stroke="#EAEDE7" strokeDasharray="3 4"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#87938B',fontSize:9}} interval={0} angle={-12} textAnchor="end" height={48}/><YAxis domain={[0,'auto']} axisLine={false} tickLine={false} tick={{fill:'#87938B',fontSize:10}} tickFormatter={v=>`${v}%`}/><Tooltip contentStyle={tooltipStyle} formatter={v=>`${number(v)}%`}/><Line type="monotone" dataKey="food_cost" name="Food cost" stroke="#173F35" strokeWidth={2.5} dot={{r:3,fill:'#D47B59'}} activeDot={{r:5}}/><Line type="monotone" dataKey="target" name="30% target" stroke="#E7B85C" strokeDasharray="5 5" dot={false}/></LineChart></ResponsiveContainer></div> : <div className="empty-mini">Add recipes to see food cost analysis.</div>}
      </SectionCard>
      <SectionCard title="Recently added ingredients" subtitle="Latest additions to the ingredient register" action={<button className="text-action" onClick={()=>onNavigate('inventory')}>Open inventory <ArrowRight size={14}/></button>}>
        {(data?.recent_ingredients||[]).length ? <div className="watchlist">{data.recent_ingredients.map(item=><div className="watch-row" key={item.id}><div className="watch-avatar">{item.name.slice(0,1)}</div><div className="watch-main"><strong>{item.name}</strong><small>{item.item_code} · {item.category}</small></div><div className="watch-qty"><strong>{number(item.quantity)} {item.unit}</strong><StatusPill status={item.status}/></div></div>)}</div> : <div className="healthy-state"><strong>No ingredients added yet</strong></div>}
      </SectionCard>
    </div>
    <SectionCard title="Recent purchase orders" subtitle="Latest procurement activity" action={<button className="text-action" onClick={()=>onNavigate('purchases')}>All purchase orders <ArrowRight size={14}/></button>}><Table columns={orderColumns} rows={data?.recent_orders||[]} emptyTitle="No purchase orders yet"/></SectionCard>
    <div className="activity-panel"><div className="activity-panel-head"><div><h3>Recent activity</h3><p>A live trail of operational changes across your workspace.</p></div><button className="text-action" onClick={()=>onNavigate('reports')}>View activity <ArrowUpRight size={14}/></button></div><div className="activity-feed">{(data?.recent_activity||data?.recent||[]).slice(0,6).map((x,i)=><div className="activity-item" key={x.id||i}><span className="activity-dot"/><div><strong>{x.action}</strong><small>{x.entity} · {x.details}</small></div><time>{new Date(x.time).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</time></div>)}</div></div>
  </div>;
}
