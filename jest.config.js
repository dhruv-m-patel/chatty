const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/microservices/*/jest.config.js',
    '<rootDir>/packages/*/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  roots: ['<rootDir>/microservices', '<rootDir>/packages'],
  collectCoverageFrom: ['*/src/**/*.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules'],
};
