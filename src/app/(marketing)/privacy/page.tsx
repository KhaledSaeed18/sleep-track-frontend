import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { LegalPage } from '@/features/marketing/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What SleepTrack stores, why, and how to export or delete it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="October 12, 2026">
      <section>
        <h2>The short version</h2>
        <p>
          SleepTrack stores the nights you log so it can show them back to you. It does not sell
          your data, show ads or share your nights with anyone.
        </p>
      </section>
      <section>
        <h2>What we store</h2>
        <ul>
          <li>
            Your account: name, email address, an optional date of birth and avatar link, and a
            hashed password.
          </li>
          <li>Your sleep data: the nights, ratings, tags, notes and goals you enter.</li>
          <li>
            Security records: active sessions and an activity log with IP address and browser, so
            you can spot unfamiliar sign-ins.
          </li>
        </ul>
      </section>
      <section>
        <h2>How it is used</h2>
        <p>
          Your data powers your own dashboard, analytics, insights and weekly report. Emails are
          limited to account notices and the reports you opt into in Preferences.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          SleepTrack uses a small number of first-party cookies to keep you signed in and to protect
          requests from forgery. There are no analytics or advertising cookies. Your theme choice is
          kept in local storage.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          From Settings you can export everything as CSV or JSON, sign out other devices and
          permanently delete your account and all of its data. Demo accounts are temporary and
          removed automatically.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about privacy:{' '}
          <a className="link" href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
