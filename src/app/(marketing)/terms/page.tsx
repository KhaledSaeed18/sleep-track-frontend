import type { Metadata } from 'next';
import { LegalPage } from '@/features/marketing/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'The terms for using SleepTrack.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="October 12, 2026">
      <section>
        <h2>Using SleepTrack</h2>
        <p>
          SleepTrack is a free, open-source sleep journal provided as is. By creating an account you
          agree to use it lawfully and keep your sign-in details private.
        </p>
      </section>
      <section>
        <h2>Not medical advice</h2>
        <p>
          Scores, insights and recommendations describe patterns in the data you enter. They are not
          a diagnosis or treatment. If you have persistent sleep problems, talk to a qualified
          clinician.
        </p>
      </section>
      <section>
        <h2>Your content</h2>
        <p>You own the data you log. You can export or delete it at any time from Settings.</p>
      </section>
      <section>
        <h2>Availability</h2>
        <p>
          We aim to keep SleepTrack running smoothly but cannot guarantee uninterrupted service.
          Keep your own export if the data matters to you.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>
          These terms may be updated. Material changes will be announced in the app before they take
          effect.
        </p>
      </section>
    </LegalPage>
  );
}
