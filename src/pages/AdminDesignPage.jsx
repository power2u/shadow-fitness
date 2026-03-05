import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, ChevronLeft, Save, RefreshCw, Type, Layout, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tierGuard } from '../services/tierGuard';
import { adminService } from '../services/supabase';
import './AdminDesignPage.css';

const GOOGLE_FONTS = [
    { name: 'Inter', type: 'body' },
    { name: 'Outfit', type: 'heading' },
    { name: 'Roboto', type: 'body' },
    { name: 'Playfair Display', type: 'heading' },
    { name: 'Montserrat', type: 'both' },
    { name: 'Syncopate', type: 'heading' },
    { name: 'Space Grotesk', type: 'both' }
];

export default function AdminDesignPage() {
    const [settings, setSettings] = useState({
        accent_cyan: '#06d6a0',
        accent_teal: '#00b4d8',
        accent_blue: '#4361ee',
        accent_violet: '#7b2ff7',
        accent_pink: '#f72585',
        bg_primary: '#06080f',
        bg_secondary: '#0c1019',
        font_heading: 'Outfit',
        font_body: 'Inter'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState('');

    const isAdmin = tierGuard.getTier() === 'admin';

    useEffect(() => {
        if (!isAdmin) return;
        loadSettings();
    }, [isAdmin]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPlatformSettings('theme');
            if (data) setSettings(data);
        } catch (err) {
            console.error('Failed to load design settings:', err);
        }
        setLoading(false);
    };

    const handleColorChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        // Live preview
        document.documentElement.style.setProperty(`--${key.replace('_', '-')}`, value);

        // Update dependent gradients for preview
        if (key === 'accent_cyan' || key === 'accent_blue') {
            const cyan = key === 'accent_cyan' ? value : settings.accent_cyan;
            const blue = key === 'accent_blue' ? value : settings.accent_blue;
            document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${cyan}, ${blue})`);
        }
    };

    const handleFontChange = (key, value) => {
        setSettings({ ...settings, [key]: value });
        if (key === 'font_heading') {
            document.documentElement.style.setProperty('--font-heading', `'${value}', sans-serif`);
        } else {
            document.documentElement.style.setProperty('--font-body', `'${value}', sans-serif`);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await adminService.updatePlatformSettings('theme', settings);
            setNotification('Design settings saved successfully!');
            setTimeout(() => setNotification(''), 3000);
        } catch (err) {
            console.error('Error saving design settings:', err);
            setNotification('Failed to save settings.');
            setTimeout(() => setNotification(''), 3000);
        }
        setSaving(false);
    };

    if (!isAdmin) return <div className="admin-error">Access Denied</div>;

    return (
        <div className="admin-design-page">
            <header className="page-header">
                <Link to="/dashboard/admin" className="back-link">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <div className="header-main">
                    <div>
                        <h1>Platform Design</h1>
                        <p className="subtitle">Manage colors, typography, and visual excellence across the entire platform</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        disabled={saving}
                        onClick={saveSettings}
                    >
                        {saving ? <RefreshCw className="spinner" size={18} /> : <Save size={18} />}
                        Save Design
                    </button>
                </div>
            </header>

            {notification && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="admin-notification glass-card">
                    {notification}
                </motion.div>
            )}

            <div className="design-grid">
                {/* Colors Section */}
                <section className="glass-card design-section">
                    <div className="section-title-wrap">
                        <Palette size={20} className="accent-cyan" />
                        <h2>Core Palette</h2>
                    </div>
                    <div className="color-grid">
                        <div className="color-field">
                            <label>Primary Accent (Cyan)</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.accent_cyan} onChange={e => handleColorChange('accent_cyan', e.target.value)} />
                                <span>{settings.accent_cyan}</span>
                            </div>
                        </div>
                        <div className="color-field">
                            <label>Secondary Accent (Blue)</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.accent_blue} onChange={e => handleColorChange('accent_blue', e.target.value)} />
                                <span>{settings.accent_blue}</span>
                            </div>
                        </div>
                        <div className="color-field">
                            <label>Violet Accent</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.accent_violet} onChange={e => handleColorChange('accent_violet', e.target.value)} />
                                <span>{settings.accent_violet}</span>
                            </div>
                        </div>
                        <div className="color-field">
                            <label>Pink Accent</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.accent_pink} onChange={e => handleColorChange('accent_pink', e.target.value)} />
                                <span>{settings.accent_pink}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography Section */}
                <section className="glass-card design-section">
                    <div className="section-title-wrap">
                        <Type size={20} className="accent-blue" />
                        <h2>Typography</h2>
                    </div>
                    <div className="font-fields">
                        <div className="form-group">
                            <label>Heading Font</label>
                            <select value={settings.font_heading} onChange={e => handleFontChange('font_heading', e.target.value)}>
                                {GOOGLE_FONTS.filter(f => f.type !== 'body').map(f => (
                                    <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Body Font</label>
                            <select value={settings.font_body} onChange={e => handleFontChange('font_body', e.target.value)}>
                                {GOOGLE_FONTS.filter(f => f.type !== 'heading').map(f => (
                                    <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Background Section */}
                <section className="glass-card design-section">
                    <div className="section-title-wrap">
                        <Layout size={20} className="accent-violet" />
                        <h2>Backgrounds</h2>
                    </div>
                    <div className="color-grid">
                        <div className="color-field">
                            <label>Primary Background</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.bg_primary} onChange={e => handleColorChange('bg_primary', e.target.value)} />
                                <span>{settings.bg_primary}</span>
                            </div>
                        </div>
                        <div className="color-field">
                            <label>Secondary Background</label>
                            <div className="picker-wrap">
                                <input type="color" value={settings.bg_secondary} onChange={e => handleColorChange('bg_secondary', e.target.value)} />
                                <span>{settings.bg_secondary}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preview Section */}
                <section className="glass-card design-section preview-section">
                    <div className="section-title-wrap">
                        <Eye size={20} className="accent-pink" />
                        <h2>Live Components Preview</h2>
                    </div>
                    <div className="preview-content">
                        <div className="preview-buttons">
                            <button className="btn btn-primary">Primary Button</button>
                            <button className="btn btn-secondary">Secondary Button</button>
                        </div>
                        <div className="preview-text">
                            <h3 className="text-gradient">Heading Style</h3>
                            <p>This is how your body text will look across the platform. It should be highly readable and look premium.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
