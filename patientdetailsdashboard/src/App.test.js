import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Supabase setup message when env vars are missing', () => {
  render(<App />);
  expect(screen.getByText(/supabase is not configured/i)).toBeInTheDocument();
});
