import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/LegalPage'
import { legalDocs } from '../lib/legal'

const doc = legalDocs['kullanim-kosullari']

export const Route = createFileRoute('/kullanim-kosullari')({
  component: () => <LegalPage slug="kullanim-kosullari" />,
  head: () => ({ meta: [{ title: `${doc.title} — Semih Algan` }, { name: 'description', content: doc.description }] }),
})
