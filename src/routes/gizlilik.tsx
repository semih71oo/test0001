import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/LegalPage'
import { legalDocs } from '../lib/legal'

const doc = legalDocs['gizlilik']

export const Route = createFileRoute('/gizlilik')({
  component: () => <LegalPage slug="gizlilik" />,
  head: () => ({ meta: [{ title: `${doc.title} — Semih Algan` }, { name: 'description', content: doc.description }] }),
})
