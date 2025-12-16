const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for E2E tests
    baseUrl: 'http://localhost:3000',
    
    // Test timeout configurations
    taskTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    defaultCommandTimeout: 10000,
    execTimeout: 60000,
    pageLoadTimeout: 30000,
    
    // Video and screenshot settings
    video: true,
    videoOnFailOnly: false,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Test patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Reporter settings
    reporter: 'spec',
    reporterOptions: {
      mochaFile: 'cypress/results/test-results.json',
    },
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Browser settings
    browsers: [
      {
        name: 'chrome',
        family: 'chromium',
        channel: 'stable',
        displayName: 'Chrome',
        version: 'stable',
        path: '',
        majorVersion: '',
      },
    ],
    
    // Disable web security for testing
    chromeWebSecurity: false,
    
    // Delay between commands
    commandDelay: 0,
    
    // Retry settings
    retries: {
      runMode: 1,
      openMode: 0,
    },
    
    // Setup node events
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
  
  // Environment variables
  env: {
    BASE_URL: 'http://localhost:3000',
    API_URL: 'https://ktpm-sgu-doan-production.up.railway.app',
  },
});
