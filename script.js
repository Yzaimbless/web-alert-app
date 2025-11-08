// ==================== ALERT MANAGEMENT ====================

// Generate 30 realistic Darty alerts
let alerts = [];

function generateDartyAlerts() {
    const alertTypes = [
        'Commande en retard',
        'Stock faible',
        'Livraison urgente',
        'Retour client',
        'Service après-vente',
        'Réapprovisionnement',
        'Garantie expirée',
        'Validation manager',
        'Problème facturation',
        'Demande SAV urgent'
    ];
    
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['pending', 'sent', 'error'];
    
    alerts = [];
    
    for (let i = 1; i <= 30; i++) {
        const alert = {
            id: i,
            title: `${alertTypes[Math.floor(Math.random() * alertTypes.length)]} #${i}`,
            message: `Alerte générée le ${formatFrenchDateTime(new Date())}`,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        alerts.push(alert);
    }
    
    saveAlertsToStorage();
    displayAlerts();
}

function displayAlerts() {
    const grid = document.getElementById('alerts-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item priority-${alert.priority}`;
        alertDiv.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-status status-${alert.status}">
                    ${getStatusText(alert.status)}
                </div>
            </div>
            <div class="alert-content">
                ${alert.message}
            </div>
            <div class="alert-timestamp">
                ${new Date(alert.timestamp).toLocaleString('fr-FR')}
            </div>
        `;
        grid.appendChild(alertDiv);
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'En attente',
        'sent': 'Envoyé',
        'error': 'Erreur'
    };
    return statusMap[status] || status;
}

// ==================== DATE/TIME FORMATTING ====================

function formatFrenchDateTime(date) {
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

// ==================== LOCAL STORAGE ====================

function saveAlertsToStorage() {
    try {
        localStorage.setItem('dartyAlerts', JSON.stringify(alerts));
    } catch (error) {
        console.error('Error saving alerts to localStorage:', error);
    }
}

function loadAlertsFromStorage() {
    try {
        const stored = localStorage.getItem('dartyAlerts');
        if (stored) {
            alerts = JSON.parse(stored);
            displayAlerts();
            return true;
        }
    } catch (error) {
        console.error('Error loading alerts from localStorage:', error);
    }
    return false;
}

// ==================== EMAIL FUNCTIONALITY ====================

let emailConfig = {
    serviceId: '',
    templateId: '',
    userId: '',
    recipientEmail: ''
};

function loadEmailConfig() {
    try {
        const stored = localStorage.getItem('emailConfig');
        if (stored) {
            emailConfig = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading email config:', error);
    }
}

function saveEmailConfig(config) {
    try {
        emailConfig = config;
        localStorage.setItem('emailConfig', JSON.stringify(config));
    } catch (error) {
        console.error('Error saving email config:', error);
    }
}

async function sendAlerts() {
    const pendingAlerts = alerts.filter(a => a.status === 'pending');
    
    if (pendingAlerts.length === 0) {
        alert('Aucune alerte en attente à envoyer.');
        return;
    }
    
    // Check if email config exists
    if (!emailConfig.serviceId || !emailConfig.recipientEmail) {
        showEmailModal();
        return;
    }
    
    // Simulate sending emails (90% success rate)
    const button = document.getElementById('send-alerts');
    if (button) {
        button.disabled = true;
        button.textContent = 'Envoi en cours...';
    }
    
    let sent = 0;
    let errors = 0;
    
    for (let alert of pendingAlerts) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 90% success rate
        if (Math.random() < 0.9) {
            alert.status = 'sent';
            sent++;
        } else {
            alert.status = 'error';
            errors++;
        }
        
        displayAlerts();
    }
    
    saveAlertsToStorage();
    
    if (button) {
        button.disabled = false;
        button.textContent = 'Envoyer Alertes Email';
    }
    
    alert(`Envoi terminé!\n✓ ${sent} alertes envoyées\n✗ ${errors} erreurs`);
}

function showEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Fill existing config
        document.getElementById('emailjs-service').value = emailConfig.serviceId || '';
        document.getElementById('emailjs-template').value = emailConfig.templateId || '';
        document.getElementById('emailjs-user').value = emailConfig.userId || '';
        document.getElementById('recipient-email').value = emailConfig.recipientEmail || '';
    }
}

function hideEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== EXCEL FILE HANDLING ====================

function handleExcelFile(file) {
    const statusDiv = document.getElementById('processing-status');
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    
    if (!file) {
        return;
    }
    
    // Display file info
    if (fileInfo && fileDetails) {
        fileDetails.innerHTML = `
            <p><strong>Nom:</strong> ${file.name}</p>
            <p><strong>Taille:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> ${file.type || 'Non spécifié'}</p>
        `;
        fileInfo.style.display = 'block';
    }
    
    // For CSV files or simple text processing
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        readCSVFile(file, statusDiv);
    } else {
        // For Excel files, provide guidance
        if (statusDiv) {
            statusDiv.className = 'processing-status info';
            statusDiv.textContent = 'Fichier Excel sélectionné. Note: Pour lire les fichiers Excel (.xlsx, .xls), une bibliothèque externe comme SheetJS serait nécessaire. Pour une démonstration, veuillez utiliser un fichier CSV.';
        }
    }
}

function readCSVFile(file, statusDiv) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            
            if (statusDiv) {
                statusDiv.className = 'processing-status success';
                statusDiv.innerHTML = `
                    <p><strong>✓ Fichier traité avec succès!</strong></p>
                    <p>Nombre de lignes: ${lines.length}</p>
                    <p>Première ligne: ${lines[0] ? lines[0].substring(0, 100) + '...' : 'Vide'}</p>
                `;
            }
            
            // Check for keywords
            const keywords = ['urgent', 'critique', 'important', 'alerte'];
            const foundKeywords = [];
            
            lines.forEach((line, index) => {
                keywords.forEach(keyword => {
                    if (line.toLowerCase().includes(keyword)) {
                        foundKeywords.push(`Ligne ${index + 1}: "${keyword}"`);
                    }
                });
            });
            
            if (foundKeywords.length > 0 && statusDiv) {
                const keywordDiv = document.createElement('div');
                keywordDiv.innerHTML = `
                    <p style="margin-top: 15px;"><strong>🔍 Mots-clés trouvés:</strong></p>
                    <ul style="margin-left: 20px;">
                        ${foundKeywords.slice(0, 10).map(k => `<li>${k}</li>`).join('')}
                    </ul>
                `;
                statusDiv.appendChild(keywordDiv);
            }
            
        } catch (error) {
            if (statusDiv) {
                statusDiv.className = 'processing-status error';
                statusDiv.textContent = `Erreur lors du traitement: ${error.message}`;
            }
            console.error('Error processing file:', error);
        }
    };
    
    reader.onerror = function() {
        if (statusDiv) {
            statusDiv.className = 'processing-status error';
            statusDiv.textContent = 'Erreur lors de la lecture du fichier.';
        }
    };
    
    reader.readAsText(file);
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    // Load email config
    loadEmailConfig();
    
    // Load or generate alerts
    if (!loadAlertsFromStorage()) {
        generateDartyAlerts();
    }
    
    // Send alerts button
    const sendButton = document.getElementById('send-alerts');
    if (sendButton) {
        sendButton.addEventListener('click', sendAlerts);
    }
    
    // File upload
    const fileInput = document.getElementById('excel-file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleExcelFile(file);
            }
        });
    }
    
    // Process file button
    const processButton = document.getElementById('process-file');
    if (processButton) {
        processButton.addEventListener('click', function() {
            const fileInput = document.getElementById('excel-file');
            if (fileInput && fileInput.files[0]) {
                handleExcelFile(fileInput.files[0]);
            }
        });
    }
    
    // Email modal
    const modal = document.getElementById('email-modal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideEmailModal);
    }
    
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideEmailModal();
            }
        });
    }
    
    // Email config form
    const emailForm = document.getElementById('email-config');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const config = {
                serviceId: document.getElementById('emailjs-service').value,
                templateId: document.getElementById('emailjs-template').value,
                userId: document.getElementById('emailjs-user').value,
                recipientEmail: document.getElementById('recipient-email').value
            };
            
            saveEmailConfig(config);
            hideEmailModal();
            alert('Configuration email sauvegardée!');
        });
    }
    
    // Auto-save alerts every 30 seconds
    setInterval(function() {
        if (alerts.length > 0) {
            saveAlertsToStorage();
        }
    }, 30000);
});