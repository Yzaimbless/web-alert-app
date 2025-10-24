module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'script.js',
    '!node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  moduleFileExtensions: ['js'],
  verbose: true
};
