import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Hero } from '@/features/marketing/components/hero';
import {
  AnalyticsShowcase,
  FAQS,
  Faq,
  Features,
  FinalCta,
  HowItWorks,
} from '@/features/marketing/components/sections';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Hero />
      <Features />
      <HowItWorks />
      <AnalyticsShowcase />
      <Faq />
      <FinalCta />
    </>
  );
}
