// ========================================
// Global Variables and Configuration
// ========================================
let alerts = [];

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
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
    setInterval(saveAlertsToStorage, 30000);
    
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
        { title: 'Stock faible - Réfrigérateurs', priority: 'high', message: 'Stock critique sur les réfrigérateurs modèle XR500', statusCode: 70 },
        { title: 'Retard de livraison - TV Samsung', priority: 'high', message: 'Commande #45678 en retard de 3 jours', statusCode: 70 },
        { title: 'Maintenance préventive', priority: 'medium', message: 'Maintenance planifiée pour le système de caisse central', statusCode: 30 },
        { title: 'Nouvelle promotion - Lave-linge', priority: 'low', message: 'Lancement de la promotion sur les lave-linge Bosch', statusCode: 20 },
        { title: 'Réclamation client - SAV', priority: 'high', message: 'Client insatisfait - Dossier #12345 nécessite attention urgente', statusCode: 70 },
        { title: 'Inventaire mensuel', priority: 'medium', message: 'Rappel: inventaire à réaliser avant fin de semaine', statusCode: 30 },
        { title: 'Formation équipe', priority: 'low', message: 'Session de formation sur nouveaux produits mercredi 14h', statusCode: 20 },
        { title: 'Alerte sécurité', priority: 'high', message: 'Mise à jour de sécurité requise pour le système informatique', statusCode: 70 },
        { title: 'Commande fournisseur', priority: 'medium', message: 'Validation nécessaire pour commande matériel bureau', statusCode: 30 },
        { title: 'Réunion d\'équipe', priority: 'low', message: 'Réunion hebdomadaire prévue lundi 9h', statusCode: 20 }
    ];
    
    const generatedAlerts = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const alertType = alertTypes[i % alertTypes.length];
        const timestamp = new Date(now.getTime() - (i * 3600000)); // Décaler chaque alerte d'1 heure
        
        generatedAlerts.push({
            id: `alert-${Date.now()}-${i}`,
            numero: i + 1, // Numéro de l'alerte
            title: `${alertType.title} #${i + 1}`,
            message: alertType.message,
            priority: alertType.priority,
            status: 'pending', // pending, sent, error
            statusCode: alertType.statusCode, // Code de statut (20, 30, 70)
            timestamp: timestamp.toISOString(),
            sentAt: null
        });
    }
    
    return generatedAlerts;
}

// ========================================
// Alert Rendering
// ========================================
function renderAlerts() {
    const alertsGrid = document.getElementById('alerts-grid');
    if (!alertsGrid) return;
    
    alertsGrid.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Aucune alerte disponible</p>';
        return;
    }
    
    alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsGrid.appendChild(alertElement);
    });
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert-item priority-${alert.priority}`;
    div.setAttribute('data-alert-id', alert.id);
    
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
    if (alert.statusCode === 70) {
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
        <div class="alert-footer">
            <div class="alert-status-code">Statut: ${statusCodeText}</div>
            <div class="alert-timestamp">${formattedTime}</div>
        </div>
    `;
    
    return div;
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
    const keywords = ['urgent', 'critique', 'important', 'alerte', 'attention', 'priorité'];
    let alertsFound = 0;
    const newAlerts = [];
    
    data.forEach((row, rowIndex) => {
        row.values.forEach((value, colIndex) => {
            const lowerValue = value.toLowerCase();
            const hasKeyword = keywords.some(keyword => lowerValue.includes(keyword));
            
            if (hasKeyword) {
                alertsFound++;
                
                // Determine priority and status code based on keywords
                let priority = 'low';
                let statusCode = 20;
                
                if (lowerValue.includes('urgent') || lowerValue.includes('critique')) {
                    priority = 'high';
                    statusCode = 70;
                } else if (lowerValue.includes('important') || lowerValue.includes('alerte')) {
                    priority = 'medium';
                    statusCode = 30;
                }
                
                // Calculate next numero based on existing alerts
                const maxNumero = alerts.length > 0 ? Math.max(...alerts.map(a => a.numero || 0)) : 0;
                
                // Create new alert
                const columnLetter = String.fromCharCode(65 + colIndex);
                newAlerts.push({
                    id: `import-${Date.now()}-${rowIndex}-${colIndex}`,
                    numero: maxNumero + alertsFound,
                    title: `Import ${fileName} - ${columnLetter}${row.row}`,
                    message: value.substring(0, 100), // Limit message length
                    priority: priority,
                    status: 'pending',
                    statusCode: statusCode,
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
        const status30Tab = document.querySelector('[onclick*="status30"]');
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
        localStorage.setItem('darty-alerts', JSON.stringify(alerts));
    } catch (error) {
        console.error('Error saving alerts:', error);
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