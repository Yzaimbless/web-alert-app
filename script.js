// ============================================
// ALERT DATA MANAGEMENT
// ============================================

// Alert storage key
const ALERTS_STORAGE_KEY = 'darty_alerts';
const EMAIL_CONFIG_KEY = 'emailjs_config';

// Generate realistic Darty business alerts
function generateDartyAlerts() {
    const alertTypes = [
        { type: 'Livraison retardée', priority: 'high' },
        { type: 'Stock faible', priority: 'medium' },
        { type: 'Commande en attente', priority: 'low' },
        { type: 'Client VIP', priority: 'high' },
        { type: 'Retour produit', priority: 'medium' },
        { type: 'Garantie expirée', priority: 'low' },
        { type: 'Paiement en attente', priority: 'high' },
        { type: 'Service après-vente', priority: 'medium' },
        { type: 'Installation requise', priority: 'low' },
        { type: 'Réclamation client', priority: 'high' }
    ];

    const products = [
        'Réfrigérateur Samsung',
        'Lave-linge Bosch',
        'TV LG OLED 55"',
        'Four encastrable Whirlpool',
        'Aspirateur Dyson',
        'Lave-vaisselle Siemens',
        'Micro-ondes Panasonic',
        'Cafetière Nespresso',
        'Robot KitchenAid',
        'Climatiseur Daikin'
    ];

    const stores = [
        'Darty Paris 15ème',
        'Darty Lyon Part-Dieu',
        'Darty Marseille',
        'Darty Toulouse',
        'Darty Bordeaux',
        'Darty Lille',
        'Darty Nantes',
        'Darty Strasbourg',
        'Darty Nice',
        'Darty Rennes'
    ];

    const alerts = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const store = stores[Math.floor(Math.random() * stores.length)];
        const orderId = `CMD-${String(i + 1000).padStart(6, '0')}`;
        
        // Create timestamp (random within last 7 days)
        const daysAgo = Math.floor(Math.random() * 7);
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        alerts.push({
            id: i + 1,
            title: `${alertType.type} - ${orderId}`,
            content: `${product} | ${store}`,
            priority: alertType.priority,
            status: 'pending',
            timestamp: timestamp.toISOString(),
            source: 'system'
        });
    }

    return alerts;
}

// Initialize or load alerts from localStorage
function initializeAlerts() {
    let alerts = loadAlerts();
    if (!alerts || alerts.length === 0) {
        alerts = generateDartyAlerts();
        saveAlerts(alerts);
    }
    return alerts;
}

// Save alerts to localStorage
function saveAlerts(alerts) {
    try {
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
        console.error('Error saving alerts:', error);
    }
}

// Load alerts from localStorage
function loadAlerts() {
    try {
        const data = localStorage.getItem(ALERTS_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading alerts:', error);
        return null;
    }
}

// ============================================
// TRIAGE FUNCTIONALITY
// ============================================

// Sort alerts by priority (high -> medium -> low)
function sortAlertsByPriority(alerts, ascending = false) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...alerts].sort((a, b) => {
        const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return ascending ? -diff : diff;
    });
}

// Sort alerts by status
function sortAlertsByStatus(alerts) {
    const statusOrder = { pending: 1, sent: 2, error: 3 };
    return [...alerts].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

// Sort alerts by date (newest first)
function sortAlertsByDate(alerts, newest = true) {
    return [...alerts].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return newest ? dateB - dateA : dateA - dateB;
    });
}

// Filter alerts by priority
function filterAlertsByPriority(alerts, priority) {
    if (!priority || priority === 'all') return alerts;
    return alerts.filter(alert => alert.priority === priority);
}

// Filter alerts by status
function filterAlertsByStatus(alerts, status) {
    if (!status || status === 'all') return alerts;
    return alerts.filter(alert => alert.status === status);
}

// ============================================
// MERGE FUNCTIONALITY
// ============================================

// Merge new alerts with existing ones (avoiding duplicates)
function mergeAlerts(existingAlerts, newAlerts) {
    const merged = [...existingAlerts];
    const existingIds = new Set(existingAlerts.map(a => a.id));
    
    newAlerts.forEach(alert => {
        if (!existingIds.has(alert.id)) {
            merged.push(alert);
        }
    });
    
    return merged;
}

// Merge alerts from Excel import
function mergeExcelAlerts(excelAlerts) {
    const currentAlerts = loadAlerts() || [];
    const merged = mergeAlerts(currentAlerts, excelAlerts);
    saveAlerts(merged);
    displayAlerts(merged);
    return merged;
}

// ============================================
// DISPLAY FUNCTIONALITY
// ============================================

// Format French date/time
function formatFrenchDateTime(dateString) {
    const date = new Date(dateString);
    const dateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', dateOptions);
}

// Display alerts in the grid
function displayAlerts(alerts = null) {
    if (!alerts) {
        alerts = loadAlerts() || generateDartyAlerts();
    }

    const grid = document.getElementById('alerts-grid');
    if (!grid) return;

    grid.innerHTML = '';

    alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        grid.appendChild(alertElement);
    });
}

// Create a single alert element
function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert-item priority-${alert.priority}`;
    div.setAttribute('data-id', alert.id);

    const statusClass = `status-${alert.status}`;
    const statusText = {
        pending: 'En attente',
        sent: 'Envoyé',
        error: 'Erreur'
    }[alert.status] || 'En attente';

    div.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-status ${statusClass}">${statusText}</div>
        </div>
        <div class="alert-content">${alert.content}</div>
        <div class="alert-timestamp">${formatFrenchDateTime(alert.timestamp)}</div>
    `;

    return div;
}

// ============================================
// EXCEL FILE PROCESSING
// ============================================

// Read and process CSV file (simpler, no external library needed)
async function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const alerts = [];
                let alertId = Date.now();
                
                // Parse CSV
                lines.forEach((line, rowIndex) => {
                    if (line.trim()) {
                        const cells = line.split(/[,;\t]/); // Support comma, semicolon, or tab delimiters
                        
                        cells.forEach((cell, colIndex) => {
                            const cellValue = cell.trim().toLowerCase();
                            
                            // Detect keywords for alert generation
                            const keywords = ['urgent', 'critique', 'important', 'alerte', 'problème', 'erreur'];
                            const hasKeyword = keywords.some(keyword => cellValue.includes(keyword));
                            
                            if (hasKeyword) {
                                const priority = 
                                    cellValue.includes('urgent') || cellValue.includes('critique') ? 'high' :
                                    cellValue.includes('important') || cellValue.includes('alerte') ? 'medium' : 'low';
                                
                                const cellAddress = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
                                
                                alerts.push({
                                    id: alertId++,
                                    title: `Import CSV - ${cellAddress}`,
                                    content: `${file.name} | ${cell.trim()}`,
                                    priority: priority,
                                    status: 'pending',
                                    timestamp: new Date().toISOString(),
                                    source: 'csv'
                                });
                            }
                        });
                    }
                });
                
                resolve({ alerts, sheetCount: 1 });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsText(file);
    });
}

// Read and process Excel file (requires XLSX library)
async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        // Check if XLSX library is available
        if (typeof XLSX === 'undefined') {
            reject(new Error('Bibliothèque XLSX non disponible. Veuillez utiliser un fichier CSV à la place.'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const alerts = [];
                let alertId = Date.now();
                
                // Process each sheet
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                    
                    // Read all cells
                    for (let row = range.s.r; row <= range.e.r; row++) {
                        for (let col = range.s.c; col <= range.e.c; col++) {
                            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                            const cell = worksheet[cellAddress];
                            
                            if (cell && cell.v) {
                                const cellValue = String(cell.v).toLowerCase();
                                
                                // Detect keywords for alert generation
                                const keywords = ['urgent', 'critique', 'important', 'alerte', 'problème', 'erreur'];
                                const hasKeyword = keywords.some(keyword => cellValue.includes(keyword));
                                
                                if (hasKeyword) {
                                    const priority = 
                                        cellValue.includes('urgent') || cellValue.includes('critique') ? 'high' :
                                        cellValue.includes('important') || cellValue.includes('alerte') ? 'medium' : 'low';
                                    
                                    alerts.push({
                                        id: alertId++,
                                        title: `Import Excel - ${cellAddress}`,
                                        content: `${sheetName} | ${cell.v}`,
                                        priority: priority,
                                        status: 'pending',
                                        timestamp: new Date().toISOString(),
                                        source: 'excel'
                                    });
                                }
                            }
                        }
                    }
                });
                
                resolve({ alerts, sheetCount: workbook.SheetNames.length });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// ============================================
// EMAIL FUNCTIONALITY
// ============================================

// Send alerts via email (EmailJS integration)
async function sendAlertsEmail() {
    const modal = document.getElementById('email-modal');
    modal.style.display = 'block';
}

// Save email configuration
function saveEmailConfig(config) {
    try {
        localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.error('Error saving email config:', error);
    }
}

// Load email configuration
function loadEmailConfig() {
    try {
        const data = localStorage.getItem(EMAIL_CONFIG_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading email config:', error);
        return null;
    }
}

// Process email sending
async function processEmailSending(config) {
    const alerts = loadAlerts();
    const pendingAlerts = alerts.filter(a => a.status === 'pending');
    
    if (pendingAlerts.length === 0) {
        alert('Aucune alerte en attente à envoyer.');
        return;
    }

    // Simulate sending emails in batches
    const batchSize = 5;
    let sent = 0;
    let errors = 0;

    for (let i = 0; i < pendingAlerts.length; i += batchSize) {
        const batch = pendingAlerts.slice(i, i + batchSize);
        
        for (const alert of batch) {
            // Simulate 90% success rate
            const success = Math.random() < 0.9;
            alert.status = success ? 'sent' : 'error';
            if (success) sent++;
            else errors++;
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    saveAlerts(alerts);
    displayAlerts(alerts);
    
    alert(`Envoi terminé!\nEnvoyés: ${sent}\nErreurs: ${errors}`);
}

// ============================================
// UI CONTROLS AND INITIALIZATION
// ============================================

// Add triage controls to the UI
function addTriageControls() {
    const header = document.querySelector('#status30 .tab-header');
    if (!header) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'triage-controls';
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '10px';
    controlsDiv.style.alignItems = 'center';
    controlsDiv.style.flexWrap = 'wrap';

    controlsDiv.innerHTML = `
        <label style="font-weight: bold; margin-right: 5px;">Trier par:</label>
        <select id="sort-select" style="padding: 8px; border-radius: 5px; border: 2px solid #ddd; cursor: pointer;">
            <option value="priority">Priorité (Haute → Basse)</option>
            <option value="priority-asc">Priorité (Basse → Haute)</option>
            <option value="date">Date (Récent → Ancien)</option>
            <option value="date-asc">Date (Ancien → Récent)</option>
            <option value="status">Statut</option>
        </select>
        
        <label style="font-weight: bold; margin-left: 15px; margin-right: 5px;">Filtrer:</label>
        <select id="filter-priority" style="padding: 8px; border-radius: 5px; border: 2px solid #ddd; cursor: pointer;">
            <option value="all">Toutes priorités</option>
            <option value="high">Haute priorité</option>
            <option value="medium">Priorité moyenne</option>
            <option value="low">Basse priorité</option>
        </select>
        
        <select id="filter-status" style="padding: 8px; border-radius: 5px; border: 2px solid #ddd; cursor: pointer;">
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="sent">Envoyé</option>
            <option value="error">Erreur</option>
        </select>
        
        <button id="reset-filters" class="process-button" style="padding: 8px 16px; font-size: 14px;">Réinitialiser</button>
    `;

    // Insert after the h2 but before the send button
    const h2 = header.querySelector('h2');
    h2.after(controlsDiv);
}

// Apply triage filters
function applyTriageFilters() {
    let alerts = loadAlerts();
    
    // Apply filters
    const priorityFilter = document.getElementById('filter-priority')?.value;
    const statusFilter = document.getElementById('filter-status')?.value;
    
    alerts = filterAlertsByPriority(alerts, priorityFilter);
    alerts = filterAlertsByStatus(alerts, statusFilter);
    
    // Apply sorting
    const sortBy = document.getElementById('sort-select')?.value;
    switch (sortBy) {
        case 'priority':
            alerts = sortAlertsByPriority(alerts, false);
            break;
        case 'priority-asc':
            alerts = sortAlertsByPriority(alerts, true);
            break;
        case 'date':
            alerts = sortAlertsByDate(alerts, true);
            break;
        case 'date-asc':
            alerts = sortAlertsByDate(alerts, false);
            break;
        case 'status':
            alerts = sortAlertsByStatus(alerts);
            break;
    }
    
    displayAlerts(alerts);
}

// Initialize the application
function initializeApp() {
    // Load XLSX library from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = function() {
        console.log('XLSX library loaded successfully');
    };
    document.head.appendChild(script);

    // Initialize alerts
    const alerts = initializeAlerts();
    displayAlerts(alerts);
    
    // Add triage controls
    addTriageControls();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        const currentAlerts = loadAlerts();
        if (currentAlerts) {
            saveAlerts(currentAlerts);
        }
    }, 30000);
}

// Setup all event listeners
function setupEventListeners() {
    // Send alerts button
    const sendButton = document.getElementById('send-alerts');
    if (sendButton) {
        sendButton.addEventListener('click', sendAlertsEmail);
    }
    
    // Email modal
    const modal = document.getElementById('email-modal');
    const closeBtn = modal?.querySelector('.close');
    const emailForm = document.getElementById('email-config');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const config = {
                serviceId: document.getElementById('emailjs-service').value,
                templateId: document.getElementById('emailjs-template').value,
                userId: document.getElementById('emailjs-user').value,
                recipientEmail: document.getElementById('recipient-email').value
            };
            
            saveEmailConfig(config);
            modal.style.display = 'none';
            
            await processEmailSending(config);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Excel file input
    const fileInput = document.getElementById('excel-file');
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    const processButton = document.getElementById('process-file');
    const processingStatus = document.getElementById('processing-status');
    
    let selectedFile = null;
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                fileInfo.style.display = 'block';
                // Clear previous content
                fileDetails.innerHTML = '';
                
                // Create elements safely without innerHTML to avoid XSS
                const nameP = document.createElement('p');
                nameP.innerHTML = '<strong>Nom:</strong> ';
                nameP.appendChild(document.createTextNode(selectedFile.name));
                
                const sizeP = document.createElement('p');
                sizeP.innerHTML = '<strong>Taille:</strong> ';
                sizeP.appendChild(document.createTextNode(`${(selectedFile.size / 1024).toFixed(2)} KB`));
                
                const typeP = document.createElement('p');
                typeP.innerHTML = '<strong>Type:</strong> ';
                typeP.appendChild(document.createTextNode(selectedFile.type || 'Non détecté'));
                
                fileDetails.appendChild(nameP);
                fileDetails.appendChild(sizeP);
                fileDetails.appendChild(typeP);
            }
        });
    }
    
    if (processButton) {
        processButton.addEventListener('click', async () => {
            if (!selectedFile) return;
            
            processingStatus.innerHTML = '<div class="processing-status info">Traitement en cours...</div>';
            
            try {
                let result;
                const fileName = selectedFile.name.toLowerCase();
                
                // Determine file type and process accordingly
                if (fileName.endsWith('.csv')) {
                    result = await readCSVFile(selectedFile);
                } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    result = await readExcelFile(selectedFile);
                } else {
                    throw new Error('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
                }
                
                if (result.alerts.length > 0) {
                    const merged = mergeExcelAlerts(result.alerts);
                    processingStatus.innerHTML = `
                        <div class="processing-status success">
                            <strong>Succès!</strong><br>
                            ${result.alerts.length} alertes trouvées et fusionnées.<br>
                            ${result.sheetCount} feuille(s) traitée(s).<br>
                            Total des alertes: ${merged.length}
                        </div>
                    `;
                    
                    // Switch to Status 30 tab to show results
                    setTimeout(() => {
                        document.querySelector('.tab-button').click();
                        applyTriageFilters();
                    }, 2000);
                } else {
                    processingStatus.innerHTML = `
                        <div class="processing-status info">
                            Aucune alerte trouvée dans le fichier.<br>
                            ${result.sheetCount} feuille(s) traitée(s).<br>
                            Recherche de mots-clés: urgent, critique, important, alerte, problème, erreur.
                        </div>
                    `;
                }
            } catch (error) {
                processingStatus.innerHTML = `
                    <div class="processing-status error">
                        <strong>Erreur:</strong> ${error.message}<br>
                        Formats supportés: .xlsx, .xls (nécessite chargement de bibliothèque), .csv (recommandé)
                    </div>
                `;
                console.error('Error processing file:', error);
            }
        });
    }
    
    // Triage controls
    const sortSelect = document.getElementById('sort-select');
    const filterPriority = document.getElementById('filter-priority');
    const filterStatus = document.getElementById('filter-status');
    const resetButton = document.getElementById('reset-filters');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', applyTriageFilters);
    }
    
    if (filterPriority) {
        filterPriority.addEventListener('change', applyTriageFilters);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', applyTriageFilters);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (sortSelect) sortSelect.value = 'priority';
            if (filterPriority) filterPriority.value = 'all';
            if (filterStatus) filterStatus.value = 'all';
            applyTriageFilters();
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}