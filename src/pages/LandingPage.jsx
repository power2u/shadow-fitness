import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Dumbbell, Brain, Utensils, Users, ChevronRight, Sparkles,
    ArrowRight, Zap, Shield, BarChart3, FlaskConical, Dna,
    Target, Activity, Star, Menu, X, Check, ChevronDown,
    MessageSquare, BookOpen, Globe, Cpu
} from 'lucide-react';
import './LandingPage.css';

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
];

function AnimatedCounter({ end, duration = 2, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = end / (duration * 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [inView, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

const PRICING = [
    {
        name: 'Free',
        price: '0',
        period: 'forever',
        description: 'Perfect for trying out the platform',
        features: ['3 active clients', 'AI workout & meal plans', 'Basic knowledge store', 'PDF exports', 'Email support'],
        excluded: ['Ingredient selector', 'PDF Knowledge Base', 'Client portal', 'White-label branding', 'Priority support'],
        cta: 'Start Free',
        popular: false,
    },
    {
        name: 'Pro',
        price: '19',
        period: '/month',
        description: 'For serious coaches scaling their business',
        features: ['Unlimited clients', 'AI workout & meal plans', 'Ingredient selector', 'PDF Knowledge Base', 'Drug-nutrient checks', 'PDF & DOC exports', 'Client portal access', 'Progress tracking', 'Priority support'],
        excluded: ['White-label branding', 'Multi-coach team'],
        cta: 'Start Pro Trial',
        popular: true,
    },
    {
        name: 'Clinic',
        price: '49',
        period: '/month',
        description: 'For clinics and coaching teams',
        features: ['Everything in Pro', 'Multi-coach team (5 seats)', 'White-label branding', 'Custom domain support', 'Advanced analytics', 'API access', 'Dedicated account manager', 'Onboarding call'],
        excluded: [],
        cta: 'Contact Sales',
        popular: false,
    }
];

const TESTIMONIALS = [
    {
        name: 'Dr. Priya Sharma',
        role: 'Clinical Nutritionist, Mumbai',
        quote: 'The drug-nutrient interaction checker alone has saved me hours of cross-referencing. My clients on metformin and thyroid meds finally get plans that work with their biochemistry.',
        rating: 5,
        avatar: 'PS',
    },
    {
        name: 'Jake Mitchell',
        role: 'Online Fitness Coach, Austin TX',
        quote: 'I went from managing 15 clients in spreadsheets to 60+ clients with ShadowFitness. The ingredient selector lets me customize every plan in under 5 minutes.',
        rating: 5,
        avatar: 'JM',
    },
    {
        name: 'Sarah Chen',
        role: 'Sports Dietitian, London',
        quote: 'This is the only platform that takes food mechanics seriously — nutrient pairing, anti-nutrients, absorption timing. It\'s like having a research assistant built in.',
        rating: 5,
        avatar: 'SC',
    }
];

const FAQS = [
    {
        q: 'Is ShadowFitness a generic meal plan generator?',
        a: 'No. ShadowFitness is a clinical-grade coaching platform. Every plan considers the client\'s medical conditions, medications, biochemistry, and individual physiology. We check for drug-nutrient interactions and use food mechanics principles that most platforms ignore.'
    },
    {
        q: 'How does the AI work? Does it just use ChatGPT?',
        a: 'We use Google\'s Gemini AI with specialized prompts grounded in exercise physiology and clinical nutrition. The AI cross-references our built-in knowledge store (50+ conditions, 200+ protocols) plus any ebooks you upload. It\'s not a generic chatbot — it\'s a research-grade tool.'
    },
    {
        q: 'Can my clients see their plans?',
        a: 'Yes! With Pro and Clinic plans, each client gets a simple portal login where they can view their meal and workout plans, log daily progress (weight, energy, digestion), and track changes over time.'
    },
    {
        q: 'What about data privacy and HIPAA?',
        a: 'Client data is stored securely in Supabase with row-level security. Each coach can only access their own clients\' data. We never share or sell any health information. For HIPAA-specific compliance, contact us for our Clinic plan.'
    },
    {
        q: 'Can I upload my own nutrition textbooks?',
        a: 'Yes! Our PDF Knowledge Base lets you upload exercise science and nutrition ebooks. The system extracts text, chunks it into searchable sections, and automatically injects relevant excerpts into AI-generated plans — so your recommendations cite your own reference material.'
    },
    {
        q: 'Is there a free trial?',
        a: 'The Free plan is permanent — no credit card required, no time limit. You can manage up to 3 clients with full AI plan generation. Upgrade to Pro anytime to unlock unlimited clients, the ingredient selector, and the client portal.'
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [mobileMenu, setMobileMenu] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const { scrollYProgress } = useScroll();
    const headerBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(6,8,15,0)', 'rgba(6,8,15,0.9)']);

    const features = [
        { icon: <Brain size={28} />, title: 'AI-Powered Intelligence', description: 'Gemini AI researches biochemistry, exercise physiology, and nutrition science to build truly personalized plans.', gradient: 'var(--gradient-primary)', badge: 'CORE' },
        { icon: <Cpu size={28} />, title: 'Biochemistry-First', description: 'Every recommendation considers hormonal profiles, metabolic conditions, medications, and individual variability.', gradient: 'var(--gradient-secondary)', badge: 'SCIENCE' },
        { icon: <FlaskConical size={28} />, title: 'Food Mechanics Engine', description: 'Nutrient absorption, food synergies, anti-nutrients, meal timing — all calculated for maximum bioavailability.', gradient: 'var(--gradient-warm)', badge: 'UNIQUE' },
        { icon: <Globe size={28} />, title: 'Global Knowledge Base', description: 'Upload nutrition textbooks and research papers. The AI cites your own reference material when building plans.', gradient: 'var(--gradient-primary)', badge: 'NEW' },
        { icon: <Dumbbell size={28} />, title: 'Smart Workout Builder', description: 'Progressive overload, periodization, and recovery protocols tailored to training age and medical history.', gradient: 'var(--gradient-secondary)', badge: 'BUILD' },
        { icon: <Utensils size={28} />, title: 'Precision Meal Plans', description: 'Macro & micro-nutrient optimized meals with food pairing strategies backed by clinical research.', gradient: 'var(--gradient-warm)', badge: 'FUEL' },
    ];

    const steps = [
        { number: '01', title: 'Onboard Client', description: 'Comprehensive questionnaire captures medical history, goals, lifestyle, nutrition preferences, and training background.', icon: <Users size={32} /> },
        { number: '02', title: 'AI Analyzes & Researches', description: 'The AI cross-references the client profile with the knowledge store, identifying relevant conditions, interactions, and optimal strategies.', icon: <Brain size={32} /> },
        { number: '03', title: 'Generate Plans', description: 'Science-backed workout and meal plans are generated with full reasoning — every recommendation explained.', icon: <Sparkles size={32} /> },
    ];

    return (
        <div className="landing">
            {/* ── Animated Background ── */}
            <div className="landing-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
                <div className="bg-grid" />
            </div>

            {/* ── Header ── */}
            <motion.header className="landing-header" style={{ backgroundColor: headerBg }}>
                <div className="header-inner">
                    <div className="logo">
                        <div className="logo-icon"><Activity size={24} /></div>
                        <span className="logo-text">Shadow<span className="text-gradient">Fitness</span></span>
                    </div>
                    <nav className="nav-links">
                        {NAV_LINKS.map(link => (<a key={link.href} href={link.href} className="nav-link">{link.label}</a>))}
                    </nav>
                    <div className="header-actions">
                        <button className="btn btn-ghost" onClick={() => navigate('/auth')}>Log In</button>
                        <button className="btn btn-primary" onClick={() => navigate('/auth')}>Get Started <ArrowRight size={16} /></button>
                    </div>
                    <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
                        {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            {NAV_LINKS.map(link => (<a key={link.href} href={link.href} className="mobile-nav-link" onClick={() => setMobileMenu(false)}>{link.label}</a>))}
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} style={{ width: '100%', marginTop: '1rem' }}>Get Started</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-glow-blob" />
                <motion.div className="hero-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="hero-badge">
                        <motion.div className="badge-glow" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                        <Zap size={14} /><span>AI-Powered Fitness Science</span>
                    </div>
                    <h1 className="hero-title">The Coaching Platform<br />Built on <span className="text-gradient">Real Science.</span></h1>
                    <p className="hero-subtitle">Build workout and meal plans grounded in biochemistry, food mechanics, and individual physiology. Manage clients, track progress, and scale your coaching — all in one platform.</p>
                    <div className="hero-cta">
                        <motion.button
                            className="btn btn-primary btn-lg hero-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/auth')}
                        >
                            Start Free — No Credit Card <ArrowRight size={18} />
                        </motion.button>
                        <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>View Pricing</button>
                    </div>
                    <div className="hero-stats-glass">
                        <div className="hero-stat"><span className="hero-stat-value"><AnimatedCounter end={8800} suffix="+" /></span><span className="hero-stat-label">Food Data Points</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><span className="hero-stat-value"><AnimatedCounter end={250} suffix="+" /></span><span className="hero-stat-label">Protocols</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><span className="hero-stat-value"><AnimatedCounter end={15} /></span><span className="hero-stat-label">Medical Segments</span></div>
                    </div>
                </motion.div>
                <div className="hero-visuals">
                    <motion.div className="floating-card fc-1" animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><Dumbbell size={20} /><span>Progressive Overload</span></motion.div>
                    <motion.div className="floating-card fc-2" animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}><FlaskConical size={20} /><span>Food Mechanics</span></motion.div>
                    <motion.div className="floating-card fc-3" animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}><Dna size={20} /><span>Biochemistry</span></motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="section features-section" id="features">
                <div className="section-container">
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <span className="badge badge-accent">FEATURES</span>
                        <h2 className="section-title">Built Different. <span className="text-gradient">Built on Science.</span></h2>
                        <p className="section-subtitle">Every feature is designed to deliver truly personalized, evidence-based fitness and nutrition plans.</p>
                    </motion.div>
                    <div className="features-grid">
                        {features.map((feature, i) => (
                            <motion.div key={feature.title} className="feature-card glass-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                                <div className="feature-card-header">
                                    <div className="feature-icon" style={{ background: feature.gradient }}>{feature.icon}</div>
                                    <span className="badge badge-accent">{feature.badge}</span>
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="section how-section" id="how-it-works">
                <div className="section-container">
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <span className="badge badge-blue">PROCESS</span>
                        <h2 className="section-title">Three Steps to <span className="text-gradient">Precision Plans</span></h2>
                    </motion.div>
                    <div className="steps-grid">
                        {steps.map((step, i) => (
                            <motion.div key={step.number} className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                                <div className="step-number">{step.number}</div>
                                <div className="step-icon-wrap">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                                {i < steps.length - 1 && <div className="step-connector"><ChevronRight size={20} /></div>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="section pricing-section" id="pricing">
                <div className="section-container">
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <span className="badge badge-accent">PRICING</span>
                        <h2 className="section-title">Simple, <span className="text-gradient">Transparent</span> Pricing</h2>
                        <p className="section-subtitle">Start free, upgrade when you're ready. No hidden fees.</p>
                    </motion.div>
                    <div className="pricing-grid">
                        {PRICING.map((plan, i) => (
                            <motion.div key={plan.name} className={`pricing-card glass-card ${plan.popular ? 'popular' : ''}`}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}>
                                {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
                                <div className="pricing-header">
                                    <h3 className="pricing-name">{plan.name}</h3>
                                    <div className="pricing-price">
                                        <span className="price-dollar">$</span>
                                        <span className="price-amount">{plan.price}</span>
                                        <span className="price-period">{plan.period}</span>
                                    </div>
                                    <p className="pricing-desc">{plan.description}</p>
                                </div>
                                <ul className="pricing-features">
                                    {plan.features.map(f => (
                                        <li key={f} className="pf-included"><Check size={16} /><span>{f}</span></li>
                                    ))}
                                    {plan.excluded.map(f => (
                                        <li key={f} className="pf-excluded"><X size={16} /><span>{f}</span></li>
                                    ))}
                                </ul>
                                <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg pricing-cta`} onClick={() => navigate('/auth')}>
                                    {plan.cta} <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="section testimonials-section" id="testimonials">
                <div className="section-container">
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <span className="badge badge-violet">TESTIMONIALS</span>
                        <h2 className="section-title">Trusted by <span className="text-gradient-warm">Coaches Worldwide</span></h2>
                    </motion.div>
                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={t.name} className="testimonial-card glass-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}>
                                <div className="testimonial-stars">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="var(--accent-cyan)" color="var(--accent-cyan)" />)}
                                </div>
                                <p className="testimonial-quote">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.avatar}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="section faq-section" id="faq">
                <div className="section-container">
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <span className="badge badge-blue">FAQ</span>
                        <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
                    </motion.div>
                    <div className="faq-list">
                        {FAQS.map((faq, i) => (
                            <motion.div key={i} className={`faq-item glass-card ${openFaq === i ? 'open' : ''}`}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <ChevronDown size={18} className={`faq-chevron ${openFaq === i ? 'rotated' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div className="faq-answer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                            <p>{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="section cta-section">
                <div className="section-container">
                    <motion.div className="cta-card" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <div className="cta-glow" />
                        <h2>Ready to Build <span className="text-gradient">Science-Backed</span> Plans?</h2>
                        <p>Join coaches who've ditched spreadsheets for AI-powered, evidence-based client management.</p>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>Get Started Free <ArrowRight size={18} /></button>
                        <span className="cta-note">No credit card required. Free forever on the starter plan.</span>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <div className="logo">
                            <div className="logo-icon"><Activity size={20} /></div>
                            <span className="logo-text">Shadow<span className="text-gradient">Fitness</span></span>
                        </div>
                        <p>The AI-powered coaching platform built on real science.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <a href="mailto:hello@shadowfitness.com">Contact Us</a>
                        <a href="#faq">Help Center</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                    <div className="footer-copy">
                        © {new Date().getFullYear()} ShadowFitness. Built with science.
                    </div>
                </div>
            </footer>
        </div>
    );
}
