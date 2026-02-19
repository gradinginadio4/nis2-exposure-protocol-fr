/**
 * NIS2 EXPOSURE PROTOCOL - FRENCH VERSION
 * Logic for NIS2 Directive compliance assessment
 * Based on Directive (EU) 2022/2555 and Belgian transposition law
 */

// State management
const state = {
    step: 1,
    answers: {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    }
};

// DOM Elements
const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
};

const tierBadge = document.getElementById('tier-badge');
const resultContent = document.getElementById('result-content');

/**
 * Navigate to specific step
 * @param {number} stepNumber - Target step
 */
function goToStep(stepNumber) {
    // Hide current step
    Object.values(steps).forEach(step => {
        if (step) step.classList.remove('active');
    });
    
    // Show target step
    if (steps[stepNumber]) {
        steps[stepNumber].classList.add('active');
        state.step = stepNumber;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Handle option selection for steps 1, 2, and 4
 * @param {number} step - Current step number
 * @param {string} value - Selected value
 */
function selectOption(step, value) {
    // Update state based on step
    if (step === 1) {
        state.answers.entitySize = value;
        updateSelectionUI(1, value);
        setTimeout(() => goToStep(2), 300);
    } else if (step === 2) {
        state.answers.serviceSensitivity = value;
        updateSelectionUI(2, value);
        setTimeout(() => goToStep(3), 300);
    } else if (step === 4) {
        state.answers.governanceMaturity = value;
        updateSelectionUI(4, value);
        setTimeout(() => calculateAndShowResults(), 300);
    }
}

/**
 * Update UI to show selected state
 * @param {number} step - Step number
 * @param {string} value - Selected value
 */
function updateSelectionUI(step, value) {
    const stepEl = document.getElementById(`step-${step}`);
    const cards = stepEl.querySelectorAll('.option-card');
    
    cards.forEach(card => {
        if (card.dataset.value === value) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

/**
 * Validate step 3 (checkboxes) and proceed
 */
function validateStep3() {
    // Collect checkbox values
    state.answers.digitalInfrastructure = {
        cloud: document.getElementById('cloud-infra').checked,
        mfa: document.getElementById('mfa-enabled').checked,
        incidentProcess: document.getElementById('incident-process').checked,
        supplyChain: document.getElementById('supply-chain').checked
    };
    
    goToStep(4);
}

/**
 * Go back to previous step
 * @param {number} currentStep - Current step number
 */
function goBack(currentStep) {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

/**
 * Calculate exposure tier based on NIS2 logic
 * Returns: 'tier-1' (Low), 'tier-2' (Medium), 'tier-3' (High)
 */
function calculateTier() {
    const { entitySize, serviceSensitivity, digitalInfrastructure, governanceMaturity } = state.answers;
    
    let score = 0;
    
    // Entity size weight (NIS2 scope criteria)
    // Large entities in specific sectors are Essential or Important
    if (entitySize === 'large') score += 3;
    else if (entitySize === 'medium') score += 2;
    else score += 1;
    
    // Service sensitivity (Annex III sectors)
    // Legal/accounting services are explicitly listed in NIS2 Annex III
    if (serviceSensitivity === 'high') score += 3;
    else if (serviceSensitivity === 'medium') score += 2;
    else score += 1;
    
    // Digital infrastructure risk factors
    let infraRisk = 0;
    if (digitalInfrastructure.cloud) infraRisk += 1;
    if (!digitalInfrastructure.mfa) infraRisk += 2; // Lack of MFA is high risk
    if (!digitalInfrastructure.incidentProcess) infraRisk += 2; // No incident process is high risk
    if (digitalInfrastructure.supplyChain) infraRisk += 1;
    
    score += Math.min(infraRisk, 3); // Cap at 3
    
    // Governance maturity (risk mitigation)
    // Higher maturity reduces effective exposure
    let governanceModifier = 0;
    if (governanceMaturity === 'none') governanceModifier = 2;
    else if (governanceMaturity === 'basic') governanceModifier = 1;
    else if (governanceMaturity === 'structured') governanceModifier = -1;
    else if (governanceMaturity === 'iso') governanceModifier = -2;
    
    score += governanceModifier;
    
    // Determine tier
    // Tier 3 (High): Large entities in sensitive sectors with poor governance
    // Tier 2 (Medium): Medium entities or large with good governance
    // Tier 1 (Low): Small entities or those with excellent governance
    
    if (score >= 6) return 'tier-3';
    if (score >= 4) return 'tier-2';
    return 'tier-1';
}

/**
 * Generate results content based on tier
 * @param {string} tier - Calculated tier
 */
function generateResults(tier) {
    const tiers = {
        'tier-1': {
            label: 'Exposition Limitée',
            title: 'Niveau 1 : Exposition Réglementaire Limitée',
            implications: 'Votre structure présente une exposition réduite aux obligations strictes de la Directive NIS2. Cependant, la vigilance reste de mise concernant la chaîne de valeur.',
            obligations: [
                'Obligations de sécurité de base selon l\'article 21 de la Directive NIS2',
                'Respect des mesures de gestion des risques proportionnées à votre taille',
                'Veille cyber réglementaire via le Centre pour la Cybersécurité belge (CCB)'
            ],
            timeline: 'La transposition belge est effective depuis octobre 2024. Aucune obligation de signalement 24h ne s\'applique à votre catégorie, sauf incident majeur.',
            accountability: 'Responsabilité des dirigeants encadrée par le droit commun. Pas de sanctions administratives spécifiques NIS2, mais diligence requise.',
            positioning: 'Opportunité de structurer progressivement votre gouvernance cyber pour anticiper l\'évolution réglementaire et rassurer vos parties prenantes.'
        },
        'tier-2': {
            label: 'Exposition Importante',
            title: 'Niveau 2 : Entité Importante - Obligations Renforcées',
            implications: 'Votre structure relève potentiellement de la catégorie "Entité Importante" au sens de l\'Annexe III de la Directive NIS2. Des obligations spécifiques s\'appliquent.',
            obligations: [
                'Signalement des incidents significatifs au CCB dans les 24 heures (article 23)',
                'Mise en place de mesures de gestion des risques cyber (article 21)',
                'Sécurisation de la chaîne d\'approvisionnement (article 21)',
                'Audit de conformité périodique et documentation des mesures'
            ],
            timeline: 'Entrée en vigueur immédiate depuis la transposition belge d\'octobre 2024. Première évaluation réglementaire attendue sous 12 mois.',
            accountability: 'Responsabilité renforcée des dirigeants. Sanctions administratives jusqu\'à 1,4% du CA mondial ou 7M€ selon la loi belge.',
            positioning: 'Une structuration rapide de votre SMSI (Système de Management de la Sécurité de l\'Information) est recommandée pour démontrer votre conformité proactive.'
        },
        'tier-3': {
            label: 'Exposition Critique',
            title: 'Niveau 3 : Exposition Élevée - Conformité Prioritaire',
            implications: 'Votre structure présente une exposition élevée aux obligations NIS2, potentiellement en tant qu\'Entité Essentielle ou Importante à haut risque. Une action immédiate est requise.',
            obligations: [
                'Obligation de signalement 24h au CCB pour tout incident significatif',
                'Audit de conformité annuel par un tiers accrédité',
                'Mesures de sécurité strictes : gestion des accès, chiffrement, MFA, plans de continuité',
                'Due diligence sur les fournisseurs critiques et chaîne d\'approvisionnement',
                'Documentation exigible des mesures de gestion des risques'
            ],
            timeline: 'Conformité immédiate requise. La loi belge du 7 avril 2024 est applicable. Contrôles du CCB en cours de déploiement.',
            accountability: 'Responsabilité personnelle des dirigeants exposée. Sanctions pénales et administratives sévères (jusqu\'à 10M€ ou 2% du CA mondial).',
            positioning: 'La mise en conformité NIS2 constitue une priorité stratégique. Une approche structurée, potentiellement via certification ISO 27001, est fortement recommandée pour atténuer les risques juridiques et opérationnels.'
        }
    };
    
    const data = tiers[tier];
    
    // Update badge
    tierBadge.textContent = data.label;
    tierBadge.className = `tier-badge ${tier}`;
    
    // Generate HTML content
    return `
        <div class="result-section">
            <h4>📋 Implications légales</h4>
            <p><strong>${data.title}</strong></p>
            <p>${data.implications}</p>
        </div>
        
        <div class="result-section">
            <h4>⚖️ Obligations réglementaires</h4>
            <ul>
                ${data.obligations.map(obs => `<li>${obs}</li>`).join('')}
            </ul>
        </div>
        
        <div class="result-section">
            <h4>📅 Calendrier d'application</h4>
            <p>${data.timeline}</p>
        </div>
        
        <div class="result-section">
            <h4>👔 Responsabilité des dirigeants</h4>
            <p>${data.accountability}</p>
        </div>
        
        <div class="result-section">
            <h4>🎯 Recommandation stratégique</h4>
            <p>${data.positioning}</p>
        </div>
    `;
}

/**
 * Calculate results and display
 */
function calculateAndShowResults() {
    const tier = calculateTier();
    const content = generateResults(tier);
    
    resultContent.innerHTML = content;
    goToStep(5);
}

/**
 * Restart assessment
 */
function restartAssessment() {
    // Reset state
    state.answers = {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    };
    
    // Reset UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.checkbox-input').forEach(cb => {
        cb.checked = false;
    });
    
    // Go to step 1
    goToStep(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Ensure step 1 is visible
    goToStep(1);
});
