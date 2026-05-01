const React = require('react');
const { ProgramList } = require('../../src/features/catalog/ProgramList');

describe('ProgramList UI', () => {
  it('renders a list of programs correctly', () => {
    const mockPrograms = [
      { id: '1', title: 'MS Computer Science', url: 'http://example.com' }
    ];
    
    // Call function directly to get VDOM object
    const element = ProgramList({ programs: mockPrograms });
    expect(element).toBeDefined();
    // It returns a 'div' as root
    expect(element.type).toBe('div');
    // Inside the div, there should be an array of children (the programs)
    const children = element.props.children;
    expect(children.length).toBe(1);
    expect(children[0].type).toBe('div');
  });
});
