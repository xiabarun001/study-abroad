const React = require('react');
const { ProgramList } = require('../../src/features/catalog/ProgramList');

describe('ProgramList Component', () => {
  it('should export ProgramList function', () => {
    expect(typeof ProgramList).toBe('function');
  });
});
