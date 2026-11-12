import React, { useState } from 'react';
import { ChefHat, ArrowRight, ShieldCheck, Boxes, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '../components/UI';

export default function LoginPage({ onLogin, busy, error }) {
  const [email, setEmail] = useState('admin@foodops.local');
  const [password, setPassword] = useState('FoodOps@123');
  return <div className="login-screen">
    <div className="login-story">
      <div className="login-brand"><div className="brand-mark"><ChefHat size={23} /></div><span>FoodOps <b>ERP</b></span></div>
      <div className="login-story-content"><div className="login-kicker"><span /> FOOD OPERATIONS, REIMAGINED</div>
        <h1>Make every<br /><em>ingredient</em> count.</h1>
        <p>Bring inventory, kitchen workflows and business performance into one connected operations workspace.</p>
        <div className="login-feature-list"><div><Boxes size={17} /><span>Ingredient-level control</span></div><div><ChartNoAxesCombined size={17} /><span>Live insights from saved records</span></div><div><ShieldCheck size={17} /><span>Role-based workflow demonstration</span></div></div>
      </div>
      <div className="login-story-footer">© 2026 FoodOps ERP <span>BUILT FOR BETTER OPERATIONS</span></div>
    </div>
    <div className="login-form-area"><div className="login-form-wrap">
      <div className="login-mobile-brand"><div className="brand-mark"><ChefHat size={21} /></div><b>FoodOps ERP</b></div>
      <div className="form-eyebrow">WELCOME BACK</div><h2>Sign in to your workspace</h2><p className="login-description">Choose a demonstration account to explore the local FoodOps workspace.</p>
      <form onSubmit={e => { e.preventDefault(); onLogin({ email, password }); }} className="login-form">
        <label className="form-field"><span>Email address</span><input className="form-control" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label className="form-field"><span>Password</span><input className="form-control" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        {error && <div className="inline-error">{error}</div>}
        <Button type="submit" disabled={busy} className="login-submit">{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></Button>
      </form>
      <div className="demo-credentials"><div className="demo-credentials-title">DEMO ACCESS <span>LOCAL SAMPLE DATA</span></div><div><strong>Admin</strong><code>admin@foodops.local</code><code>FoodOps@123</code></div><div><strong>Manager</strong><code>manager@foodops.local</code><code>Manager@123</code></div><div><strong>Kitchen</strong><code>kitchen@foodops.local</code><code>Kitchen@123</code></div><div><strong>Inventory</strong><code>inventory@foodops.local</code><code>Stock@123</code></div></div>
      <div className="login-legal">Browser-local demo · Data stays in this browser.</div>
    </div></div>
  </div>;
}
