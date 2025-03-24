import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../HomePage';

// Mock the CSS module
jest.mock('../../styles/HomePage.module.css', () => ({
  root: 'root-class',
  container: 'container-class',
  header: 'header-class',
  title: 'title-class',
  description: 'description-class',
  content: 'content-class',
}));

describe('HomePage Component', () => {
  it('renders with default props', () => {
    render(<HomePage />);
    
    // Check that default title and description are rendered
    expect(screen.getByText('Designed For You')).toBeInTheDocument();
    expect(screen.getByText('Professional web development and design services')).toBeInTheDocument();
  });
  
  it('renders with custom props', () => {
    const testProps = {
      title: 'Custom Title',
      description: 'Custom description text',
      className: 'custom-class',
    };
    
    render(<HomePage {...testProps} />);
    
    // Check that custom title and description are rendered
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
    
    // Check that custom class is applied
    const rootElement = screen.getByText('Custom Title').closest('div');
    expect(rootElement).toHaveClass('custom-class');
  });
}); 