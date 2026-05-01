const React = require('react');
const { AiAdvisorPanel } = require('../../src/features/advisor/AiAdvisorPanel');

describe('AiAdvisorPanel UI', () => {
  beforeEach(() => {
    jest.spyOn(React, 'useState').mockImplementation((initialValue) => [initialValue, jest.fn()]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders advisor panel correctly', () => {
    const element = AiAdvisorPanel({ programs: [] });
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
    
    // Quick check to see if it renders without crashing
    const children = element.props.children;
    expect(children.length).toBeGreaterThan(0);
  });
});
