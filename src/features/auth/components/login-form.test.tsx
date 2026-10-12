import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { router, setSearchParams } from '@/test/next-navigation';
import { renderWithClient } from '@/test/utils';
import { tokenStore } from '@/lib/auth/token-store';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('validates before submitting', async () => {
    setSearchParams('');
    const { user } = renderWithClient(<LoginForm />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('shows a clear message for wrong credentials', async () => {
    setSearchParams('');
    const { user } = renderWithClient(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'demo@sleeptrack.app');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'wrong-password1');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password do not match',
    );
  });

  it('signs in and redirects to the requested page', async () => {
    setSearchParams('next=%2Fjournal');
    const { user } = renderWithClient(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'demo@sleeptrack.app');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'DemoPass123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/journal'));
    expect(tokenStore.get()).toMatch(/^mock\./);
  });

  it('explains why the user landed here', () => {
    setSearchParams('expired=1');
    renderWithClient(<LoginForm />);
    expect(screen.getByRole('status')).toHaveTextContent('Your session ended');
  });
});
