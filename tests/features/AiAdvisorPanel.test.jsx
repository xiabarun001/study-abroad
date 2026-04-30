const React = require('react');
const { AiAdvisorPanel } = require('../../src/features/advisor/AiAdvisorPanel');

describe('AiAdvisorPanel UI', () => {
  beforeEach(() => {
    // Mock useState to just return the initial value and a dummy setter
    jest.spyOn(React, 'useState').mockImplementation((initialValue) => [initialValue, jest.fn()]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders advisor panel correctly', () => {
    const element = AiAdvisorPanel();
    expect(element).toBeDefined();
    expect(element.props.className).toBe('advisor-panel');
    
    // Check if it renders a textarea for input and a button
    const children = element.props.children;
    const hasTextarea = children.some(child => child && child.type === 'textarea');
    const hasButton = children.some(child => child && child.type === 'button');
    
    expect(hasTextarea).toBe(true);
    expect(hasButton).toBe(true);
  });
});
