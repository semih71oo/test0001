import { createFileRoute } from '@tanstack/react-router'
import { PanelPage } from '../components/PanelPage'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
  head: () => ({ meta: [{ title: 'Admin paneli — Semih Algan' }, { name: 'robots', content: 'noindex' }] }),
})

function AdminPage() {
  return <PanelPage adminOnly />
}
