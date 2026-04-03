import { ProtectedLayout } from '@/app/protected-layout'
import { TabsLayout } from '@/app/tabs/layout'
import { FeedPage } from '@/app/tabs/feed/page'
import { Navigation } from '@/components/layout/navigation'

export default function Root() {
  return (
    <ProtectedLayout>
      <Navigation>
        <TabsLayout>
          <FeedPage />
        </TabsLayout>
      </Navigation>
    </ProtectedLayout>
  )
}