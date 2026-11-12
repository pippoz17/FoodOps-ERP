import React, { useMemo, useState } from 'react';
import { CalendarDays, Download, Plus, Search, ReceiptText, IndianRupee, Wallet, Clock3, Pencil, Trash2, X, Save, FileSpreadsheet, CircleCheck, AlertCircle } from 'lucide-react';
import { PageHeading, Button, SectionCard, StatusPill, EmptyState } from '../components/UI';

const STORE = 'foodops_daily_billing_v1';
const SEED_FLAG = 'foodops_daily_billing_sample_seeded_v1';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value) || 0);
const sampleBills = () => {
  const d = today();
  const now = Date.now();
  const samples = [
    ['BILL-SAMPLE-001','Walk-in Customer','Lunch combo - 2 meals',580,29,'UPI','Paid','UPI-782451'],
    ['BILL-SAMPLE-002','Priya Nair','Paneer wrap + fresh lime',345,17.25,'Card','Paid','POS-CARD-1042'],
    ['BILL-SAMPLE-003','Arjun Kumar','Family dinner takeaway',1240,62,'Cash','Paid',''],
    ['BILL-SAMPLE-004','Meera Stores','Office lunch order - 8 meals',2160,108,'UPI','Partially paid','UPI-782489'],
    ['BILL-SAMPLE-005','Walk-in Customer','Coffee and bakery items',265,13.25,'Cash','Paid',''],
    ['BILL-SAMPLE-006','Northstar Design Studio','Team refreshments',890,44.5,'Bank transfer','Unpaid','INV-PO-031'],
    ['BILL-SAMPLE-007','Rahul Menon','Chicken burger meal',425,21.25,'UPI','Paid','UPI-782512'],
    ['BILL-SAMPLE-008','Walk-in Customer','Evening snacks',310,15.5,'Cash','Paid',''],
  ];
  return samples.map((x,i) => ({
    id: `foodops-sample-bill-${i+1}`, billNo:x[0], billDate:d, customer:x[1],
    description:x[2], amount:x[3], tax:x[4], paymentMode:x[5], status:x[6],
    reference:x[7], notes:'Illustrative sample record — replace or delete as required.',
    createdAt:new Date(now-(samples.length-i)*7*60000).toISOString(),
    updatedAt:new Date(now-(samples.length-i)*7*60000).toISOString(),
    createdBy:'FoodOps Sample Data', isSample:true
  }));
};
const loadBills = () => {
  try {
    const saved = localStorage.getItem(STORE);
    const existing = saved === null ? null : JSON.parse(saved);
    if (Array.isArray(existing) && existing.length) {
      localStorage.setItem(SEED_FLAG, '1');
      return existing;
    }
    if (localStorage.getItem(SEED_FLAG) === '1') return Array.isArray(existing) ? existing : [];
    const seeded = sampleBills();
    localStorage.setItem(STORE, JSON.stringify(seeded));
    localStorage.setItem(SEED_FLAG, '1');
    return seeded;
  } catch { return sampleBills(); }
};
const blank = () => ({ billNo: '', billDate: today(), customer: '', description: '', amount: '', tax: '0', paymentMode: 'UPI', status: 'Paid', reference: '', notes: '' });
const makeBillNo = () => `BILL-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

export default function DailyBillingPage({ toast, user }) {
  const [bills, setBills] = useState(loadBills);
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());

  const persist = next => { setBills(next); localStorage.setItem(STORE, JSON.stringify(next)); };
  const filtered = useMemo(() => bills.filter(b => b.billDate === date && (statusFilter === 'All' || b.status === statusFilter) && `${b.billNo} ${b.customer} ${b.description} ${b.reference}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => b.createdAt.localeCompare(a.createdAt)), [bills,date,statusFilter,query]);
  const dayBills = bills.filter(b => b.billDate === date);
  const total = dayBills.reduce((s,b) => s + Number(b.amount || 0) + Number(b.tax || 0), 0);
  const collected = dayBills.filter(b => b.status === 'Paid').reduce((s,b) => s + Number(b.amount || 0) + Number(b.tax || 0), 0);
  const pending = dayBills.filter(b => b.status !== 'Paid').reduce((s,b) => s + Number(b.amount || 0) + Number(b.tax || 0), 0);
  const openNew = () => { setEditing(null); setForm({ ...blank(), billNo: makeBillNo() }); setModal(true); };
  const openEdit = bill => { setEditing(bill.id); setForm({ ...bill }); setModal(true); };
  const save = e => {
    e.preventDefault();
    const amount = Number(form.amount), tax = Number(form.tax || 0);
    if (!form.billNo.trim() || !form.customer.trim() || !form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(tax) || tax < 0) { toast('Enter a bill number, customer, description and valid amount.', 'error'); return; }
    const record = { ...form, amount, tax, updatedAt: new Date().toISOString(), createdAt: editing ? (bills.find(b => b.id === editing)?.createdAt || new Date().toISOString()) : new Date().toISOString(), createdBy: editing ? (bills.find(b => b.id === editing)?.createdBy || user?.name || 'Staff') : (user?.name || 'Staff') };
    const next = editing ? bills.map(b => b.id === editing ? { ...record, id: editing } : b) : [{ ...record, id: crypto.randomUUID() }, ...bills];
    persist(next); setModal(false); toast(editing ? 'Billing record updated.' : 'Daily bill recorded.');
  };
  const remove = id => { if (!window.confirm('Delete this billing record? This cannot be undone.')) return; persist(bills.filter(b => b.id !== id)); toast('Billing record deleted.'); };
  const exportCsv = () => {
    const rows = [['Bill number','Date','Customer','Description','Amount','Tax','Total','Payment mode','Status','Reference','Notes'], ...filtered.map(b => [b.billNo,b.billDate,b.customer,b.description,b.amount,b.tax,Number(b.amount)+Number(b.tax),b.paymentMode,b.status,b.reference,b.notes])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = `foodops-billing-${date}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="page-content">
    <PageHeading eyebrow="OPERATIONS / REVENUE CONTROL" title="Daily billing updates" description="Record bills generated at the counter, reconcile collections and keep a searchable daily billing register."
      actions={<><label className="db-date"><CalendarDays size={15}/><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><Button variant="outline" onClick={exportCsv}><Download size={14}/>Export CSV</Button><Button onClick={openNew}><Plus size={15}/>Record a bill</Button></>} />
    <div className="db-note"><ReceiptText size={16}/><span><b>Billing register, not a checkout terminal.</b> Enter bills issued through your existing counter/POS or manual billing process. This module does not create orders or deduct recipe ingredients from inventory. First-time users see illustrative sample bills that can be edited or deleted.</span></div>
    <div className="db-metrics">
      <div className="db-metric"><span> BILLS RECORDED </span><div><strong>{dayBills.length}</strong><i><ReceiptText size={17}/></i></div><small>For {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</small></div>
      <div className="db-metric"><span> GROSS BILLING </span><div><strong>{money(total)}</strong><i><IndianRupee size={17}/></i></div><small>Includes entered tax</small></div>
      <div className="db-metric"><span> AMOUNT COLLECTED </span><div><strong>{money(collected)}</strong><i className="db-icon-green"><CircleCheck size={17}/></i></div><small>Marked as paid</small></div>
      <div className="db-metric"><span> PENDING COLLECTION </span><div><strong>{money(pending)}</strong><i className="db-icon-amber"><Clock3 size={17}/></i></div><small>Partial and unpaid bills</small></div>
    </div>
    <SectionCard title="Billing register" subtitle="Daily transaction log with editable entries and payment status" className="flush-section" action={<span className="db-record-count">{filtered.length} records shown</span>}>
      <div className="db-toolbar"><div className="search-field"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search bill, customer or reference..."/></div><label className="db-filter"><span>Status</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Paid</option><option>Partially paid</option><option>Unpaid</option></select></label></div>
      {filtered.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>BILL / CUSTOMER</th><th>DESCRIPTION</th><th>PAYMENT</th><th>STATUS</th><th className="text-right">TOTAL</th><th className="text-right">ACTIONS</th></tr></thead><tbody>{filtered.map(b=><tr key={b.id}><td><b>{b.billNo}</b><small className="db-sub">{b.customer}</small></td><td>{b.description}</td><td><span className="db-payment">{b.paymentMode}</span>{b.reference && <small className="db-sub">Ref: {b.reference}</small>}</td><td><StatusPill status={b.status}/></td><td className="text-right"><b>{money(Number(b.amount)+Number(b.tax))}</b><small className="db-sub">Base {money(b.amount)} + tax {money(b.tax)}</small></td><td><div className="row-actions"><button title="Edit record" onClick={()=>openEdit(b)}><Pencil size={14}/></button><button title="Delete record" onClick={()=>remove(b.id)}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No billing records for this view" description="Record a bill to start building your daily billing register." action={<Button onClick={openNew}><Plus size={14}/>Record first bill</Button>}/>}
    </SectionCard>
    <div className="db-footnote"><Wallet size={15}/><span>Records are saved in this browser on this device. For shared billing across multiple terminals or staff devices, FoodOps will need a connected backend and central database.</span></div>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal-panel modal-wide db-modal"><div className="modal-head"><div><h2>{editing?'Update billing record':'Record a daily bill'}</h2><p>Capture details from a bill already issued to a customer.</p></div><button className="icon-button" onClick={()=>setModal(false)}><X size={18}/></button></div><form onSubmit={save} className="modal-content"><div className="db-form-grid">
      <label className="form-field"><span>Bill number *</span><input className="form-control" value={form.billNo} onChange={e=>setForm({...form,billNo:e.target.value})} required/></label>
      <label className="form-field"><span>Bill date *</span><input className="form-control" type="date" value={form.billDate} onChange={e=>setForm({...form,billDate:e.target.value})} required/></label>
      <label className="form-field"><span>Customer / account name *</span><input className="form-control" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} placeholder="Walk-in customer" required/></label>
      <label className="form-field"><span>Bill description *</span><input className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Lunch order / catering / takeaway" required/></label>
      <label className="form-field"><span>Bill amount (₹) *</span><input className="form-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></label>
      <label className="form-field"><span>Tax amount (₹)</span><input className="form-control" type="number" min="0" step="0.01" value={form.tax} onChange={e=>setForm({...form,tax:e.target.value})}/></label>
      <label className="form-field"><span>Payment mode</span><select className="form-control" value={form.paymentMode} onChange={e=>setForm({...form,paymentMode:e.target.value})}><option>UPI</option><option>Cash</option><option>Card</option><option>Bank transfer</option><option>Credit</option><option>Other</option></select></label>
      <label className="form-field"><span>Payment status</span><select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Paid</option><option>Partially paid</option><option>Unpaid</option></select></label>
      <label className="form-field"><span>Transaction reference</span><input className="form-control" value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})} placeholder="UPI / card reference (optional)"/></label>
      <label className="form-field"><span>Notes</span><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional remarks"/></label>
      </div><div className="db-total-preview"><span>Bill total</span><strong>{money(Number(form.amount||0)+Number(form.tax||0))}</strong></div><div className="db-form-actions"><Button type="button" variant="outline" onClick={()=>setModal(false)}>Cancel</Button><Button type="submit"><Save size={14}/>{editing?'Save changes':'Save billing record'}</Button></div></form></div></div>}
  </div>;
}
