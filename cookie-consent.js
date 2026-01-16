/**
 * Cookie Consent Manager for 7D - Carlos Fazenda Arquitectos
 * GDPR-compliant cookie consent banner and preferences management
 */

(function() {
    'use strict';

    // Configuration
    const COOKIE_NAME = 'cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;

    // Cookie consent manager
    const CookieConsent = {
        // Initialize
        init: function() {
            // Only show banner on sobre.html and site.html (which contains sobre section)
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const allowedPages = ['sobre.html', 'site.html'];

            if (!allowedPages.includes(currentPage)) {
                // Still inject styles and create modal for "manage preferences" links
                this.injectStyles();
                this.createPreferencesModal();
                this.setupGlobalFunction();
                return;
            }

            this.injectStyles();
            this.createBanner();
            this.createPreferencesModal();
            this.checkConsent();
            this.setupGlobalFunction();
        },

        // Inject CSS styles
        injectStyles: function() {
            const style = document.createElement('style');
            style.textContent = `
                /* Cookie Banner */
                .cookie-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #1a1a1a;
                    color: #fff;
                    padding: 1.5rem 2rem;
                    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    display: none;
                    animation: slideUp 0.3s ease-out;
                }

                .cookie-banner.show {
                    display: block;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .cookie-banner-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    justify-content: space-between;
                }

                .cookie-banner-text {
                    flex: 1;
                }

                .cookie-banner-text h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                }

                .cookie-banner-text p {
                    font-size: 0.85rem;
                    line-height: 1.6;
                    opacity: 0.9;
                }

                .cookie-banner-text a {
                    color: #fff;
                    text-decoration: underline;
                }

                .cookie-banner-text a:hover {
                    opacity: 0.8;
                }

                .cookie-banner-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .cookie-btn {
                    padding: 0.75rem 1.5rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .cookie-btn-primary {
                    background: #fff;
                    color: #1a1a1a;
                }

                .cookie-btn-primary:hover {
                    background: #f5f5f5;
                }

                .cookie-btn-secondary {
                    background: transparent;
                    color: #fff;
                    border: 1px solid #fff;
                }

                .cookie-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                /* Cookie Preferences Modal */
                .cookie-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10001;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    overflow-y: auto;
                }

                .cookie-modal.show {
                    display: flex;
                }

                .cookie-modal-content {
                    background: #fff;
                    max-width: 700px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    animation: modalFadeIn 0.3s ease-out;
                }

                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .cookie-modal-header {
                    padding: 2rem;
                    border-bottom: 1px solid #e0e0e0;
                    position: sticky;
                    top: 0;
                    background: #fff;
                    z-index: 1;
                }

                .cookie-modal-header h2 {
                    font-size: 1.5rem;
                    font-weight: 300;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }

                .cookie-modal-header p {
                    font-size: 0.9rem;
                    color: #666;
                    line-height: 1.6;
                }

                .cookie-modal-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.3s ease;
                }

                .cookie-modal-close:hover {
                    color: #1a1a1a;
                }

                .cookie-modal-body {
                    padding: 2rem;
                }

                .cookie-category {
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .cookie-category:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .cookie-category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .cookie-category-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .cookie-category-description {
                    font-size: 0.85rem;
                    line-height: 1.6;
                    color: #666;
                }

                .cookie-toggle {
                    position: relative;
                    width: 50px;
                    height: 26px;
                }

                .cookie-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .cookie-toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.3s;
                    border-radius: 26px;
                }

                .cookie-toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }

                .cookie-toggle input:checked + .cookie-toggle-slider {
                    background-color: #1a1a1a;
                }

                .cookie-toggle input:checked + .cookie-toggle-slider:before {
                    transform: translateX(24px);
                }

                .cookie-toggle input:disabled + .cookie-toggle-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cookie-required {
                    font-size: 0.7rem;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .cookie-modal-footer {
                    padding: 1.5rem 2rem;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    position: sticky;
                    bottom: 0;
                    background: #fff;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .cookie-banner {
                        padding: 1.5rem;
                    }

                    .cookie-banner-content {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .cookie-banner-buttons {
                        width: 100%;
                        flex-direction: column;
                    }

                    .cookie-btn {
                        width: 100%;
                        text-align: center;
                    }

                    .cookie-modal {
                        padding: 1rem;
                    }

                    .cookie-modal-header,
                    .cookie-modal-body,
                    .cookie-modal-footer {
                        padding: 1.5rem;
                    }

                    .cookie-modal-footer {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        // Create banner HTML
        createBanner: function() {
            const banner = document.createElement('div');
            banner.className = 'cookie-banner';
            banner.id = 'cookie-banner';
            banner.innerHTML = `
                <div class="cookie-banner-content">
                    <div class="cookie-banner-text">
                        <h3>Este website utiliza cookies</h3>
                        <p>Utilizamos cookies para melhorar a sua experiência de navegação, personalizar conteúdo e analisar o tráfego do website. Ao clicar em "Aceitar Todos", consente a utilização de todos os cookies. Para mais informações, consulte a nossa <a href="cookie-policy.html">Política de Cookies</a> e <a href="privacy-policy.html">Política de Privacidade</a>.</p>
                    </div>
                    <div class="cookie-banner-buttons">
                        <button class="cookie-btn cookie-btn-secondary" onclick="CookieConsent.showPreferences()">Personalizar</button>
                        <button class="cookie-btn cookie-btn-secondary" onclick="CookieConsent.acceptNecessary()">Apenas Necessários</button>
                        <button class="cookie-btn cookie-btn-primary" onclick="CookieConsent.acceptAll()">Aceitar Todos</button>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        },

        // Create preferences modal HTML
        createPreferencesModal: function() {
            const modal = document.createElement('div');
            modal.className = 'cookie-modal';
            modal.id = 'cookie-preferences-modal';
            modal.innerHTML = `
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h2>Preferências de Cookies</h2>
                        <p>Gerencie as suas preferências de cookies. Pode ativar ou desativar diferentes categorias de cookies abaixo.</p>
                        <button class="cookie-modal-close" onclick="CookieConsent.hidePreferences()">&times;</button>
                    </div>
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h3>Cookies Necessários</h3>
                                <div>
                                    <span class="cookie-required">Sempre Ativos</span>
                                </div>
                            </div>
                            <p class="cookie-category-description">
                                Estes cookies são essenciais para o funcionamento do website e não podem ser desativados. São geralmente configurados em resposta a ações que correspondem a uma solicitação de serviços, como definir as suas preferências de privacidade ou preencher formulários.
                            </p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h3>Cookies de Análise</h3>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="analytics-cookies" onchange="CookieConsent.updatePreference('analytics', this.checked)">
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-description">
                                Estes cookies permitem-nos contar visitas e fontes de tráfego para medir e melhorar o desempenho do nosso website. Ajudam-nos a saber quais as páginas mais e menos populares e a ver como os visitantes se movem pelo website.
                            </p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h3>Cookies de Funcionalidade</h3>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="functional-cookies" onchange="CookieConsent.updatePreference('functional', this.checked)">
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-description">
                                Estes cookies permitem que o website forneça funcionalidades melhoradas e personalização, como recordar as suas preferências de idioma ou região.
                            </p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h3>Cookies de Marketing</h3>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="marketing-cookies" onchange="CookieConsent.updatePreference('marketing', this.checked)">
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-description">
                                Estes cookies podem ser definidos através do nosso website pelos nossos parceiros de publicidade. Podem ser usados para construir um perfil sobre os seus interesses e mostrar-lhe anúncios relevantes noutros websites.
                            </p>
                        </div>
                    </div>
                    <div class="cookie-modal-footer">
                        <button class="cookie-btn cookie-btn-secondary" onclick="CookieConsent.acceptNecessary()">Apenas Necessários</button>
                        <button class="cookie-btn cookie-btn-primary" onclick="CookieConsent.savePreferences()">Guardar Preferências</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    CookieConsent.hidePreferences();
                }
            });
        },

        // Check if consent exists
        checkConsent: function() {
            const consent = this.getConsent();
            if (!consent) {
                this.showBanner();
            } else {
                this.applyConsent(consent);
            }
        },

        // Show banner
        showBanner: function() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.add('show');
            }
        },

        // Hide banner
        hideBanner: function() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.remove('show');
            }
        },

        // Show preferences modal
        showPreferences: function() {
            const modal = document.getElementById('cookie-preferences-modal');
            if (modal) {
                modal.classList.add('show');
                this.loadPreferences();
            }
        },

        // Hide preferences modal
        hidePreferences: function() {
            const modal = document.getElementById('cookie-preferences-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        },

        // Load current preferences into modal
        loadPreferences: function() {
            const consent = this.getConsent() || {
                necessary: true,
                analytics: false,
                functional: false,
                marketing: false
            };

            document.getElementById('analytics-cookies').checked = consent.analytics;
            document.getElementById('functional-cookies').checked = consent.functional;
            document.getElementById('marketing-cookies').checked = consent.marketing;
        },

        // Temporary storage for preferences being edited
        tempPreferences: {
            necessary: true,
            analytics: false,
            functional: false,
            marketing: false
        },

        // Update temporary preference
        updatePreference: function(category, value) {
            this.tempPreferences[category] = value;
        },

        // Save preferences
        savePreferences: function() {
            this.setConsent(this.tempPreferences);
            this.applyConsent(this.tempPreferences);
            this.hidePreferences();
            this.hideBanner();
        },

        // Accept all cookies
        acceptAll: function() {
            const consent = {
                necessary: true,
                analytics: true,
                functional: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            this.setConsent(consent);
            this.applyConsent(consent);
            this.hideBanner();
        },

        // Accept only necessary cookies
        acceptNecessary: function() {
            const consent = {
                necessary: true,
                analytics: false,
                functional: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            this.setConsent(consent);
            this.applyConsent(consent);
            this.hideBanner();
            this.hidePreferences();
        },

        // Get consent from cookie
        getConsent: function() {
            const cookie = document.cookie
                .split('; ')
                .find(row => row.startsWith(COOKIE_NAME + '='));

            if (!cookie) return null;

            try {
                return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
            } catch (e) {
                return null;
            }
        },

        // Set consent cookie
        setConsent: function(consent) {
            consent.timestamp = new Date().toISOString();
            const expires = new Date();
            expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);
            document.cookie = COOKIE_NAME + '=' + encodeURIComponent(JSON.stringify(consent)) +
                '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';
        },

        // Apply consent (load scripts based on consent)
        applyConsent: function(consent) {
            // Analytics cookies (Google Analytics example)
            if (consent.analytics) {
                // Load Google Analytics or other analytics scripts
                // Example: this.loadGoogleAnalytics();
                console.log('Analytics cookies enabled');
            }

            // Functional cookies
            if (consent.functional) {
                console.log('Functional cookies enabled');
            }

            // Marketing cookies
            if (consent.marketing) {
                console.log('Marketing cookies enabled');
            }
        },

        // Setup global function for cookie preferences
        setupGlobalFunction: function() {
            window.showCookiePreferences = function() {
                CookieConsent.showPreferences();
            };
        }
    };

    // Make CookieConsent globally accessible
    window.CookieConsent = CookieConsent;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            CookieConsent.init();
        });
    } else {
        CookieConsent.init();
    }
})();
