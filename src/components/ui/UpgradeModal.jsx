import { useNavigate } from 'react-router-dom';
import { X, Crown, Zap, Shield } from 'lucide-react';
import { TIER_LIMITS } from '../../services/tierGuard';
import Modal from './Modal';
import './UpgradeModal.css';

const TIER_ICONS = { free: Zap, pro: Crown, clinic: Shield };

export default function UpgradeModal({ isOpen, onClose, reason, currentTier = 'free' }) {
    const navigate = useNavigate();

    const upgradeTiers = Object.entries(TIER_LIMITS)
        .filter(([key]) => key !== currentTier && key !== 'free');

    return (
        <Modal isOpen={isOpen} onClose={onClose} showClose={false} maxWidth="900px" padding="0">
            <div className="upgrade-modal-inner">
                <button className="upgrade-close" onClick={onClose}><X size={20} /></button>

                <div className="upgrade-header">
                    <div className="upgrade-icon-wrap">
                        <Crown size={32} />
                    </div>
                    <h2>Upgrade Your Plan</h2>
                    {reason && <p className="upgrade-reason">{reason}</p>}
                </div>

                <div className="upgrade-tiers">
                    {upgradeTiers.map(([key, tier]) => {
                        const Icon = TIER_ICONS[key] || Crown;
                        return (
                            <div key={key} className={`upgrade-tier-card ${key}`}>
                                <div className="tier-card-header">
                                    <Icon size={20} />
                                    <h3>{tier.label}</h3>
                                    <span className="tier-price">
                                        {key === 'pro' ? '$19' : '$49'}<small>/mo</small>
                                    </span>
                                </div>
                                <ul className="tier-features">
                                    <li>{tier.maxClients >= 999999 ? 'Unlimited' : tier.maxClients} Clients</li>
                                    <li>{tier.workoutPlansPerMonth >= 999999 ? 'Unlimited' : tier.workoutPlansPerMonth} Plans/mo</li>
                                    <li>{tier.ingredientSelector ? '✓' : '✗'} Ingredient Selector</li>
                                    <li>{tier.pdfUpload ? tier.maxPdfBooks + ' PDF Books' : '✗ PDF Upload'}</li>
                                    <li>{tier.exportEnabled ? '✓' : '✗'} PDF/DOCX Export</li>
                                    <li>{tier.drugNutrientLevel === 'full' ? '✓ Full' : 'Basic'} Drug Checks</li>
                                    <li>{tier.teamSeats} Team Seat{tier.teamSeats > 1 ? 's' : ''}</li>
                                </ul>
                                <button className="btn btn-primary upgrade-cta"
                                    onClick={() => { onClose(); navigate('/'); }}>
                                    Upgrade to {tier.label}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}
