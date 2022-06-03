import { InitialOptionsTsJest } from 'ts-jest'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    'csv-parse/sync': '<rootDir>/node_modules/csv-parse/dist/cjs/sync.cjs'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  forceExit: true
} as InitialOptionsTsJest
