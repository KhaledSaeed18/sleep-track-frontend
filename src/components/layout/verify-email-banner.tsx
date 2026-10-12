'use client';

import { MailWarning, X } from 'lucide-react';
import { useResendVerification } from '@/features/account/hooks';
import { useUser } from '@/features/auth';
import { useUiStore } from '@/stores/ui-store';

export function VerifyEmailBanner() {
  const user = useUser();
  const resend = useResendVerification();
  const dismissed = useUiStore((state) => state.verifyBannerDismissed);
  const dismiss = useUiStore((state) => state.dismissVerifyBanner);

  if (user.is_email_verified || user.is_demo || dismissed) return null;

  return (
    <div
      role="status"
      className="alert rounded-none border-x-0 border-t-0 alert-soft px-4 py-2.5 alert-warning sm:px-6"
    >
      <MailWarning className="size-4 shrink-0" aria-hidden="true" />
      <p className="text-sm">
        Confirm your email address to secure your account. We sent a link to{' '}
        <strong>{user.email}</strong>.
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => resend.mutate()}
          disabled={resend.isPending || resend.isSuccess}
        >
          {resend.isSuccess ? 'Email sent' : resend.isPending ? 'Sending…' : 'Resend email'}
        </button>
        <button
          type="button"
          className="btn btn-square btn-ghost btn-xs"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
