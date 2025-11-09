// ========================================
// Global Variables and Configuration
// ========================================
let alerts = [];
let emailConfig = {
    serviceId: '',
    templateId: '',
    userId: '',
    recipientEmail: ''
};

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved data
    loadAlertsFromStorage();
    loadEmailConfig();
    
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
    // Send Alerts Button
    const sendAlertsBtn = document.getElementById('send-alerts');
    if (sendAlertsBtn) {
        sendAlertsBtn.addEventListener('click', handleSendAlerts);
    }
    
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
    
    // Modal Close Button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEmailModal);
    }
    
    // Email Config Form
    const emailForm = document.getElementById('email-config');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailConfigSubmit);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeEmailModal();
            }
        });
    }
}

// ========================================
// Real Business Alerts Generation
// ========================================
function getDartyAlerts() {
    const alertTypes = [
        { title: 'Stock faible - Réfrigérateurs', priority: 'high', message: 'Stock critique sur les réfrigérateurs modèle XR500' },
        { title: 'Retard de livraison - TV Samsung', priority: 'high', message: 'Commande #45678 en retard de 3 jours' },
        { title: 'Maintenance préventive', priority: 'medium', message: 'Maintenance planifiée pour le système de caisse central' },
        { title: 'Nouvelle promotion - Lave-linge', priority: 'low', message: 'Lancement de la promotion sur les lave-linge Bosch' },
        { title: 'Réclamation client - SAV', priority: 'high', message: 'Client insatisfait - Dossier #12345 nécessite attention urgente' },
        { title: 'Inventaire mensuel', priority: 'medium', message: 'Rappel: inventaire à réaliser avant fin de semaine' },
        { title: 'Formation équipe', priority: 'low', message: 'Session de formation sur nouveaux produits mercredi 14h' },
        { title: 'Alerte sécurité', priority: 'high', message: 'Mise à jour de sécurité requise pour le système informatique' },
        { title: 'Commande fournisseur', priority: 'medium', message: 'Validation nécessaire pour commande matériel bureau' },
        { title: 'Réunion d\'équipe', priority: 'low', message: 'Réunion hebdomadaire prévue lundi 9h' }
    ];
    
    const generatedAlerts = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const alertType = alertTypes[i % alertTypes.length];
        const timestamp = new Date(now.getTime() - (i * 3600000)); // Décaler chaque alerte d'1 heure
        
        generatedAlerts.push({
            id: `alert-${Date.now()}-${i}`,
            title: `${alertType.title} #${i + 1}`,
            message: alertType.message,
            priority: alertType.priority,
            status: 'pending', // pending, sent, error
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
    
    div.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">${escapeHtml(alert.title)}</div>
            <div class="alert-status ${statusClass}">${statusText}</div>
        </div>
        <div class="alert-content">
            ${escapeHtml(alert.message)}
        </div>
        <div class="alert-timestamp">${formattedTime}</div>
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
// Email Functionality
// ========================================
function handleSendAlerts() {
    // Check if email is configured
    if (!emailConfig.serviceId || !emailConfig.recipientEmail) {
        openEmailModal();
        return;
    }
    
    const pendingAlerts = alerts.filter(alert => alert.status === 'pending');
    
    if (pendingAlerts.length === 0) {
        showNotification('Aucune alerte en attente à envoyer', 'info');
        return;
    }
    
    // Simulate sending emails (replace with real EmailJS implementation if needed)
    sendAlertsInBatches(pendingAlerts);
}

function sendAlertsInBatches(pendingAlerts) {
    const batchSize = 5;
    let currentBatch = 0;
    const totalBatches = Math.ceil(pendingAlerts.length / batchSize);
    
    showNotification(`Envoi de ${pendingAlerts.length} alertes en cours...`, 'info');
    
    const sendBatch = () => {
        const start = currentBatch * batchSize;
        const end = Math.min(start + batchSize, pendingAlerts.length);
        const batch = pendingAlerts.slice(start, end);
        
        batch.forEach(alert => {
            // Simulate 90% success rate
            const success = Math.random() > 0.1;
            
            const alertIndex = alerts.findIndex(a => a.id === alert.id);
            if (alertIndex !== -1) {
                alerts[alertIndex].status = success ? 'sent' : 'error';
                alerts[alertIndex].sentAt = new Date().toISOString();
            }
        });
        
        currentBatch++;
        
        if (currentBatch < totalBatches) {
            setTimeout(sendBatch, 1000); // Wait 1 second between batches
        } else {
            // All batches sent
            saveAlertsToStorage();
            renderAlerts();
            
            const sentCount = alerts.filter(a => a.status === 'sent').length;
            const errorCount = alerts.filter(a => a.status === 'error').length;
            
            showNotification(
                `Envoi terminé: ${sentCount} réussies, ${errorCount} erreurs`,
                errorCount > 0 ? 'error' : 'success'
            );
        }
    };
    
    sendBatch();
}

function openEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleEmailConfigSubmit(event) {
    event.preventDefault();
    
    emailConfig = {
        serviceId: document.getElementById('emailjs-service').value,
        templateId: document.getElementById('emailjs-template').value,
        userId: document.getElementById('emailjs-user').value,
        recipientEmail: document.getElementById('recipient-email').value
    };
    
    saveEmailConfig();
    closeEmailModal();
    showNotification('Configuration email sauvegardée', 'success');
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
        showProcessingStatus('Format Excel détecté. Pour traiter les fichiers Excel, vous devez inclure une bibliothèque comme SheetJS (xlsx)', 'error');
    } else {
        showProcessingStatus('Format de fichier non supporté', 'error');
    }
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
                
                // Determine priority based on keywords
                let priority = 'low';
                if (lowerValue.includes('urgent') || lowerValue.includes('critique')) {
                    priority = 'high';
                } else if (lowerValue.includes('important') || lowerValue.includes('alerte')) {
                    priority = 'medium';
                }
                
                // Create new alert
                const columnLetter = String.fromCharCode(65 + colIndex);
                newAlerts.push({
                    id: `import-${Date.now()}-${rowIndex}-${colIndex}`,
                    title: `Import ${fileName} - ${columnLetter}${row.row}`,
                    message: value.substring(0, 100), // Limit message length
                    priority: priority,
                    status: 'pending',
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

function saveEmailConfig() {
    try {
        localStorage.setItem('darty-email-config', JSON.stringify(emailConfig));
    } catch (error) {
        console.error('Error saving email config:', error);
    }
}

function loadEmailConfig() {
    try {
        const stored = localStorage.getItem('darty-email-config');
        if (stored) {
            emailConfig = JSON.parse(stored);
            
            // Populate form if modal exists
            const serviceInput = document.getElementById('emailjs-service');
            const templateInput = document.getElementById('emailjs-template');
            const userInput = document.getElementById('emailjs-user');
            const recipientInput = document.getElementById('recipient-email');
            
            if (serviceInput && emailConfig.serviceId) serviceInput.value = emailConfig.serviceId;
            if (templateInput && emailConfig.templateId) templateInput.value = emailConfig.templateId;
            if (userInput && emailConfig.userId) userInput.value = emailConfig.userId;
            if (recipientInput && emailConfig.recipientEmail) recipientInput.value = emailConfig.recipientEmail;
        }
    } catch (error) {
        console.error('Error loading email config:', error);
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