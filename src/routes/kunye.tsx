import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/LegalPage'
import { legalDocs } from '../lib/legal'

const doc = legalDocs['kunye']

export const Route = createFileRoute('/kunye')({
  component: () => <LegalPage slug="kunye" />,
  head: () => ({ meta: [{ title: `${doc.title} — Semih Algan` }, { name: 'description', content: doc.description }] }),
})
