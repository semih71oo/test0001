import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/LegalPage'
import { legalDocs } from '../lib/legal'

const doc = legalDocs['kvkk']

export const Route = createFileRoute('/kvkk')({
  component: () => <LegalPage slug="kvkk" />,
  head: () => ({ meta: [{ title: `${doc.title} — Semih Algan` }, { name: 'description', content: doc.description }] }),
})
