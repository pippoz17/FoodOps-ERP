import React, { useEffect, useRef, useState } from 'react';
import {
  Bell, Search, ChevronDown, MapPin, LogOut, UserRound, Menu as MenuIcon,
  Command, Check, AlertTriangle, Info, CheckCircle2, X,
} from 'lucide-react';
import Sidebar, { navigation } from './components/Sidebar';
import { api } from './services';
import { Button } from './components/UI';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import RecipesPage from './pages/RecipesPage';
import MenusPage from './pages/MenusPage';
import PurchasesPage from './pages/PurchasesPage';
import DailyBillingPage from './pages/DailyBillingPage';
import SuppliersPage from './pages/SuppliersPage';
import SOPPage from './pages/SOPPage';
import WastePage from './pages/WastePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function Toasts({ items, dismiss }) {
  return <div className="toast-stack">{items.map(t => <div key={t.id} className={`toast toast-${t.type}`}><div>{t.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}</div><span>{t.message}</span><button onClick={() => dismiss(t.id)}><X size={14} /></button></div>)}</div>;
}

export default function App() {
  const [user, setUser] = useState(null); const [authLoading, setAuthLoading] = useState(true); const [loginBusy, setLoginBusy] = useState(false); const [loginError, setLoginError] = useState('');
  const [active, setActive] = useState('overview'); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null); const [dashboardLoading, setDashboardLoading] = useState(false);
  const [toasts, setToasts] = useState([]); const [search, setSearch] = useState(''); const [searchResults, setSearchResults] = useState([]); const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); const [notificationOpen, setNotificationOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false);
  const searchWrap = useRef(null); const notifWrap = useRef(null); const profileWrap = useRef(null);

  const toast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4200);
  };
  const dismissToast = id => setToasts(prev => prev.filter(x => x.id !== id));
  const refreshDashboard = async () => {
    setDashboardLoading(true);
    try { setDashboard(await api.get('/dashboard')); }
    catch (e) { if (!e.message.includes('sign in')) toast(e.message, 'error'); }
    finally { setDashboardLoading(false); }
  };
  const refreshNotifications = async () => { try { setNotifications(await api.get('/notifications')); } catch { /* session may have expired */ } };

  useEffect(() => {
    api.get('/auth/me').then(result => setUser(result.user)).catch(() => setUser(null)).finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    if (user && active === 'overview') refreshDashboard();
    if (user) refreshNotifications();
  }, [user, active]);
  useEffect(() => {
    if (search.trim().length < 2) { setSearchResults([]); return; }
    const timer = window.setTimeout(() => api.post('/global-search', { query: search }).then(setSearchResults).catch(() => setSearchResults([])), 220);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const close = e => {
      if (searchWrap.current && !searchWrap.current.contains(e.target)) setSearchOpen(false);
      if (notifWrap.current && !notifWrap.current.contains(e.target)) setNotificationOpen(false);
      if (profileWrap.current && !profileWrap.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogin = async credentials => {
    setLoginBusy(true); setLoginError('');
    try { const result = await api.post('/auth/login', credentials); setUser(result.user); setActive('overview'); toast(`Welcome back, ${result.user.name.split(' ')[0]}.`); }
    catch (e) { setLoginError(e.message); }
    finally { setLoginBusy(false); }
  };
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* continue clearing local session */ }
    setUser(null); setDashboard(null); setActive('overview'); setProfileOpen(false); toast('You have signed out.');
  };
  const navigate = id => { setActive(id); setSearch(''); setSearchOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const markRead = async id => { try { await api.post(`/notifications/${id}/read`); setNotifications(prev => prev.map(x => x.id === id ? { ...x, is_read: true } : x)); } catch (e) { toast(e.message, 'error'); } };
  const openSearchResult = result => {
    const mapping = { Inventory: 'inventory', Recipe: 'recipes', Supplier: 'suppliers', 'Purchase order': 'purchases', Bill: 'billing' };
    navigate(mapping[result.type] || 'overview');
  };

  if (authLoading) return <div className="app-loading"><div className="loading-brand"><span>F</span></div><div className="loading-bar" /></div>;
  if (!user) return <><LoginPage onLogin={handleLogin} busy={loginBusy} error={loginError} /><Toasts items={toasts} dismiss={dismissToast} /></>;

  const currentPage = navigation.find(x => x.id === active);
  const unread = notifications.filter(x => !x.is_read).length;
  const page = (() => {
    switch (active) {
      case 'overview': return <Dashboard data={dashboard} onNavigate={navigate} loading={dashboardLoading} user={user} />;
      case 'inventory': return <InventoryPage toast={toast} />;
      case 'recipes': return <RecipesPage toast={toast} />;
      case 'menus': return <MenusPage toast={toast} />;
      case 'purchases': return <PurchasesPage toast={toast} />;
      case 'billing': return <DailyBillingPage toast={toast} user={user} />;
      case 'suppliers': return <SuppliersPage toast={toast} />;
      case 'sops': return <SOPPage toast={toast} user={user} />;
      case 'waste': return <WastePage toast={toast} />;
      case 'reports': return <ReportsPage toast={toast} />;
      case 'settings': return <SettingsPage toast={toast} user={user} />;
      default: return <Dashboard data={dashboard} onNavigate={navigate} loading={dashboardLoading} user={user} />;
    }
  })();

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(x => !x)} user={user} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className={`main-shell ${collapsed ? 'main-shell-wide' : ''}`}>
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuIcon size={20} /></button><div className="breadcrumb"><span>FoodOps</span><i>/</i><b>{currentPage?.label || 'Overview'}</b></div></div>
        <div className="topbar-right">
          <div className="global-search-wrap" ref={searchWrap}><div className="global-search"><Search size={16} /><input value={search} onFocus={() => setSearchOpen(true)} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." /><kbd><Command size={10} /> K</kbd></div>
            {searchOpen && search.length >= 2 && <div className="search-results-popover">{searchResults.length ? searchResults.map((result, i) => <button key={`${result.type}-${i}`} onClick={() => openSearchResult(result)}><span>{result.type}</span><strong>{result.label}</strong><small>{result.detail}</small></button>) : <div className="search-empty">No matching records found.</div>}</div>}
          </div>
          <div className="topbar-divider" />
          <div className="topbar-outlet"><MapPin size={15} /><div><small>LOCATION</small><strong>Main Outlet</strong></div><ChevronDown size={14} /></div>
          <div className="topbar-divider" />
          <div className="popover-anchor" ref={notifWrap}><button className={`topbar-icon-button ${notificationOpen ? 'topbar-icon-active' : ''}`} onClick={() => { setNotificationOpen(x => !x); setProfileOpen(false); }} aria-label="Notifications"><Bell size={18} />{unread > 0 && <i>{unread > 9 ? '9+' : unread}</i>}</button>
            {notificationOpen && <div className="notification-popover"><div className="popover-heading"><div><strong>Notifications</strong><small>{unread} unread alerts</small></div><button onClick={refreshNotifications}>Refresh</button></div><div className="notification-list">{notifications.length ? notifications.map(n => <div className={`notification-item ${n.is_read ? 'notification-read' : ''}`} key={n.id}><div className={`notification-icon notification-${n.kind}`}>{n.kind === 'danger' || n.kind === 'warning' ? <AlertTriangle size={15} /> : n.kind === 'success' ? <CheckCircle2 size={15} /> : <Info size={15} />}</div><div><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>{!n.is_read && <button className="mark-read" onClick={() => markRead(n.id)} aria-label="Mark as read"><Check size={14} /></button>}</div>) : <div className="search-empty">You’re all caught up.</div>}</div></div>}
          </div>
          <div className="popover-anchor" ref={profileWrap}><button className="profile-trigger" onClick={() => { setProfileOpen(x => !x); setNotificationOpen(false); }}><div className="avatar topbar-avatar">{user.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</div><div className="profile-trigger-copy"><strong>{user.name}</strong><small>{user.role}</small></div><ChevronDown size={14} /></button>
            {profileOpen && <div className="profile-popover"><div className="profile-popover-head"><div className="avatar topbar-avatar">{user.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</div><div><strong>{user.name}</strong><small>{user.email}</small></div></div><button onClick={() => { navigate('settings'); setProfileOpen(false); }}><UserRound size={15} />Account & settings</button><button className="logout-action" onClick={logout}><LogOut size={15} />Sign out</button></div>}
          </div>
        </div>
      </header>
      <main className="main-content">{page}<footer className="app-footer"><span>© 2026 FoodOps ERP</span><span>MANAGE EVERY INGREDIENT. CONTROL EVERY COST.</span><span>WORKSPACE · {user.role.toUpperCase()}</span></footer></main>
    </div>
    <Toasts items={toasts} dismiss={dismissToast} />
  </div>;
}
