// Mock uuid package to avoid ESM import issues in Jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  v1: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  v3: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  v5: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  NIL: '00000000-0000-0000-0000-000000000000',
  parse: jest.fn((uuid) => uuid),
  stringify: jest.fn((uuid) => uuid),
  validate: jest.fn(() => true),
  version: jest.fn(() => 4),
}))
