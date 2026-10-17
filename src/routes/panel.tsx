import { createFileRoute } from '@tanstack/react-router'
import { PanelPage } from '../components/PanelPage'

export const Route = createFileRoute('/panel')({
  component: PanelPage,
  head: () => ({ meta: [{ title: 'Kullanıcı paneli — Semih Algan' }, { name: 'robots', content: 'noindex' }] }),
})
