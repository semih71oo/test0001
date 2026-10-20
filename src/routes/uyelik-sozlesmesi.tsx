import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/LegalPage'
import { legalDocs } from '../lib/legal'

const doc = legalDocs['uyelik-sozlesmesi']

export const Route = createFileRoute('/uyelik-sozlesmesi')({
  component: () => <LegalPage slug="uyelik-sozlesmesi" />,
  head: () => ({ meta: [{ title: `${doc.title} — Semih Algan` }, { name: 'description', content: doc.description }] }),
})
