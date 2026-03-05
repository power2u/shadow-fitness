import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Search, ChevronDown, ChevronUp, Heart, Target,
    Apple, Dumbbell, FlaskConical, Upload, Plus, FileText,
    Trash2, File, Check, Loader, Eye, EyeOff
} from 'lucide-react';
import { KNOWLEDGE_CATEGORIES, DEFAULT_KNOWLEDGE } from '../services/knowledgeStore';
import { processBook } from '../services/pdfParser';
import { chunkService } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { tierGuard } from '../services/tierGuard';
import UpgradeModal from '../components/ui/UpgradeModal';
import './KnowledgePage.css';

const ICON_MAP = { Heart, Target, Apple, Dumbbell, FlaskConical };

export default function KnowledgePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('builtin'); // 'builtin' | 'uploaded'
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('');

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ page: 0, total: 0, status: '' });
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [expandedDoc, setExpandedDoc] = useState(null);
    const [docChunks, setDocChunks] = useState([]);
    const [loadingChunks, setLoadingChunks] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => { if (user) loadDocuments(); }, [user]);

    const loadDocuments = async () => {
        try {
            const docs = await chunkService.getDocuments(user.id);
            setUploadedDocs(docs);
        } catch (err) { console.error('Failed to load documents:', err); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.endsWith('.pdf')) return;

        // Tier Check
        const check = tierGuard.checkLimit('pdfUpload', uploadedDocs.length);
        if (!check.allowed) {
            setUpgradeReason(check.reason);
            setShowUpgrade(true);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        setUploadProgress({ page: 0, total: 0, status: 'Reading PDF...' });

        try {
            const result = await processBook(file, (page, total) => {
                setUploadProgress({ page, total, status: `Extracting page ${page} of ${total}...` });
            });

            setUploadProgress({ page: result.totalPages, total: result.totalPages, status: `Saving ${result.chunks.length} chunks...` });

            await chunkService.saveChunks(user.id, result.chunks);

            setUploadProgress({ page: result.totalPages, total: result.totalPages, status: 'Done!' });
            await loadDocuments();

            setTimeout(() => { setUploading(false); setUploadProgress({ page: 0, total: 0, status: '' }); }, 2000);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadProgress({ page: 0, total: 0, status: 'Error: ' + err.message });
            setTimeout(() => setUploading(false), 3000);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteDoc = async (title) => {
        if (!confirm('Delete "' + title + '" and all its chunks?')) return;
        try {
            await chunkService.deleteDocument(user.id, title);
            setUploadedDocs(uploadedDocs.filter(d => d.title !== title));
            if (expandedDoc === title) { setExpandedDoc(null); setDocChunks([]); }
        } catch (err) { console.error('Delete failed:', err); }
    };

    const toggleDocChunks = async (title) => {
        if (expandedDoc === title) { setExpandedDoc(null); setDocChunks([]); return; }
        setExpandedDoc(title);
        setLoadingChunks(true);
        try {
            const chunks = await chunkService.getChunksByDocument(user.id, title);
            setDocChunks(chunks);
        } catch (err) { console.error(err); setDocChunks([]); }
        finally { setLoadingChunks(false); }
    };

    // Built-in knowledge filtering
    const filtered = useMemo(() => {
        let entries = DEFAULT_KNOWLEDGE;
        if (activeCategory !== 'all') entries = entries.filter(e => e.category === activeCategory);
        if (search) {
            const q = search.toLowerCase();
            entries = entries.filter(e =>
                e.topic.toLowerCase().includes(q) ||
                e.content.toLowerCase().includes(q) ||
                e.tags?.some(t => t.toLowerCase().includes(q))
            );
        }
        return entries;
    }, [activeCategory, search]);

    const categoryCounts = useMemo(() => {
        const counts = { all: DEFAULT_KNOWLEDGE.length };
        KNOWLEDGE_CATEGORIES.forEach(c => { counts[c.id] = DEFAULT_KNOWLEDGE.filter(e => e.category === c.id).length; });
        return counts;
    }, []);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1><BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Knowledge Base</h1>
                    <p>Science-backed references powering your AI recommendations</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="knowledge-main-tabs">
                <button className={`main-tab ${activeTab === 'builtin' ? 'active' : ''}`} onClick={() => setActiveTab('builtin')}>
                    <BookOpen size={16} /> Built-in Knowledge <span className="tab-count">{DEFAULT_KNOWLEDGE.length}</span>
                </button>
                <button className={`main-tab ${activeTab === 'uploaded' ? 'active' : ''}`} onClick={() => setActiveTab('uploaded')}>
                    <FileText size={16} /> Uploaded Books <span className="tab-count">{uploadedDocs.length}</span>
                </button>
            </div>

            {/* ═══════════ UPLOADED BOOKS TAB ═══════════ */}
            {activeTab === 'uploaded' && (
                <div className="uploaded-section">
                    {/* Upload Area */}
                    <div className="upload-area glass-card">
                        <div className="upload-dropzone" onClick={() => !uploading && fileInputRef.current?.click()}>
                            {uploading ? (
                                <div className="upload-progress">
                                    <Loader size={32} className="spin" />
                                    <h4>{uploadProgress.status}</h4>
                                    {uploadProgress.total > 0 && (
                                        <>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: (uploadProgress.page / uploadProgress.total * 100) + '%' }} />
                                            </div>
                                            <p className="progress-text">{uploadProgress.page} / {uploadProgress.total} pages</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} />
                                    <h4>Drop a PDF ebook here or click to browse</h4>
                                    <p>The book will be parsed, chunked, and stored as knowledge for AI plans</p>
                                    <button className="btn btn-secondary">Choose PDF File</button>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept=".pdf" className="upload-input"
                                onChange={handleFileUpload} style={{ display: 'none' }} />
                        </div>
                    </div>

                    {/* Uploaded Documents List */}
                    {uploadedDocs.length > 0 ? (
                        <div className="documents-list">
                            <h3>Your Books ({uploadedDocs.length})</h3>
                            {uploadedDocs.map(doc => (
                                <div key={doc.title} className="document-card glass-card">
                                    <div className="doc-header">
                                        <div className="doc-info" onClick={() => toggleDocChunks(doc.title)}>
                                            <File size={20} />
                                            <div>
                                                <h4>{doc.title}</h4>
                                                <span className="doc-meta">{doc.chunks} chunks</span>
                                            </div>
                                        </div>
                                        <div className="doc-actions">
                                            <button className="btn btn-ghost btn-sm" onClick={() => toggleDocChunks(doc.title)} title="View chunks">
                                                {expandedDoc === doc.title ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteDoc(doc.title)} title="Delete">
                                                <Trash2 size={16} style={{ color: 'var(--accent-pink)' }} />
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedDoc === doc.title && (
                                            <motion.div className="doc-chunks" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                {loadingChunks ? (
                                                    <div className="chunks-loading"><Loader size={20} className="spin" /> Loading chunks...</div>
                                                ) : (
                                                    docChunks.map((chunk, i) => (
                                                        <div key={i} className="chunk-card">
                                                            <div className="chunk-meta">
                                                                <span>Chunk {chunk.chunk_index + 1}</span>
                                                                <span>Pages {chunk.page_start}-{chunk.page_end}</span>
                                                            </div>
                                                            <p className="chunk-preview">{chunk.content.slice(0, 300)}{chunk.content.length > 300 ? '...' : ''}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !uploading && (
                            <div className="empty-state glass-card">
                                <FileText size={40} />
                                <h3>No books uploaded yet</h3>
                                <p>Upload nutrition or exercise science PDFs to power your AI-generated plans with real references</p>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ═══════════ BUILT-IN KNOWLEDGE TAB ═══════════ */}
            {activeTab === 'builtin' && (
                <>
                    {/* Search */}
                    <div className="knowledge-search">
                        <Search size={18} className="search-icon" />
                        <input className="input-field search-input" placeholder="Search topics, conditions, nutrients..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        <button className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('all')}>
                            <BookOpen size={16} /><span>All</span><span className="tab-count">{categoryCounts.all}</span>
                        </button>
                        {KNOWLEDGE_CATEGORIES.map(cat => {
                            const IconComponent = ICON_MAP[cat.icon] || BookOpen;
                            return (
                                <button key={cat.id} className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}>
                                    <IconComponent size={16} /><span>{cat.label}</span><span className="tab-count">{categoryCounts[cat.id] || 0}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Entries */}
                    <div className="knowledge-entries">
                        {filtered.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon"><Search size={28} /></div><h3>No entries found</h3><p>Try a different search term or category</p></div>
                        ) : (
                            filtered.map((entry, i) => {
                                const isExpanded = expandedId === i;
                                const catMeta = KNOWLEDGE_CATEGORIES.find(c => c.id === entry.category);
                                return (
                                    <motion.div key={i} className={`knowledge-entry glass-card ${isExpanded ? 'expanded' : ''}`}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} layout>
                                        <button className="entry-header" onClick={() => setExpandedId(isExpanded ? null : i)}>
                                            <div className="entry-category-dot" style={{ background: catMeta?.color || 'var(--accent-cyan)' }} />
                                            <div className="entry-title-area">
                                                <h3>{entry.topic}</h3>
                                                <div className="entry-tags">
                                                    {entry.tags?.slice(0, 4).map(t => (<span key={t} className="entry-tag">{t}</span>))}
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div className="entry-content" initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                                    <div className="entry-body">
                                                        {entry.content.split('\n').map((para, j) => (<p key={j}>{para}</p>))}
                                                    </div>
                                                    {entry.sources?.length > 0 && (
                                                        <div className="entry-sources">
                                                            <span className="sources-label">Sources:</span>
                                                            {entry.sources.map((s, j) => (<span key={j} className="source-item">{s}</span>))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
