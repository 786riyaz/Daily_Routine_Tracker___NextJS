'use client';
import { useState } from 'react';
import Navbar from './Navbar';
export default function AppShell({ children }) {
const [theme, setTheme] = useState('theme-dark');
function cycleTheme() {
setTheme(t => t === 'theme-dark' ? 'theme-light' : t === 'theme-light' ? 'theme-purple' : 'theme-dark');
}
const themeLabel = theme === 'theme-dark' ? '🌙 Dark' : theme === 'theme-light' ? '☀️ Light' : '🟣 Purple';
return (
<div className={theme} style={{ minHeight: '100vh', background: 'var(--bg-gradient)', overflowX: 'hidden' }}>
<div className="app-shell">
<div className="app-header">
<div className="header-top">
<div style={{ minWidth: 0 }}>
<h1>Activity Tracker</h1>
<p className="muted">Track your daily &amp; weekly activities with a clean minimal UI.</p>
</div>
<div className="header-right">
<button className="btn-small ghost" onClick={cycleTheme}>{themeLabel}</button>
<ExportImportButtons theme={theme} />
</div>
</div>
<Navbar />
</div>
{children}
</div>
</div>
);
}
function ExportImportButtons() {
async function exportBackup() {
const res = await fetch('/api/backup');
const data = await res.json();
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
a.click(); URL.revokeObjectURL(url);
}
async function importBackup(e) {
const file = e.target.files[0];
if (!file) return;
const text = await file.text();
try {
const data = JSON.parse(text);
if (!confirm('This will overwrite all current data. Continue?')) return;
await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
window.location.reload();
} catch { alert('Invalid backup file'); }
e.target.value = '';
}
return (
<>
<button className="btn-small" onClick={exportBackup}>↓ Export</button>
<label className="btn-small import-btn" style={{ cursor: 'pointer' }}>
↑ Import
<input type="file" accept=".json" style={{ display: 'none' }} onChange={importBackup} />
</label>
</>
);
}