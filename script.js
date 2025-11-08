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
        // Clear previous content
        fileDetails.innerHTML = '';
        
        // Create elements safely to prevent XSS
        const nameP = document.createElement('p');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = 'Nom: ';
        nameP.appendChild(nameStrong);
        nameP.appendChild(document.createTextNode(file.name));
        
        const sizeP = document.createElement('p');
        const sizeStrong = document.createElement('strong');
        sizeStrong.textContent = 'Taille: ';
        sizeP.appendChild(sizeStrong);
        sizeP.appendChild(document.createTextNode((file.size / 1024).toFixed(2) + ' KB'));
        
        const typeP = document.createElement('p');
        const typeStrong = document.createElement('strong');
        typeStrong.textContent = 'Type: ';
        typeP.appendChild(typeStrong);
        typeP.appendChild(document.createTextNode(file.type || 'Non spécifié'));
        
        fileDetails.appendChild(nameP);
        fileDetails.appendChild(sizeP);
        fileDetails.appendChild(typeP);
        
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
                statusDiv.innerHTML = '';
                
                // Create success message safely
                const successP = document.createElement('p');
                const successStrong = document.createElement('strong');
                successStrong.textContent = '✓ Fichier traité avec succès!';
                successP.appendChild(successStrong);
                
                const linesP = document.createElement('p');
                linesP.textContent = `Nombre de lignes: ${lines.length}`;
                
                const firstLineP = document.createElement('p');
                const firstLineText = lines[0] ? lines[0].substring(0, 100) + '...' : 'Vide';
                firstLineP.textContent = `Première ligne: ${firstLineText}`;
                
                statusDiv.appendChild(successP);
                statusDiv.appendChild(linesP);
                statusDiv.appendChild(firstLineP);
            }
            
            // Check for keywords
            const keywords = ['urgent', 'critique', 'important', 'alerte'];
            const foundKeywords = [];
            
            lines.forEach((line, index) => {
                keywords.forEach(keyword => {
                    if (line.toLowerCase().includes(keyword)) {
                        foundKeywords.push({line: index + 1, keyword: keyword});
                    }
                });
            });
            
            if (foundKeywords.length > 0 && statusDiv) {
                const keywordDiv = document.createElement('div');
                keywordDiv.style.marginTop = '15px';
                
                const keywordP = document.createElement('p');
                const keywordStrong = document.createElement('strong');
                keywordStrong.textContent = '🔍 Mots-clés trouvés:';
                keywordP.appendChild(keywordStrong);
                
                const keywordList = document.createElement('ul');
                keywordList.style.marginLeft = '20px';
                
                foundKeywords.slice(0, 10).forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `Ligne ${item.line}: "${item.keyword}"`;
                    keywordList.appendChild(li);
                });
                
                keywordDiv.appendChild(keywordP);
                keywordDiv.appendChild(keywordList);
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
    // Load or generate alerts
    if (!loadAlertsFromStorage()) {
        generateDartyAlerts();
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
    
    // Auto-save alerts every 30 seconds
    setInterval(function() {
        if (alerts.length > 0) {
            saveAlertsToStorage();
        }
    }, 30000);
});