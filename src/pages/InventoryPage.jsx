import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Download, History, Plus, RefreshCw, SlidersHorizontal, Pencil, Trash2, ArrowDownUp, PackageOpen, Layers } from 'lucide-react';
import { api, money, number, shortDate } from '../services';
import { PageHeading, Button, AddButton, StatusPill, SearchField, Table, Modal, Field, TextInput, TextArea, SelectInput, SectionCard, EmptyState } from '../components/UI';

const emptyItem = { item_code: '', name: '', category: 'Vegetables', unit: 'kg', quantity: 0, min_stock: 5, reorder_quantity: 10, purchase_price: 0, supplier_id: '', batch_number: '', expiry_date: '' };

export default function InventoryPage({ toast }) {
  const [items, setItems] = useState([]); const [suppliers, setSuppliers] = useState([]); const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState(''); const [category, setCategory] = useState('All categories'); const [tab, setTab] = useState('items');
  const [modal, setModal] = useState(false); const [adjustModal, setAdjustModal] = useState(null); const [batchesModal, setBatchesModal] = useState(null); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem); const [adjustment, setAdjustment] = useState({ quantity: '', reason: '' }); const [busy, setBusy] = useState(false);
  const load = async () => { try { const [i, s, m] = await Promise.all([api.get('/inventory'), api.get('/suppliers'), api.get('/inventory/movements')]); setItems(i); setSuppliers(s); setMovements(m); } catch (e) { toast(e.message, 'error'); } };
  useEffect(() => { load(); }, []);
  const categories = ['All categories', ...new Set(items.map(x => x.category))];
  const filtered = useMemo(() => items.filter(x => (category === 'All categories' || x.category === category) && `${x.name} ${x.item_code}`.toLowerCase().includes(search.toLowerCase())), [items, category, search]);
  const openNew = () => { setEditing(null); setForm(emptyItem); setModal(true); };
  const openEdit = item => { setEditing(item); setForm({ ...item, supplier_id: item.supplier_id || '' }); setModal(true); };
  const save = async e => { e.preventDefault(); setBusy(true); try { const body = { ...form, supplier_id: form.supplier_id || null }; if (editing) await api.put(`/inventory/${editing.id}`, body); else await api.post('/inventory', body); toast(editing ? 'Inventory item updated.' : 'Inventory item created.'); setModal(false); await load(); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); } };
  const adjust = async e => { e.preventDefault(); setBusy(true); try { await api.post(`/inventory/${adjustModal.id}/adjust`, { quantity: Number(adjustment.quantity), reason: adjustment.reason }); toast('Stock movement recorded.'); setAdjustModal(null); setAdjustment({ quantity: '', reason: '' }); await load(); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); } };
  const archive = async item => { if (!window.confirm(`Archive ${item.name}?`)) return; try { await api.delete(`/inventory/${item.id}`); toast('Inventory item archived.'); load(); } catch (e) { toast(e.message, 'error'); } };
  const columns = [
    { key: 'name', label: 'INGREDIENT', render: r => <div className="item-cell"><div className="item-thumb">{r.name.slice(0, 1)}</div><div><strong>{r.name}</strong><small>{r.item_code} · {r.category}</small></div></div> },
    { key: 'quantity', label: 'ON HAND', render: r => <div><b>{number(r.quantity)} {r.unit}</b><small className="cell-sub">Min. {number(r.min_stock)} {r.unit} · {r.batch_count || 0} batches</small></div> },
    { key: 'purchase_price', label: 'UNIT COST', render: r => money(r.purchase_price) },
    { key: 'inventory_value', label: 'STOCK VALUE', render: r => <b>{money(r.inventory_value)}</b> },
    { key: 'supplier_name', label: 'SUPPLIER' },
    { key: 'expiry_date', label: 'EXPIRY', render: r => <span className={r.status === 'Expiring Soon' || r.status === 'Expired' ? 'date-warning' : ''}>{shortDate(r.expiry_date)}</span> },
    { key: 'status', label: 'STATUS', render: r => <StatusPill status={r.status} /> },
    { key: 'actions', label: '', align: 'right', render: r => <div className="row-actions"><button title="View batches" onClick={e => { e.stopPropagation(); setBatchesModal(r); }}><Layers size={15} /></button><button title="Adjust stock" onClick={e => { e.stopPropagation(); setAdjustModal(r); }}><ArrowDownUp size={15} /></button><button title="Edit" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil size={15} /></button><button title="Archive" onClick={e => { e.stopPropagation(); archive(r); }}><Trash2 size={15} /></button></div> },
  ];
  const movementColumns = [
    { key: 'item', label: 'INGREDIENT', render: r => <strong>{r.item}</strong> },
    { key: 'type', label: 'MOVEMENT', render: r => <span className="movement-type">{r.type}</span> },
    { key: 'quantity', label: 'QUANTITY', render: r => <b className={r.quantity < 0 ? 'negative-value' : 'positive-value'}>{r.quantity > 0 ? '+' : ''}{number(r.quantity)} {r.unit}</b> },
    { key: 'before', label: 'BEFORE', render: r => `${number(r.before)} ${r.unit}` },
    { key: 'after', label: 'AFTER', render: r => `${number(r.after)} ${r.unit}` },
    { key: 'reason', label: 'REFERENCE / REASON' },
    { key: 'date', label: 'DATE', render: r => new Date(r.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) },
  ];
  const stockValue = items.reduce((sum, x) => sum + x.inventory_value, 0);
  return <div className="page-content">
    <PageHeading eyebrow="OPERATIONS / INVENTORY" title="Inventory management" description="Track ingredient levels, batch details and stock movements across your outlet." actions={<><Button variant="outline" onClick={() => api.download('/reports/inventory.csv', 'foodops-inventory.csv').catch(e => toast(e.message, 'error'))}><Download size={15} />Export CSV</Button><AddButton onClick={openNew}>Add ingredient</AddButton></>} />
    <div className="inline-stat-row"><div><span>ACTIVE INGREDIENTS</span><b>{items.length}</b></div><div><span>TOTAL STOCK VALUE</span><b>{money(stockValue)}</b></div><div><span>LOW / OUT OF STOCK</span><b className="text-amber">{items.filter(x => ['Low Stock', 'Out of Stock'].includes(x.status)).length}</b></div><div><span>EXPIRY ALERTS</span><b className="text-red">{items.filter(x => ['Expiring Soon', 'Expired'].includes(x.status)).length}</b></div></div>
    <div className="tabs-row"><button className={tab === 'items' ? 'tab-active' : ''} onClick={() => setTab('items')}><PackageOpen size={15} />All ingredients <span>{items.length}</span></button><button className={tab === 'movements' ? 'tab-active' : ''} onClick={() => setTab('movements')}><History size={15} />Stock movement history <span>{movements.length}</span></button><div className="tabs-spacer" /><button className="icon-button" onClick={load} title="Refresh"><RefreshCw size={16} /></button></div>
    {tab === 'items' ? <SectionCard title="Ingredient register" subtitle="Current inventory balances and replenishment information" className="flush-section">
      <div className="table-toolbar"><SearchField value={search} onChange={setSearch} placeholder="Search ingredient or item code..." /><div className="filter-control"><SlidersHorizontal size={15} /><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div><span className="results-count">{filtered.length} records</span></div>
      <Table columns={columns} rows={filtered} emptyTitle="No ingredients match" emptyDescription="Try a different search or add a new ingredient." />
    </SectionCard> : <SectionCard title="Stock movement history" subtitle="Every stock increase and deduction is recorded with a reference." className="flush-section"><div className="table-toolbar"><span className="results-count">Latest {movements.length} movements</span></div><Table columns={movementColumns} rows={movements} emptyTitle="No stock movements" /></SectionCard>}
    <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit ingredient' : 'Add ingredient'} description="Maintain the item master and set replenishment thresholds." wide>
      <form onSubmit={save}><div className="form-grid">
        <Field label="Item name" required><TextInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Basmati Rice" /></Field>
        <Field label="Item code"><TextInput value={form.item_code} onChange={e => setForm({ ...form, item_code: e.target.value })} placeholder="Auto-generated when blank" disabled={!!editing} /></Field>
        <Field label="Category" required><SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{['Vegetables', 'Grains', 'Protein', 'Dairy', 'Pantry', 'Bakery', 'Beverages', 'Frozen', 'Other'].map(x => <option key={x}>{x}</option>)}</SelectInput></Field>
        <Field label="Unit of measurement" required><SelectInput value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>{['kg', 'g', 'l', 'ml', 'pcs', 'pack'].map(x => <option key={x}>{x}</option>)}</SelectInput></Field>
        {!editing && <Field label="Opening quantity"><TextInput type="number" min="0" step="0.001" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></Field>}
        <Field label="Minimum stock level"><TextInput type="number" min="0" step="0.001" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} /></Field>
        <Field label="Reorder quantity"><TextInput type="number" min="0" step="0.001" value={form.reorder_quantity} onChange={e => setForm({ ...form, reorder_quantity: e.target.value })} /></Field>
        <Field label="Purchase price per unit (₹)"><TextInput type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} /></Field>
        <Field label="Preferred supplier"><SelectInput value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}><option value="">Not assigned</option>{suppliers.map(s => <option value={s.id} key={s.id}>{s.company_name}</option>)}</SelectInput></Field>
        <Field label="Batch number"><TextInput value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} placeholder="e.g. B-24081" /></Field>
        <Field label="Expiry date"><TextInput type="date" value={form.expiry_date || ''} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></Field>
      </div><div className="modal-footer"><Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create ingredient'}</Button></div></form>
    </Modal>
    <Modal open={!!batchesModal} onClose={() => setBatchesModal(null)} title="Batch register" description={batchesModal ? `${batchesModal.name} · ${batchesModal.batch_count || 0} active batches` : ''} wide>
      {batchesModal?.batches?.length ? <Table columns={[{ key: 'batch_number', label: 'BATCH / LOT NUMBER' }, { key: 'quantity', label: 'AVAILABLE QUANTITY', render: b => `${number(b.quantity)} ${batchesModal.unit}` }, { key: 'expiry_date', label: 'EXPIRY DATE', render: b => shortDate(b.expiry_date) }, { key: 'purchase_price', label: 'UNIT PURCHASE PRICE', render: b => money(b.purchase_price) }, { key: 'received_date', label: 'RECEIVED', render: b => shortDate(b.received_date) }]} rows={batchesModal.batches} /> : <EmptyState title="No active batch balances" description="Batch details are created when opening stock, stock receipts or positive adjustments are posted." />}
      <div className="modal-footer"><Button variant="ghost" type="button" onClick={() => setBatchesModal(null)}>Close</Button></div>
    </Modal>
    <Modal open={!!adjustModal} onClose={() => setAdjustModal(null)} title="Adjust stock balance" description={adjustModal ? `${adjustModal.name} · Current balance ${number(adjustModal.quantity)} ${adjustModal.unit}` : ''}>
      <form onSubmit={adjust}><div className="adjust-direction-note">Use a positive number to receive stock or a negative number to record a deduction.</div><Field label={`Adjustment quantity (${adjustModal?.unit || ''})`} required><TextInput type="number" step="0.001" value={adjustment.quantity} onChange={e => setAdjustment({ ...adjustment, quantity: e.target.value })} required placeholder="e.g. 5 or -2" /></Field><Field label="Reason / reference" required><TextArea value={adjustment.reason} onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })} rows="3" required placeholder="Reason for the stock adjustment" /></Field><div className="modal-footer"><Button variant="ghost" type="button" onClick={() => setAdjustModal(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Recording…' : 'Record movement'}</Button></div></form>
    </Modal>
  </div>;
}
