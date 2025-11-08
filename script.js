// Global variables
let currentAlerts = [];
let status30Alerts = []; // Specific alerts for status 30
let emailConfig = {
    serviceId: '',
    templateId: '',
    userId: '',
    recipientEmail: ''
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDateTime();
    initializeAlerts();
    initializeFileUpload();
    initializeEmailModal();
    initializeEmailJS();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
});

// Date and Time Management
function initializeDateTime() {
    updateDateTime();
}

function updateDateTime() {
    const now = new Date();
    
    // Update time
    const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('current-time').textContent = timeString;
    
    // Update date
    const dateString = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = dateString;
    
    // Update day period
    const hour = now.getHours();
    let period;
    if (hour >= 5 && hour < 12) {
        period = '🌅 MATIN';
    } else if (hour >= 12 && hour < 18) {
        period = '☀️ MIDI';
    } else {
        period = '🌙 SOIR';
    }
    document.getElementById('day-period').textContent = period;
}

// Tab Management
function showTab(tabName, event) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // If no event, find and activate the corresponding button
        document.querySelectorAll('.tab-button').forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            if ((tabName === 'status30' && buttonText.includes('statut')) ||
                (tabName === 'import' && buttonText.includes('import'))) {
                button.classList.add('active');
            }
        });
    }
}

// Alert Management
function initializeAlerts() {
    generateDefaultAlerts();
    renderAlerts();
    
    // Add event listener for send alerts button
    document.getElementById('send-alerts').addEventListener('click', sendAllAlerts);
}

function generateDefaultAlerts() {
    currentAlerts = [];
    status30Alerts = [];
    
    for (let i = 1; i <= 30; i++) {
        // Mark some default alerts as status 30 (about 30% of them)
        const isStatus30 = Math.random() > 0.7;
        const excelStatus = isStatus30 ? 30 : Math.floor(Math.random() * 40) + 10;
        
        const alert = {
            id: i,
            title: `Alerte ${i}`,
            content: `Contenu de l'alerte numéro ${i} - Statut par défaut${isStatus30 ? ' (Statut 30)' : ''}`,
            priority: getRandomPriority(),
            status: 'pending',
            timestamp: new Date().toISOString(),
            source: 'default',
            isStatus30: isStatus30,
            excelStatus: excelStatus
        };
        
        currentAlerts.push(alert);
        if (isStatus30) {
            status30Alerts.push(alert);
        }
    }
}

function getRandomPriority() {
    const priorities = ['high', 'medium', 'low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
}

function renderAlerts() {
    const alertsGrid = document.getElementById('alerts-grid');
    if (!alertsGrid) return;
    
    alertsGrid.innerHTML = '';
    
    // Check which tab is currently active
    const status30Tab = document.getElementById('status30');
    const isStatus30TabActive = status30Tab && status30Tab.classList.contains('active');
    
    // Filter to show only status 30 alerts when Status 30 tab is active
    const alertsToDisplay = (isStatus30TabActive && status30Alerts.length > 0) ? status30Alerts : currentAlerts;
    
    alertsToDisplay.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsGrid.appendChild(alertElement);
    });
    
    // Update the tab header with status 30 count
    updateStatus30Header();
}

function createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item priority-${alert.priority}`;
    
    // Add status 30 badge if applicable
    const status30Badge = alert.isStatus30 ? '<span class="status-30-badge">📌 STATUT 30</span>' : '';
    
    alertDiv.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">${alert.title} ${status30Badge}</div>
            <div class="alert-status status-${alert.status}">
                ${getStatusText(alert.status)}
            </div>
        </div>
        <div class="alert-content">${alert.content}</div>
        <div class="alert-timestamp">
            Créé: ${new Date(alert.timestamp).toLocaleString('fr-FR')}
        </div>
    `;
    return alertDiv;
}

function updateStatus30Header() {
    const headerTitle = document.querySelector('#status30 .tab-header h2');
    const summary = document.getElementById('status30-summary');
    const countText = document.getElementById('status30-count');
    
    const count = status30Alerts.length;
    
    // Update header title if element exists
    if (headerTitle) {
        if (count > 0) {
            headerTitle.textContent = `Statut des Alertes (30) - ${count} alerte${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''}`;
        } else {
            headerTitle.textContent = 'Statut des Alertes (30)';
        }
    }
    
    // Show/hide summary based on count - with null checks
    if (summary) {
        if (count > 0) {
            summary.style.display = 'block';
            if (countText) {
                countText.textContent = `${count} alerte${count > 1 ? 's' : ''} avec statut 30 détectée${count > 1 ? 's' : ''}`;
            }
        } else {
            summary.style.display = 'none';
        }
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'En attente';
        case 'sent': return 'Envoyé';
        case 'error': return 'Erreur';
        default: return 'Inconnu';
    }
}

// File Upload and Excel Processing
function initializeFileUpload() {
    const fileInput = document.getElementById('excel-file');
    const fileInfo = document.getElementById('file-info');
    const processButton = document.getElementById('process-file');
    
    fileInput.addEventListener('change', handleFileSelect);
    processButton.addEventListener('click', processExcelFile);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    
    if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        fileDetails.innerHTML = `
            <p><strong>Nom:</strong> ${file.name}</p>
            <p><strong>Taille:</strong> ${fileSize} MB</p>
            <p><strong>Type:</strong> ${file.type}</p>
            <p><strong>Dernière modification:</strong> ${new Date(file.lastModified).toLocaleString('fr-FR')}</p>
        `;
        fileInfo.style.display = 'block';
    }
}

function processExcelFile() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('processing-status');
    
    if (!file) {
        showProcessingStatus('Veuillez sélectionner un fichier Excel.', 'error');
        return;
    }
    
    showProcessingStatus('Traitement du fichier en cours...', 'info');
    
    // Simulate Excel file processing with CSV-like functionality
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const extractedData = [];
            
            // Simple CSV-like parsing for demonstration
            const lines = text.split('\n');
            let totalRows = lines.length;
            
            lines.forEach((line, rowIndex) => {
                if (line.trim()) {
                    const cells = line.split(/[,;\t]/); // Split by comma, semicolon, or tab
                    cells.forEach((cell, colIndex) => {
                        if (cell && cell.trim() !== '') {
                            extractedData.push({
                                sheet: 'Sheet1',
                                row: rowIndex + 1,
                                column: String.fromCharCode(65 + colIndex), // A, B, C, etc.
                                value: cell.trim(),
                                address: `Sheet1!${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
                            });
                        }
                    });
                }
            });
            
            // If it's a binary Excel file, show a helpful message
            if (extractedData.length === 0) {
                showProcessingStatus(
                    'Fichier Excel détecté. Pour une fonctionnalité complète, veuillez exporter en CSV ou ajouter la bibliothèque XLSX.',
                    'info'
                );
                
                // Generate sample alerts to demonstrate functionality
                generateSampleExcelAlerts();
                return;
            }
            
            // Generate alerts from extracted data
            generateAlertsFromData(extractedData);
            
            showProcessingStatus(
                `Fichier traité avec succès! ${totalRows} lignes, ${extractedData.length} cellules de données trouvées. ${currentAlerts.length} alertes générées.`,
                'success'
            );
            
            // Switch to Status 30 tab to show results
            setTimeout(() => {
                showTabByName('status30');
                // Re-render to ensure proper filtering after tab switch
                setTimeout(() => renderAlerts(), 100);
            }, 2000);
            
        } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            showProcessingStatus('Erreur lors du traitement du fichier: ' + error.message, 'error');
        }
    };
    
    // Try to read as text first, fallback to binary for Excel files
    if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
        reader.readAsText(file);
    } else {
        // For Excel files, show demo functionality
        generateSampleExcelAlerts();
        showProcessingStatus(
            `Fichier Excel "${file.name}" reçu. Génération d'alertes de démonstration basées sur des données simulées.`,
            'success'
        );
        setTimeout(() => {
            showTabByName('status30');
            // The following timeout is used to ensure the tab switch DOM updates are complete
            // before re-rendering alerts. This is a workaround for timing issues where immediate
            // rendering may occur before the tab is fully visible. The 100ms value was chosen
            // empirically to balance responsiveness and reliability. If a tab transition completion
            // event becomes available, refactor to use that instead.
            setTimeout(() => renderAlerts(), 100);
        }, 2000);
    }
}

function generateSampleExcelAlerts() {
    currentAlerts = [];
    status30Alerts = [];
    
    const sampleData = [
        { sheet: 'Ventes', data: 'Commande urgente #12345', priority: 'high', status: 30 },
        { sheet: 'Inventory', data: 'Stock critique - Article A123', priority: 'high', status: 30 },
        { sheet: 'Clients', data: 'Nouveau client important', priority: 'medium', status: 20 },
        { sheet: 'Finances', data: 'Facture en retard - 5000€', priority: 'high', status: 30 },
        { sheet: 'Production', data: 'Maintenance programmée', priority: 'low', status: 10 },
        { sheet: 'RH', data: 'Formation obligatoire', priority: 'medium', status: 30 },
        { sheet: 'Qualité', data: 'Audit qualité prévu', priority: 'medium', status: 30 },
        { sheet: 'Logistics', data: 'Livraison express requise', priority: 'high', status: 30 },
        { sheet: 'Marketing', data: 'Campagne en cours', priority: 'low', status: 15 },
        { sheet: 'Support', data: 'Incident critique résolu', priority: 'medium', status: 30 }
    ];
    
    let alertId = 1;
    
    // Create alerts from sample data
    sampleData.forEach(item => {
        const alert = {
            id: alertId++,
            title: `${item.sheet} - Alerte ${alertId}`,
            content: `Données Excel: ${item.data} (Statut: ${item.status})`,
            priority: item.priority,
            status: 'pending',
            timestamp: new Date().toISOString(),
            source: 'excel',
            excelStatus: item.status,
            isStatus30: item.status === 30
        };
        
        currentAlerts.push(alert);
        if (item.status === 30) {
            status30Alerts.push(alert);
        }
    });
    
    // Fill remaining slots with generated data
    while (currentAlerts.length < 30) {
        const sheets = ['DataSheet', 'Results', 'Analysis', 'Reports'];
        const randomSheet = sheets[Math.floor(Math.random() * sheets.length)];
        const randomStatus = Math.random() > 0.6 ? 30 : Math.floor(Math.random() * 40) + 10;
        
        const alert = {
            id: alertId++,
            title: `${randomSheet} - Ligne ${alertId + 10}`,
            content: `Données extraites: Valeur ${Math.floor(Math.random() * 1000)} (Colonne ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}) - Statut: ${randomStatus}`,
            priority: getRandomPriority(),
            status: 'pending',
            timestamp: new Date().toISOString(),
            source: 'excel',
            excelStatus: randomStatus,
            isStatus30: randomStatus === 30
        };
        
        currentAlerts.push(alert);
        if (randomStatus === 30) {
            status30Alerts.push(alert);
        }
    }
    
    renderAlerts();
}

function generateAlertsFromData(data) {
    currentAlerts = [];
    status30Alerts = [];
    
    // Group data by sheets for better organization
    const sheetData = {};
    data.forEach(item => {
        if (!sheetData[item.sheet]) {
            sheetData[item.sheet] = [];
        }
        sheetData[item.sheet].push(item);
    });
    
    let alertId = 1;
    
    // Generate alerts for each sheet
    Object.keys(sheetData).forEach(sheetName => {
        const items = sheetData[sheetName];
        
        // Check if sheet has status 30 items - more context-aware detection
        const status30Items = items.filter(item => {
            const value = item.value.toLowerCase();
            // Check for explicit status 30 text
            if (value.includes('statut 30') || value.includes('status 30')) {
                return true;
            }
            // Check if value is exactly '30' and column name suggests it's a status column
            // (Column D is typically the 4th column, often used for status in structured data)
            if (item.value === '30' && (item.column === 'D' || item.column === 'E')) {
                return true;
            }
            return false;
        });
        
        // Create summary alert for sheet
        const sheetAlert = {
            id: alertId++,
            title: `Feuille: ${sheetName}`,
            content: `${items.length} éléments trouvés dans la feuille ${sheetName}${status30Items.length > 0 ? ` (${status30Items.length} statut 30)` : ''}`,
            priority: status30Items.length > 0 ? 'high' : 'medium',
            status: 'pending',
            timestamp: new Date().toISOString(),
            source: 'excel',
            sheetData: items.slice(0, 10), // Store first 10 items as sample
            isStatus30: status30Items.length > 0,
            excelStatus: status30Items.length > 0 ? 30 : null
        };
        
        currentAlerts.push(sheetAlert);
        if (status30Items.length > 0) {
            status30Alerts.push(sheetAlert);
        }
        
        // Create alerts for status 30 items first
        status30Items.forEach(item => {
            if (alertId <= 30) {
                const alert = {
                    id: alertId++,
                    title: `📌 STATUT 30 - ${item.address}`,
                    content: `Valeur statut 30 détectée: "${item.value}" (${item.sheet}, ligne ${item.row}, colonne ${item.column})`,
                    priority: 'high',
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    source: 'excel',
                    cellData: item,
                    isStatus30: true,
                    excelStatus: 30
                };
                currentAlerts.push(alert);
                status30Alerts.push(alert);
            }
        });
        
        // Create alerts for high-value cells (containing specific keywords or numbers)
        items.forEach(item => {
            const value = item.value.toLowerCase();
            // More context-aware status 30 detection
            const isStatus30 = value.includes('statut 30') || value.includes('status 30') || 
                               (item.value === '30' && (item.column === 'D' || item.column === 'E'));
            
            if (!isStatus30 && (value.includes('urgent') || value.includes('important') || value.includes('critique') || 
                value.includes('alerte') || value.includes('erreur') || /\d{4,}/.test(value))) {
                
                if (alertId <= 30) { // Limit to 30 alerts max
                    currentAlerts.push({
                        id: alertId++,
                        title: `${item.address}`,
                        content: `Valeur importante détectée: "${item.value}" (${item.sheet}, ligne ${item.row}, colonne ${item.column})`,
                        priority: 'high',
                        status: 'pending',
                        timestamp: new Date().toISOString(),
                        source: 'excel',
                        cellData: item,
                        isStatus30: false
                    });
                }
            }
        });
    });
    
    // Fill remaining slots with general data alerts if needed
    while (currentAlerts.length < 30 && data.length > 0) {
        const randomItem = data[Math.floor(Math.random() * data.length)];
        currentAlerts.push({
            id: alertId++,
            title: `Données: ${randomItem.address}`,
            content: `Données extraites: "${randomItem.value}" (${randomItem.sheet})`,
            priority: 'low',
            status: 'pending',
            timestamp: new Date().toISOString(),
            source: 'excel',
            cellData: randomItem,
            isStatus30: false
        });
    }
    
    // Ensure we have exactly 30 alerts
    currentAlerts = currentAlerts.slice(0, 30);
    
    renderAlerts();
}

function showProcessingStatus(message, type) {
    const statusDiv = document.getElementById('processing-status');
    statusDiv.textContent = message;
    statusDiv.className = `processing-status ${type}`;
    statusDiv.style.display = 'block';
}

function showTabByName(tabName) {
    // Directly call showTab with the tab name
    if (tabName === 'status30' || tabName === 'import') {
        showTab(tabName);
    } else {
        console.error('Invalid tab name:', tabName);
    }
}

// EmailJS Integration
function initializeEmailJS() {
    // Simple email simulation - in a real implementation, you would use EmailJS
    console.log('Email system initialized');
}

function initializeEmailModal() {
    const modal = document.getElementById('email-modal');
    const closeButton = document.querySelector('.close');
    const configForm = document.getElementById('email-config');
    
    // Close modal
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    configForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveEmailConfiguration();
        modal.style.display = 'none';
    });
    
    // Load saved configuration
    loadEmailConfiguration();
}

function isEmailConfigured() {
    return emailConfig.serviceId && emailConfig.templateId && emailConfig.userId && emailConfig.recipientEmail;
}

function saveEmailConfiguration() {
    emailConfig.serviceId = document.getElementById('emailjs-service').value;
    emailConfig.templateId = document.getElementById('emailjs-template').value;
    emailConfig.userId = document.getElementById('emailjs-user').value;
    emailConfig.recipientEmail = document.getElementById('recipient-email').value;
    
    // Save to localStorage
    localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
    
    // Initialize email system
    console.log('Email configuration saved');
}

function loadEmailConfiguration() {
    const saved = localStorage.getItem('emailConfig');
    if (saved) {
        emailConfig = JSON.parse(saved);
        
        // Populate form fields
        document.getElementById('emailjs-service').value = emailConfig.serviceId || '';
        document.getElementById('emailjs-template').value = emailConfig.templateId || '';
        document.getElementById('emailjs-user').value = emailConfig.userId || '';
        document.getElementById('recipient-email').value = emailConfig.recipientEmail || '';
        
        // Initialize EmailJS if configured
        if (emailConfig.userId) {
            console.log('Email configuration loaded');
        }
    }
}

function sendAllAlerts() {
    if (!isEmailConfigured()) {
        // Show configuration modal
        const modal = document.getElementById('email-modal');
        modal.style.display = 'block';
        return;
    }
    
    const sendButton = document.getElementById('send-alerts');
    const originalText = sendButton.textContent;
    sendButton.innerHTML = '<span class="loading"></span> Envoi en cours...';
    sendButton.disabled = true;
    
    const pendingAlerts = currentAlerts.filter(alert => alert.status === 'pending');
    
    if (pendingAlerts.length === 0) {
        alert('Aucune alerte en attente à envoyer.');
        sendButton.textContent = originalText;
        sendButton.disabled = false;
        return;
    }
    
    // Send alerts in batches to avoid overwhelming the email service
    sendAlertsInBatches(pendingAlerts, 0);
}

function sendAlertsInBatches(alerts, startIndex) {
    const batchSize = 5; // Send 5 alerts at a time
    const batch = alerts.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) {
        // All alerts sent
        const sendButton = document.getElementById('send-alerts');
        sendButton.textContent = 'Envoyer Alertes Email';
        sendButton.disabled = false;
        alert('Toutes les alertes ont été envoyées!');
        return;
    }
    
    // Send current batch
    Promise.all(batch.map(alert => sendSingleAlert(alert)))
        .then(results => {
            // Update alert statuses
            results.forEach((success, index) => {
                const alert = batch[index];
                alert.status = success ? 'sent' : 'error';
            });
            
            renderAlerts();
            
            // Send next batch after a short delay
            setTimeout(() => {
                sendAlertsInBatches(alerts, startIndex + batchSize);
            }, 2000);
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi par lots:', error);
            const sendButton = document.getElementById('send-alerts');
            sendButton.textContent = 'Envoyer Alertes Email';
            sendButton.disabled = false;
            alert('Erreur lors de l\'envoi des alertes: ' + error.message);
        });
}

function sendSingleAlert(alert) {
    const templateParams = {
        alert_title: alert.title,
        alert_content: alert.content,
        alert_priority: alert.priority,
        alert_timestamp: new Date(alert.timestamp).toLocaleString('fr-FR'),
        alert_source: alert.source,
        recipient_email: emailConfig.recipientEmail,
        to_email: emailConfig.recipientEmail
    };
    
    // Simulate email sending (in real implementation, use EmailJS)
    return new Promise((resolve) => {
        console.log('Envoi simulé de l\'email:', templateParams);
        setTimeout(() => {
            // Simulate 90% success rate
            resolve(Math.random() > 0.1);
        }, 500);
    });
}

// Utility Functions
function getPriorityIcon(priority) {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Auto-save functionality
setInterval(() => {
    if (currentAlerts.length > 0) {
        localStorage.setItem('currentAlerts', JSON.stringify(currentAlerts));
    }
}, 30000); // Save every 30 seconds

// Load saved alerts on startup
window.addEventListener('load', () => {
    const savedAlerts = localStorage.getItem('currentAlerts');
    if (savedAlerts) {
        try {
            const alerts = JSON.parse(savedAlerts);
            if (alerts.length > 0) {
                currentAlerts = alerts;
                renderAlerts();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des alertes sauvegardées:', error);
        }
    }
});

// Export functions for testing
window.WebAlertApp = {
    showTab,
    generateDefaultAlerts,
    processExcelFile,
    sendAllAlerts,
    currentAlerts,
    emailConfig
};