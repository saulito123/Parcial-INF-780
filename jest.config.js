
module.exports = {
 preset: 'ts-jest',
 testEnvironment: 'node',
 moduleFileExtensions: ['js','json','ts'],rootDir: '.',
 testRegex: '.spec.ts$',
 transform: { '^.+\\.ts$': 'ts-jest' },
 collectCoverageFrom: ['src/**/*.(t|j)s'],
 coverageDirectory: './coverage',
 // Corregido: Mapeo de módulos
moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

 testTimeout: 60000 
};
