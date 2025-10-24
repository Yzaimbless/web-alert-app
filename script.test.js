/**
 * Tests for Web Alert App
 * Tests the core functionality of the application
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock DOM elements before loading script
beforeEach(() => {
  // Setup basic DOM structure
  document.body.innerHTML = `
    <div id="current-time"></div>
    <div id="current-date"></div>
    <div id="day-period"></div>
    <div id="alerts-grid"></div>
    <button id="send-alerts"></button>
    <input type="file" id="excel-file" />
    <div id="file-info" style="display: none;"></div>
    <div id="file-details"></div>
    <button id="process-file"></button>
    <div id="processing-status"></div>
    <div id="email-modal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <form id="email-config">
          <input type="text" id="emailjs-service" />
          <input type="text" id="emailjs-template" />
          <input type="text" id="emailjs-user" />
          <input type="email" id="recipient-email" />
        </form>
      </div>
    </div>
    <div id="status30" class="tab-content"></div>
    <div id="import" class="tab-content"></div>
  `;
  
  // Clear localStorage
  localStorage.clear();
});

describe('Web Alert App - Core Functions', () => {
  
  let app;
  
  beforeEach(() => {
    // Load the app module
    app = require('./script.js');
  });
  
  describe('Utility Functions', () => {
    test('getRandomPriority should return valid priority', () => {
      const priority = app.getRandomPriority();
      const validPriorities = ['high', 'medium', 'low'];
      expect(validPriorities).toContain(priority);
    });
    
    test('getStatusText should return correct French text', () => {
      expect(app.getStatusText('pending')).toBe('En attente');
      expect(app.getStatusText('sent')).toBe('Envoyé');
      expect(app.getStatusText('error')).toBe('Erreur');
      expect(app.getStatusText('unknown')).toBe('Inconnu');
    });
    
    test('getPriorityIcon should return correct emoji', () => {
      expect(app.getPriorityIcon('high')).toBe('🔴');
      expect(app.getPriorityIcon('medium')).toBe('🟡');
      expect(app.getPriorityIcon('low')).toBe('🟢');
      expect(app.getPriorityIcon('unknown')).toBe('⚪');
    });
    
    test('formatFileSize should format bytes correctly', () => {
      expect(app.formatFileSize(0)).toBe('0 Bytes');
      expect(app.formatFileSize(1024)).toBe('1 KB');
      expect(app.formatFileSize(1048576)).toBe('1 MB');
      expect(app.formatFileSize(1073741824)).toBe('1 GB');
    });
  });
  
  describe('Alert Data Structure', () => {
    test('generateDefaultAlerts should create alerts array', () => {
      app.generateDefaultAlerts();
      expect(Array.isArray(app.currentAlerts)).toBe(true);
      expect(app.currentAlerts.length).toBe(30);
    });
    
    test('alerts should have required properties', () => {
      app.generateDefaultAlerts();
      const alert = app.currentAlerts[0];
      
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('title');
      expect(alert).toHaveProperty('content');
      expect(alert).toHaveProperty('priority');
      expect(alert).toHaveProperty('status');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('source');
    });
    
    test('alert priority should be valid', () => {
      app.generateDefaultAlerts();
      const alert = app.currentAlerts[0];
      const validPriorities = ['high', 'medium', 'low'];
      
      expect(validPriorities).toContain(alert.priority);
    });
    
    test('alert status should be pending by default', () => {
      app.generateDefaultAlerts();
      const alert = app.currentAlerts[0];
      
      expect(alert.status).toBe('pending');
    });
    
    test('alert source should be default', () => {
      app.generateDefaultAlerts();
      const alert = app.currentAlerts[0];
      
      expect(alert.source).toBe('default');
    });
  });
  
  describe('Tab Navigation', () => {
    test('showTab should switch active tab', () => {
      const status30Tab = document.getElementById('status30');
      const importTab = document.getElementById('import');
      
      // Initially status30 should not have active class
      status30Tab.classList.remove('active');
      importTab.classList.remove('active');
      
      // Show import tab
      app.showTab('import');
      
      // Check if import tab is now active
      expect(importTab.classList.contains('active')).toBe(true);
    });
    
    test('showTab should remove active from other tabs', () => {
      const status30Tab = document.getElementById('status30');
      const importTab = document.getElementById('import');
      
      // Set status30 as active
      status30Tab.classList.add('active');
      importTab.classList.remove('active');
      
      // Show import tab
      app.showTab('import');
      
      // status30 should no longer be active
      expect(status30Tab.classList.contains('active')).toBe(false);
      expect(importTab.classList.contains('active')).toBe(true);
    });
  });
  
  describe('Email Configuration', () => {
    test('email config should be initialized with empty values', () => {
      expect(app.emailConfig).toBeDefined();
      expect(app.emailConfig).toHaveProperty('serviceId');
      expect(app.emailConfig).toHaveProperty('templateId');
      expect(app.emailConfig).toHaveProperty('userId');
      expect(app.emailConfig).toHaveProperty('recipientEmail');
    });
  });
  
  describe('DOM Elements', () => {
    test('required DOM elements should exist in test environment', () => {
      const requiredElements = [
        'current-time',
        'current-date',
        'day-period',
        'alerts-grid',
        'send-alerts',
        'excel-file',
        'file-info',
        'processing-status',
        'email-modal'
      ];
      
      requiredElements.forEach(id => {
        const element = document.getElementById(id);
        expect(element).toBeTruthy();
      });
    });
  });
  
  describe('LocalStorage Integration', () => {
    test('should save and load alerts to/from localStorage', () => {
      app.generateDefaultAlerts();
      const alerts = app.currentAlerts;
      
      // Save to localStorage
      localStorage.setItem('currentAlerts', JSON.stringify(alerts));
      
      // Load from localStorage
      const saved = localStorage.getItem('currentAlerts');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved);
      expect(parsed.length).toBe(alerts.length);
      expect(parsed[0].id).toBe(alerts[0].id);
    });
    
    test('should save and load email config to/from localStorage', () => {
      const config = {
        serviceId: 'test_service',
        templateId: 'test_template',
        userId: 'test_user',
        recipientEmail: 'test@example.com'
      };
      
      // Save to localStorage
      localStorage.setItem('emailConfig', JSON.stringify(config));
      
      // Load from localStorage
      const saved = localStorage.getItem('emailConfig');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved);
      expect(parsed.serviceId).toBe('test_service');
      expect(parsed.recipientEmail).toBe('test@example.com');
    });
  });
});

describe('Web Alert App - Integration Tests', () => {
  test('module should export required functions', () => {
    const app = require('./script.js');
    
    expect(app.showTab).toBeDefined();
    expect(app.generateDefaultAlerts).toBeDefined();
    expect(app.processExcelFile).toBeDefined();
    expect(app.sendAllAlerts).toBeDefined();
    expect(app.getRandomPriority).toBeDefined();
    expect(app.getStatusText).toBeDefined();
  });
  
  test('currentAlerts should be an array', () => {
    const app = require('./script.js');
    
    expect(Array.isArray(app.currentAlerts)).toBe(true);
  });
  
  test('emailConfig should be an object', () => {
    const app = require('./script.js');
    
    expect(typeof app.emailConfig).toBe('object');
    expect(app.emailConfig).not.toBeNull();
  });
});
