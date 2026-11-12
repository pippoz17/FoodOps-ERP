import React from 'react';
import { X, Search, Plus, ChevronDown, ArrowUpRight, ArrowDownRight, Inbox } from 'lucide-react';

export function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>;
}

export function Button({ children, variant = 'primary', size = 'normal', className = '', ...props }) {
  return <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>{children}</button>;
}

export function MetricCard({ label, value, caption, icon: Icon, tone = 'green', trend, trendLabel }) {
  return <div className="metric-card">
    <div className="metric-top"><span>{label}</span><div className={`metric-icon metric-${tone}`}><Icon size={17} /></div></div>
    <div className="metric-value">{value}</div>
    <div className="metric-bottom">{trend !== undefined && <span className={`metric-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>{trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(trend)}%</span>}<span>{trendLabel || caption}</span></div>
  </div>;
}

export function StatusPill({ status }) {
  const key = String(status || 'Unknown').toLowerCase().replaceAll(' ', '-');
  let tone = 'neutral';
  if (['in-stock', 'completed', 'active', 'approved', 'ordered', 'saved'].includes(key)) tone = 'success';
  if (['low-stock', 'expiring-soon', 'pending', 'partially-received', 'draft'].includes(key)) tone = 'warning';
  if (['out-of-stock', 'expired', 'cancelled', 'inactive', 'danger'].includes(key)) tone = 'danger';
  return <span className={`status-pill status-${tone}`}><i />{status || 'Unknown'}</span>;
}

export function SearchField({ value, onChange, placeholder = 'Search...' }) {
  return <div className="search-field"><Search size={16} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>;
}

export function EmptyState({ title = 'Nothing here yet', description = 'Create your first record to get started.', action }) {
  return <div className="empty-state"><div className="empty-icon"><Inbox size={23} /></div><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function Modal({ open, title, description, onClose, children, wide = false }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="modal-content">{children}</div>
    </div>
  </div>;
}

export function Field({ label, children, hint, required }) {
  return <label className="form-field"><span>{label}{required && <b> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function TextInput(props) { return <input className="form-control" {...props} />; }
export function SelectInput({ children, ...props }) { return <div className="select-wrap"><select className="form-control" {...props}>{children}</select><ChevronDown size={15} /></div>; }
export function TextArea(props) { return <textarea className="form-control form-textarea" {...props} />; }

export function Table({ columns, rows, emptyTitle, emptyDescription, onRowClick }) {
  if (!rows?.length) return <EmptyState title={emptyTitle || 'No records found'} description={emptyDescription || 'Try adjusting your search or add a new record.'} />;
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map(col => <th key={col.key} className={col.align === 'right' ? 'text-right' : ''}>{col.label}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id ?? index} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'table-row-clickable' : ''}>
      {columns.map(col => <td key={col.key} className={col.align === 'right' ? 'text-right' : ''}>{col.render ? col.render(row) : (row[col.key] ?? '—')}</td>)}
    </tr>)}</tbody></table></div>;
}

export function SectionCard({ title, subtitle, action, children, className = '' }) {
  return <section className={`section-card ${className}`}><div className="section-card-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}

export function AddButton({ children = 'Add new', ...props }) { return <Button {...props}><Plus size={16} />{children}</Button>; }
