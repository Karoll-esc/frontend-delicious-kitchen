module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(test|spec).{js,jsx}', '**/?(*.)+(test|spec).{js,jsx}'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Permite transformar dependencias modernas de node_modules si es necesario
  transformIgnorePatterns: [
    '/node_modules/(?!(react|react-dom|@testing-library|@babel|lodash-es)/)'
  ],
};
