import React from 'react';
import {
  LayoutDashboard, Boxes, Calculator, Sparkles, ShoppingCart, Truck,
  ClipboardCheck, Trash2, ChartNoAxesCombined, Settings, ChefHat, PanelLeftClose, ReceiptText,
} from 'lucide-react';

export const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { id: 'inventory', label: 'Inventory management', icon: Boxes, group: 'OPERATIONS' },
  { id: 'recipes', label: 'Recipe & cost calculator', icon: Calculator, group: 'OPERATIONS' },
  { id: 'menus', label: 'AI Menu Studio', icon: Sparkles, group: 'OPERATIONS' },
  { id: 'purchases', label: 'Purchase management', icon: ShoppingCart, group: 'OPERATIONS' },
  { id: 'billing', label: 'Daily billing updates', icon: ReceiptText, group: 'OPERATIONS' },
  { id: 'suppliers', label: 'Supplier management', icon: Truck, group: 'OPERATIONS' },
  { id: 'sops', label: 'SOP management', icon: ClipboardCheck, group: 'CONTROL' },
  { id: 'waste', label: 'Waste management', icon: Trash2, group: 'CONTROL' },
  { id: 'reports', label: 'Reports & analytics', icon: ChartNoAxesCombined, group: 'INSIGHTS' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'SYSTEM' },
];

export default function Sidebar({ active, onNavigate, collapsed, onToggle, user, mobileOpen, onClose }) {
  const groups = ['WORKSPACE', 'OPERATIONS', 'CONTROL', 'INSIGHTS', 'SYSTEM'];
  return <>
    {mobileOpen && <button aria-label="Close navigation" className="sidebar-scrim" onClick={onClose} />}
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand-lockup">
        <div className="brand-mark"><ChefHat size={21} strokeWidth={2.2} /></div>
        {!collapsed && <div className="brand-copy"><span>FoodOps<span className="brand-light"> ERP</span></span><small>FOOD OPERATIONS PLATFORM</small></div>}
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Collapse sidebar"><PanelLeftClose size={17} /></button>
      </div>
      <div className="outlet-chip"><div className="outlet-dot" />{!collapsed && <><span>Main Outlet</span><span className="outlet-chevron">⌄</span></>}</div>
      <nav className="nav-stack">
        {groups.map(group => {
          const links = navigation.filter(x => x.group === group);
          return <div className="nav-group" key={group}>
            {!collapsed && <div className="nav-group-label">{group}</div>}
            {links.map(item => <button key={item.id} className={`nav-link ${active === item.id ? 'nav-link-active' : ''}`} onClick={() => { onNavigate(item.id); onClose?.(); }} title={collapsed ? item.label : undefined}>
              <item.icon size={18} strokeWidth={1.9} /><span>{item.label}</span>{active === item.id && <i />}
            </button>)}
          </div>;
        })}
      </nav>
      {!collapsed && <div className="sidebar-bottom-card">
        <div className="sidebar-bottom-icon"><Sparkles size={16} /></div>
        <strong>Operational clarity</strong>
        <p>One workspace for smarter food operations.</p>
        <div className="sidebar-progress"><span /></div>
        <small>FOODOPS WORKSPACE · ACTIVE</small>
      </div>}
      <div className="sidebar-user">
        <div className="avatar avatar-sidebar">{(user?.name || 'A').split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
        {!collapsed && <div className="sidebar-user-copy"><strong>{user?.name || 'Team member'}</strong><small>{user?.role || 'Operations'}</small></div>}
        {!collapsed && <div className="user-online" />}
      </div>
    </aside>
  </>;
}
