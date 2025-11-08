// Initialize alerts array
let alerts = [];

// Configuration constants
const KEYWORDS = ['urgent', 'critique', 'important', 'alerte', 'prioritaire', 'attention'];
const MAX_CONTENT_LENGTH = 100;

// Generate initial 30 alerts for Darty Status 30 tab
function initializeAlerts() {
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['pending', 'sent', 'error'];
    const alertTypes = [
        'Stock faible',
        'Livraison en retard',
        'Commande prioritaire',
        'Maintenance requise',
        'Alerte qualité',
        'Rupture de stock',
        'Promotion active',
        'Retour client',
        'Nouvelle commande',
        'Anomalie détectée'
    ];

    alerts = [];
    for (let i = 1; i <= 30; i++) {
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        alerts.push({
            id: i,
            title: `${type} #${i}`,
            content: `Alerte de type ${type} pour le magasin. Référence: ALT-${String(i).padStart(3, '0')}`,
            priority: priority,
            status: status,
            timestamp: new Date().toLocaleString('fr-FR')
        });
    }
    
    renderAlerts();
}

// Render alerts to the grid
function renderAlerts() {
    const grid = document.getElementById('alerts-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-item priority-${alert.priority}`;
        
        alertCard.innerHTML = `
            <div class="alert-header">
                <span class="alert-title">${alert.title}</span>
                <span class="alert-status status-${alert.status}">
                    ${alert.status === 'pending' ? 'En attente' : 
                      alert.status === 'sent' ? 'Envoyé' : 'Erreur'}
                </span>
            </div>
            <div class="alert-content">${alert.content}</div>
            <div class="alert-timestamp">${alert.timestamp}</div>
        `;
        
        grid.appendChild(alertCard);
    });
}

// Comprehensive Excel file reading - ALL sheets, ALL rows, ALL columns
let currentWorkbook = null;
let excelData = null;

// Handle file selection
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('excel-file');
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    const processButton = document.getElementById('process-file');
    const processingStatus = document.getElementById('processing-status');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show file info
            if (fileInfo) {
                fileInfo.style.display = 'block';
            }
            
            if (fileDetails) {
                fileDetails.innerHTML = `
                    <p><strong>Nom du fichier:</strong> ${file.name}</p>
                    <p><strong>Taille:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> ${file.type}</p>
                `;
            }
            
            // Read the file
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    currentWorkbook = XLSX.read(data, { type: 'array' });
                    
                    // Display workbook information
                    if (fileDetails && currentWorkbook) {
                        fileDetails.innerHTML += `
                            <p><strong>Nombre de feuilles:</strong> ${currentWorkbook.SheetNames.length}</p>
                            <p><strong>Feuilles:</strong> ${currentWorkbook.SheetNames.join(', ')}</p>
                        `;
                    }
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier Excel:', error);
                    if (processingStatus) {
                        processingStatus.className = 'processing-status error';
                        processingStatus.textContent = `Erreur: ${error.message}`;
                    }
                }
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Process button click handler
    if (processButton) {
        processButton.addEventListener('click', function() {
            if (!currentWorkbook) {
                if (processingStatus) {
                    processingStatus.className = 'processing-status error';
                    processingStatus.textContent = 'Aucun fichier chargé';
                }
                return;
            }
            
            processExcelFile();
        });
    }
    
    // Initialize alerts on page load
    initializeAlerts();
});

// Process Excel file - Read ALL sheets, ALL rows, ALL columns from A to Z
function processExcelFile() {
    if (!currentWorkbook) {
        console.error('Aucun fichier Excel chargé');
        return;
    }
    
    const processingStatus = document.getElementById('processing-status');
    
    try {
        // Clear existing status
        if (processingStatus) {
            processingStatus.className = 'processing-status info';
            processingStatus.textContent = 'Traitement en cours...';
        }
        
        excelData = {
            fileName: 'Imported Excel File',
            sheets: [],
            totalRows: 0,
            totalColumns: 0,
            totalCells: 0
        };
        
        let alertsGenerated = 0;
        
        // Process EVERY sheet
        currentWorkbook.SheetNames.forEach((sheetName, sheetIndex) => {
            const worksheet = currentWorkbook.Sheets[sheetName];
            
            // Get the range of the sheet (all cells from A to Z and beyond)
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            
            const sheetData = {
                name: sheetName,
                index: sheetIndex + 1,
                rows: [],
                rowCount: range.e.r - range.s.r + 1,
                columnCount: range.e.c - range.s.c + 1,
                cellCount: 0
            };
            
            // Read EVERY row
            for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex++) {
                const rowData = {
                    rowNumber: rowIndex + 1,
                    cells: []
                };
                
                // Read EVERY column (from A to Z and beyond)
                for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    const cell = worksheet[cellAddress];
                    
                    const cellData = {
                        address: cellAddress,
                        column: XLSX.utils.encode_col(colIndex),
                        row: rowIndex + 1,
                        value: cell ? (cell.v !== undefined ? cell.v : '') : '',
                        type: cell ? cell.t : '',
                        formula: cell && cell.f ? cell.f : ''
                    };
                    
                    rowData.cells.push(cellData);
                    sheetData.cellCount++;
                    
                    // Check for keywords to generate alerts
                    if (cellData.value && typeof cellData.value === 'string') {
                        const cellValueLower = cellData.value.toLowerCase();
                        for (const keyword of KEYWORDS) {
                            if (cellValueLower.includes(keyword)) {
                                alertsGenerated++;
                                alerts.push({
                                    id: alerts.length + 1,
                                    title: `Excel: ${sheetName} - ${cellAddress}`,
                                    content: `${cellData.value.substring(0, MAX_CONTENT_LENGTH)}${cellData.value.length > MAX_CONTENT_LENGTH ? '...' : ''}`,
                                    priority: keyword === 'urgent' || keyword === 'critique' ? 'high' : 
                                             keyword === 'important' || keyword === 'prioritaire' ? 'medium' : 'low',
                                    status: 'pending',
                                    timestamp: new Date().toLocaleString('fr-FR')
                                });
                                break;
                            }
                        }
                    }
                }
                
                sheetData.rows.push(rowData);
            }
            
            excelData.sheets.push(sheetData);
            excelData.totalRows += sheetData.rowCount;
            excelData.totalColumns = Math.max(excelData.totalColumns, sheetData.columnCount);
            excelData.totalCells += sheetData.cellCount;
        });
        
        // Display success message with detailed statistics
        if (processingStatus) {
            processingStatus.className = 'processing-status success';
            processingStatus.innerHTML = `
                <h3>✅ Fichier traité avec succès!</h3>
                <p><strong>Nombre de feuilles:</strong> ${excelData.sheets.length}</p>
                <p><strong>Total de lignes:</strong> ${excelData.totalRows}</p>
                <p><strong>Total de colonnes (max):</strong> ${excelData.totalColumns}</p>
                <p><strong>Total de cellules:</strong> ${excelData.totalCells}</p>
                <p><strong>Alertes générées:</strong> ${alertsGenerated}</p>
                <hr style="margin: 15px 0;">
                <h4>Détails par feuille:</h4>
                ${excelData.sheets.map(sheet => `
                    <p><strong>${sheet.name}:</strong> ${sheet.rowCount} lignes × ${sheet.columnCount} colonnes = ${sheet.cellCount} cellules</p>
                `).join('')}
            `;
        }
        
        // Update alerts display
        renderAlerts();
        
        // Log complete data to console for verification
        console.log('=== LECTURE COMPLÈTE DU FICHIER EXCEL ===');
        console.log('Nombre de feuilles:', excelData.sheets.length);
        console.log('Détails complets:', excelData);
        
        excelData.sheets.forEach(sheet => {
            console.log(`\n=== FEUILLE: ${sheet.name} ===`);
            console.log(`Lignes: ${sheet.rowCount}, Colonnes: ${sheet.columnCount}, Cellules: ${sheet.cellCount}`);
            console.log('Données complètes:', sheet.rows);
        });
        
    } catch (error) {
        console.error('Erreur lors du traitement du fichier Excel:', error);
        if (processingStatus) {
            processingStatus.className = 'processing-status error';
            processingStatus.textContent = `Erreur: ${error.message}`;
        }
    }
}

// Save alerts to localStorage every 30 seconds
setInterval(function() {
    if (alerts.length > 0) {
        localStorage.setItem('darty_alerts', JSON.stringify(alerts));
    }
}, 30000);

// Load alerts from localStorage on startup
try {
    const savedAlerts = localStorage.getItem('darty_alerts');
    if (savedAlerts) {
        alerts = JSON.parse(savedAlerts);
        renderAlerts();
    }
} catch (error) {
    console.error('Erreur lors du chargement des alertes:', error);
}
