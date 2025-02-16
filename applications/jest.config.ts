import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps'],
  moduleNameMapper: {
    '^clients/(.*)$': '<rootDir>/clients/$1',
    '^schemas/(.*)$': '<rootDir>/schemas/$1',
    '^pipes/(.*)$': '<rootDir>/pipes/$1',
  },
};

export default config;
