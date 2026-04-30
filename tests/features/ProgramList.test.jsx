const React = require('react');
const { ProgramList } = require('../../src/features/catalog/ProgramList');

describe('ProgramList UI', () => {
  it('renders a list of programs correctly', () => {
    const mockPrograms = [
      { id: '1', title: 'MS Computer Science', url: 'http://example.com' }
    ];
    
    // Simple rendering check without DOM rendering for testing the exported pure function
    const element = ProgramList({ programs: mockPrograms });
    expect(element).toBeDefined();
    expect(element.props.children).toBeDefined();
    
    const programNodes = element.props.children;
    expect(programNodes.length).toBe(1);
    expect(programNodes[0].props.children[0].props.children).toBe('MS Computer Science');
  });
});
