'use client'

import { useState, useEffect } from 'react'

interface SettingItem { key: string; value: string; label: string | null; group: string; type: string }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [list, setList] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSettings(d.settings || {})
      setList(d.list || [])
      setLoading(false)
    })
  }, [])

  const groups = Array.from(new Set(list.map(s => s.group)))

  async function save() {
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  const groupSettings = list.filter(s => s.group === activeTab)

  if (loading) return <div className="text-center py-16 text-dark-500">Loading settings…</div>

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="section-subtitle">Configure your platform preferences</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 border border-dark-800 rounded-xl p-1 w-fit">
        {groups.map(group => (
          <button key={group} onClick={() => setActiveTab(group)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === group ? 'bg-gold-500/15 text-gold-500 border border-gold-500/20' : 'text-dark-400 hover:text-dark-200'}`}>
            {group}
          </button>
        ))}
      </div>

      <div className="card space-y-5">
        {groupSettings.map(setting => (
          <div key={setting.key}>
            <label className="label">{setting.label || setting.key}</label>
            {setting.type === 'boolean' ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${settings[setting.key] === 'true' ? 'bg-gold-500' : 'bg-dark-700'}`}
                  onClick={() => setSettings({ ...settings, [setting.key]: settings[setting.key] === 'true' ? 'false' : 'true' })}
                >
                  <div className={`absolute top-0 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[setting.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-dark-400">{settings[setting.key] === 'true' ? 'Enabled' : 'Disabled'}</span>
              </div>
            ) : setting.key.includes('color') ? (
              <div className="flex items-center gap-3">
                <input type="color" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" value={settings[setting.key] || '#d4952a'} onChange={e => setSettings({ ...settings, [setting.key]: e.target.value })} />
                <input type="text" className="input-field w-32 font-mono" value={settings[setting.key] || ''} onChange={e => setSettings({ ...settings, [setting.key]: e.target.value })} />
              </div>
            ) : setting.type === 'number' ? (
              <input type="number" className="input-field" step="0.01" value={settings[setting.key] || ''} onChange={e => setSettings({ ...settings, [setting.key]: e.target.value })} />
            ) : (
              <input type="text" className="input-field" value={settings[setting.key] || ''} onChange={e => setSettings({ ...settings, [setting.key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      {activeTab === 'general' && (
        <div className="card border-red-500/20">
          <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-dark-200">Export All Data</div>
                <div className="text-xs text-dark-500">Download all platform data as JSON</div>
              </div>
              <button className="btn-secondary text-xs py-1.5">Export</button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-dark-800">
              <div>
                <div className="text-sm text-dark-200">Clear Demo Data</div>
                <div className="text-xs text-dark-500">Remove all demo clients and records</div>
              </div>
              <button className="btn-danger text-xs py-1.5">Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
