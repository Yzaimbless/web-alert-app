// ========================================
// Global Variables and Configuration
// ========================================
let alerts = [];
let autoSaveInterval = null;

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Save data before user leaves the page
window.addEventListener('beforeunload', function() {
    saveAlertsToStorage();
});

function initializeApp() {
    // Load saved data
    loadAlertsFromStorage();
    
    // Generate initial alerts if none exist
    if (alerts.length === 0) {
        alerts = getDartyAlerts();
        saveAlertsToStorage();
    }
    
    // Render alerts
    renderAlerts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-save every 30 seconds
    autoSaveInterval = setInterval(saveAlertsToStorage, 30000);
    
    console.log('Application initialized successfully');
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // File Upload
    const fileInput = document.getElementById('excel-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Process File Button
    const processBtn = document.getElementById('process-file');
    if (processBtn) {
        processBtn.addEventListener('click', handleProcessFile);
    }
}

// ========================================
// Real Business Alerts Generation
// ========================================
function getDartyAlerts() {
    const alertTypes = [
        { title: 'URGENCE - Panne système critique', priority: 'high', message: 'Système de paiement hors service - intervention immédiate requise', statusCode: 80, lieuHs: 'Paris Centre', centreHs: 'Centre IT', ageProduct: '6 mois', panne: 'Serveur principal défaillant', tiersFournisseur: 'TechCorp Solutions' },
        { title: 'Stock faible - Réfrigérateurs', priority: 'high', message: 'Stock critique sur les réfrigérateurs modèle XR500', statusCode: 70, lieuHs: 'Lyon Nord', centreHs: 'Centre Logistique', ageProduct: '3 mois', panne: 'Rupture stock fournisseur', tiersFournisseur: 'Samsung Electronics' },
        { title: 'Retard de livraison - TV Samsung', priority: 'high', message: 'Commande #45678 en retard de 3 jours', statusCode: 70, lieuHs: 'Marseille Est', centreHs: 'Centre Distribution', ageProduct: '1 mois', panne: 'Retard transporteur', tiersFournisseur: 'DHL Express' },
        { title: 'Maintenance préventive', priority: 'medium', message: 'Maintenance planifiée pour le système de caisse central', statusCode: 30, lieuHs: 'Paris Sud', centreHs: 'Centre Maintenance', ageProduct: '2 ans', panne: 'Maintenance programmée', tiersFournisseur: 'Système Retail Pro' },
        { title: 'Nouvelle promotion - Lave-linge', priority: 'low', message: 'Lancement de la promotion sur les lave-linge Bosch', statusCode: 20, lieuHs: 'Toulouse Ouest', centreHs: 'Centre Commercial', ageProduct: '2 semaines', panne: 'N/A', tiersFournisseur: 'Bosch France' },
        { title: 'Réclamation client - SAV', priority: 'high', message: 'Client insatisfait - Dossier #12345 nécessite attention urgente', statusCode: 70, lieuHs: 'Nice Centre', centreHs: 'Centre SAV', ageProduct: '8 mois', panne: 'Produit défectueux', tiersFournisseur: 'LG Electronics' },
        { title: 'Inventaire mensuel', priority: 'medium', message: 'Rappel: inventaire à réaliser avant fin de semaine', statusCode: 30, lieuHs: 'Bordeaux Nord', centreHs: 'Centre Stock', ageProduct: '5 mois', panne: 'N/A', tiersFournisseur: 'N/A' },
        { title: 'Formation équipe', priority: 'low', message: 'Session de formation sur nouveaux produits mercredi 14h', statusCode: 20, lieuHs: 'Lille Sud', centreHs: 'Centre Formation', ageProduct: 'N/A', panne: 'N/A', tiersFournisseur: 'N/A' },
        { title: 'Alerte sécurité', priority: 'high', message: 'Mise à jour de sécurité requise pour le système informatique', statusCode: 70, lieuHs: 'Strasbourg Est', centreHs: 'Centre Sécurité', ageProduct: '1 an', panne: 'Vulnérabilité détectée', tiersFournisseur: 'Microsoft France' },
        { title: 'Commande fournisseur', priority: 'medium', message: 'Validation nécessaire pour commande matériel bureau', statusCode: 30, lieuHs: 'Nantes Ouest', centreHs: 'Centre Achats', ageProduct: '4 mois', panne: 'N/A', tiersFournisseur: 'Office Depot' },
        { title: 'Réunion d\'équipe', priority: 'low', message: 'Réunion hebdomadaire prévue lundi 9h', statusCode: 20, lieuHs: 'Rennes Centre', centreHs: 'Centre Administration', ageProduct: 'N/A', panne: 'N/A', tiersFournisseur: 'N/A' }
    ];
    
    const generatedAlerts = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const alertType = alertTypes[i % alertTypes.length];
        const timestamp = new Date(now.getTime() - (i * 3600000)); // Offset each alert by 1 hour
        
        generatedAlerts.push({
            id: `alert-${Date.now()}-${i}`,
            numero: i + 1, // Alert number
            title: `${alertType.title} #${i + 1}`,
            message: alertType.message,
            priority: alertType.priority,
            status: 'pending', // pending, sent, error
            statusCode: alertType.statusCode, // Status code (20, 30, 70, 80)
            lieuHs: alertType.lieuHs, // Location
            centreHs: alertType.centreHs, // Center
            ageProduct: alertType.ageProduct, // Product age
            panne: alertType.panne, // Failure description
            tiersFournisseur: alertType.tiersFournisseur, // Third-party supplier
            timestamp: timestamp.toISOString(),
            sentAt: null
        });
    }
    
    return generatedAlerts;
}

// ========================================
// Excel Export Functionality
// ========================================
function exportAlertsToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('La bibliothèque Excel n\'est pas disponible. Veuillez rafraîchir la page.');
        return;
    }
    
    // Prepare data for Excel export
    const exportData = alerts.map(alert => ({
        'Numéro': alert.numero || 'N/A',
        'Titre': alert.title || 'N/A',
        'Message': alert.message || 'N/A',
        'Lieu HS': alert.lieuHs || 'N/A',
        'Centre HS': alert.centreHs || 'N/A',
        'Panne': alert.panne || 'N/A',
        'Tiers Fournisseur': alert.tiersFournisseur || 'N/A',
        'Statut': alert.statusCode ? `${alert.statusCode} - ${getStatusCodeLabel(alert.statusCode)}` : 'N/A',
        'Âge Produit': alert.ageProduct || 'N/A',
        'Priorité': getPriorityLabel(alert.priority),
        'État': getStateLabel(alert.status),
        'Date/Heure': formatFrenchDateTime(new Date(alert.timestamp))
    }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
        { wch: 10 },  // Numéro
        { wch: 35 },  // Titre
        { wch: 50 },  // Message
        { wch: 20 },  // Lieu HS
        { wch: 25 },  // Centre HS
        { wch: 30 },  // Panne
        { wch: 30 },  // Tiers Fournisseur
        { wch: 20 },  // Statut
        { wch: 15 },  // Âge Produit
        { wch: 12 },  // Priorité
        { wch: 12 },  // État
        { wch: 30 }   // Date/Heure
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Alertes Darty');
    
    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `alertes_darty_${dateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    alert(`Fichier Excel exporté avec succès: ${filename}`);
}

// Helper function to get status code label
function getStatusCodeLabel(code) {
    switch(code) {
        case 80: return 'Urgence';
        case 70: return 'Critique';
        case 30: return 'Moyen';
        case 20: return 'Faible';
        default: return 'Inconnu';
    }
}

// Helper function to get priority label
function getPriorityLabel(priority) {
    switch(priority) {
        case 'high': return 'Haute';
        case 'medium': return 'Moyenne';
        case 'low': return 'Basse';
        default: return 'Inconnue';
    }
}

// Helper function to get state label
function getStateLabel(state) {
    switch(state) {
        case 'pending': return 'En attente';
        case 'sent': return 'Envoyé';
        case 'error': return 'Erreur';
        default: return 'Inconnu';
    }
}

// ========================================
// Alert Rendering
// ========================================
function renderAlerts() {
    // Apply current filter
    filterByStatus(currentStatusFilter, null);
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert-item priority-${alert.priority}`;
    div.setAttribute('data-alert-id', alert.id);
    div.setAttribute('data-status-code', alert.statusCode || ''); // Add data attribute for CSS styling
    
    const timestamp = new Date(alert.timestamp);
    const formattedTime = formatFrenchDateTime(timestamp);
    
    let statusClass = 'status-pending';
    let statusText = 'En attente';
    
    if (alert.status === 'sent') {
        statusClass = 'status-sent';
        statusText = 'Envoyé';
    } else if (alert.status === 'error') {
        statusClass = 'status-error';
        statusText = 'Erreur';
    }
    
    // Get status code text based on value
    let statusCodeText = '';
    if (alert.statusCode === 80) {
        statusCodeText = 'Urgence (80)';
    } else if (alert.statusCode === 70) {
        statusCodeText = 'Critique (70)';
    } else if (alert.statusCode === 30) {
        statusCodeText = 'Moyen (30)';
    } else if (alert.statusCode === 20) {
        statusCodeText = 'Faible (20)';
    }
    
    div.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">
                <span class="alert-numero">N°${alert.numero || 'N/A'}</span> - ${escapeHtml(alert.title)}
            </div>
            <div class="alert-status ${statusClass}">${statusText}</div>
        </div>
        <div class="alert-content">
            ${escapeHtml(alert.message)}
        </div>
        <div class="alert-details">
            <div class="alert-detail-item">
                <span class="alert-detail-label">📍 Lieu HS:</span>
                <span class="alert-detail-value">${escapeHtml(alert.lieuHs || 'N/A')}</span>
            </div>
            <div class="alert-detail-item">
                <span class="alert-detail-label">🏢 Centre HS:</span>
                <span class="alert-detail-value">${escapeHtml(alert.centreHs || 'N/A')}</span>
            </div>
            <div class="alert-detail-item">
                <span class="alert-detail-label">⚠️ Panne:</span>
                <span class="alert-detail-value">${escapeHtml(alert.panne || 'N/A')}</span>
            </div>
            <div class="alert-detail-item">
                <span class="alert-detail-label">🤝 Tiers Fournisseur:</span>
                <span class="alert-detail-value">${escapeHtml(alert.tiersFournisseur || 'N/A')}</span>
            </div>
            <div class="alert-detail-item">
                <span class="alert-detail-label">⏱️ Âge Produit:</span>
                <span class="alert-detail-value">${escapeHtml(alert.ageProduct || 'N/A')}</span>
            </div>
        </div>
        <div class="alert-footer">
            <div class="alert-status-code">Statut: ${statusCodeText}</div>
            <div class="alert-timestamp">${formattedTime}</div>
        </div>
    `;
    
    return div;
}

// ========================================
// Filter and Organize Alerts by Status
// ========================================
let currentStatusFilter = 'all';

function filterByStatus(status, event) {
    currentStatusFilter = status;
    
    // Update active button state
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Get filtered alerts
    let filteredAlerts = alerts;
    if (status !== 'all') {
        filteredAlerts = alerts.filter(alert => alert.statusCode === parseInt(status));
    }
    
    // Sort by status code (higher priority first) then by timestamp
    filteredAlerts.sort((a, b) => {
        if (b.statusCode !== a.statusCode) {
            return b.statusCode - a.statusCode;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Render filtered alerts
    const alertsGrid = document.getElementById('alerts-grid');
    if (!alertsGrid) return;
    
    alertsGrid.innerHTML = '';
    
    if (filteredAlerts.length === 0) {
        alertsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Aucune alerte pour ce statut</p>';
        updateAlertCount(0);
        return;
    }
    
    filteredAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsGrid.appendChild(alertElement);
    });
    
    // Update the alert count in header
    updateAlertCount(filteredAlerts.length);
    updateStatusCounts();
}

function updateAlertCount(count) {
    const countElement = document.getElementById('alert-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function updateStatusCounts() {
    // Count alerts by status code
    const counts = {
        all: alerts.length,
        '80': alerts.filter(a => a.statusCode === 80).length,
        '70': alerts.filter(a => a.statusCode === 70).length,
        '30': alerts.filter(a => a.statusCode === 30).length,
        '20': alerts.filter(a => a.statusCode === 20).length
    };
    
    // Update count badges
    Object.keys(counts).forEach(status => {
        const countEl = document.getElementById(`count-${status}`);
        if (countEl) {
            countEl.textContent = counts[status];
        }
    });
}

// ========================================
// Date/Time Formatting
// ========================================
function formatFrenchDateTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
    }
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('fr-FR', options);
}

// ========================================
// Excel/CSV File Processing
// ========================================
let currentFile = null;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    currentFile = file;
    
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    
    if (fileInfo && fileDetails) {
        fileDetails.innerHTML = `
            <p><strong>Nom:</strong> ${escapeHtml(file.name)}</p>
            <p><strong>Taille:</strong> ${formatFileSize(file.size)}</p>
            <p><strong>Type:</strong> ${escapeHtml(file.type || 'Non spécifié')}</p>
        `;
        fileInfo.style.display = 'block';
    }
}

function handleProcessFile() {
    if (!currentFile) {
        showProcessingStatus('Aucun fichier sélectionné', 'error');
        return;
    }
    
    // Check file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (currentFile.size > maxFileSize) {
        showProcessingStatus('Fichier trop volumineux (limite: 10MB)', 'error');
        return;
    }
    
    showProcessingStatus('Traitement du fichier en cours...', 'info');
    
    // Check file extension
    const fileName = currentFile.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
        readCSVFile(currentFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        readExcelFile(currentFile);
    } else {
        showProcessingStatus('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv', 'error');
    }
}

function readExcelFile(file) {
    // Check if XLSX library is loaded
    if (typeof XLSX === 'undefined') {
        console.error('XLSX library not loaded');
        showProcessingStatus('Bibliothèque Excel non disponible. Veuillez recharger la page.', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Process all sheets
            const allData = [];
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                jsonData.forEach((row, rowIndex) => {
                    if (row && row.length > 0) {
                        allData.push({
                            sheet: sheetName,
                            row: rowIndex + 1,
                            values: row.map(cell => cell ? String(cell) : '')
                        });
                    }
                });
            });
            
            processFileData(allData, file.name);
        } catch (error) {
            console.error('Error reading Excel file:', error);
            showProcessingStatus(`Erreur lors de la lecture du fichier Excel: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = function() {
        showProcessingStatus('Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

function readCSVFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const data = parseCSV(content);
            processFileData(data, file.name);
        } catch (error) {
            console.error('Error reading CSV:', error);
            showProcessingStatus(`Erreur lors de la lecture du fichier: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = function() {
        showProcessingStatus('Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsText(file);
}

function parseCSV(content) {
    const lines = content.split('\n');
    const result = [];
    
    lines.forEach((line, index) => {
        if (line.trim()) {
            const values = line.split(',').map(v => v.trim());
            result.push({
                row: index + 1,
                values: values
            });
        }
    });
    
    return result;
}

function processFileData(data, fileName) {
    const keywords = ['urgence', 'urgent', 'critique', 'important', 'alerte', 'attention', 'priorité', 'emergency'];
    let alertsFound = 0;
    const newAlerts = [];
    
    // Default values for imported alerts
    const locations = ['Paris Centre', 'Lyon Nord', 'Marseille Est', 'Toulouse Ouest', 'Nice Centre', 'Bordeaux Nord', 'Lille Sud'];
    const centers = ['Centre IT', 'Centre Logistique', 'Centre Distribution', 'Centre SAV', 'Centre Commercial', 'Centre Stock'];
    const pannes = ['Panne système', 'Problème matériel', 'Erreur logiciel', 'Dysfonctionnement', 'Défaillance technique', 'Incident réseau'];
    const fournisseurs = ['Fournisseur A', 'Fournisseur B', 'Partenaire C', 'Prestataire D', 'Sous-traitant E', 'Société F'];
    
    data.forEach((row, rowIndex) => {
        row.values.forEach((value, colIndex) => {
            const lowerValue = value.toLowerCase();
            const hasKeyword = keywords.some(keyword => lowerValue.includes(keyword));
            
            if (hasKeyword) {
                alertsFound++;
                
                // Determine priority and status code based on keywords
                let priority = 'low';
                let statusCode = 20;
                
                if (lowerValue.includes('urgence') || lowerValue.includes('emergency')) {
                    priority = 'high';
                    statusCode = 80;
                } else if (lowerValue.includes('urgent') || lowerValue.includes('critique')) {
                    priority = 'high';
                    statusCode = 70;
                } else if (lowerValue.includes('important') || lowerValue.includes('alerte')) {
                    priority = 'medium';
                    statusCode = 30;
                }
                
                // Calculate next numero based on existing alerts
                const maxNumero = alerts.length > 0 ? Math.max(...alerts.map(a => a.numero || 0)) : 0;
                
                // Create new alert with unique ID using counter
                const columnLetter = String.fromCharCode(65 + colIndex);
                newAlerts.push({
                    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    numero: maxNumero + alertsFound,
                    title: `Import ${fileName} - ${columnLetter}${row.row}`,
                    message: value.length > 100 ? value.substring(0, 97) + '...' : value, // Limit message length with ellipsis
                    priority: priority,
                    status: 'pending',
                    statusCode: statusCode,
                    lieuHs: locations[alertsFound % locations.length], // Rotate through locations
                    centreHs: centers[alertsFound % centers.length], // Rotate through centers
                    ageProduct: 'Importé', // Mark as imported
                    panne: pannes[alertsFound % pannes.length], // Rotate through pannes
                    tiersFournisseur: fournisseurs[alertsFound % fournisseurs.length], // Rotate through suppliers
                    timestamp: new Date().toISOString(),
                    sentAt: null
                });
            }
        });
    });
    
    if (newAlerts.length > 0) {
        alerts = [...newAlerts, ...alerts];
        saveAlertsToStorage();
        renderAlerts();
        
        // Switch to Status 30 tab to show new alerts
        const status30Tab = document.querySelector('.tab-button[onclick*="status30"]');
        if (status30Tab) {
            status30Tab.click();
        }
        
        showProcessingStatus(
            `Fichier traité avec succès! ${alertsFound} alertes trouvées et ajoutées.`,
            'success'
        );
    } else {
        showProcessingStatus(
            'Fichier traité mais aucune alerte trouvée (recherche des mots-clés: urgent, critique, important, alerte)',
            'info'
        );
    }
}

// ========================================
// LocalStorage Functions
// ========================================
function saveAlertsToStorage() {
    try {
        const alertsData = JSON.stringify(alerts);
        localStorage.setItem('darty-alerts', alertsData);
    } catch (error) {
        console.error('Error saving alerts:', error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError') {
            // Keep only the most recent 50 alerts
            alerts = alerts.slice(0, 50);
            try {
                localStorage.setItem('darty-alerts', JSON.stringify(alerts));
                console.log('Reduced alerts to 50 most recent items');
            } catch (retryError) {
                console.error('Failed to save even after reducing alerts:', retryError);
                showNotification('Impossible de sauvegarder les alertes. Stockage local plein.', 'error');
            }
        } else {
            showNotification('Erreur lors de la sauvegarde des alertes.', 'error');
        }
    }
}

function loadAlertsFromStorage() {
    try {
        const stored = localStorage.getItem('darty-alerts');
        if (stored) {
            alerts = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
        alerts = [];
    }
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Simple alert for now, can be enhanced with a toast notification system
    const statusMessages = {
        'success': '✓ ',
        'error': '✗ ',
        'info': 'ℹ '
    };
    
    alert((statusMessages[type] || '') + message);
}

function showProcessingStatus(message, type = 'info') {
    const statusElement = document.getElementById('processing-status');
    if (!statusElement) return;
    
    statusElement.className = `processing-status ${type}`;
    statusElement.textContent = message;
    statusElement.style.display = 'block';
}