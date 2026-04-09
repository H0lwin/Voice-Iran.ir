'use client'

import { ContentLibraryList } from '@/components/dashboard/content-library-list'
import apiClient from '@/lib/api/client'
import type { Weapon } from '@/lib/types'

export default function ArsenalListPage() {
  return (
    <ContentLibraryList<Weapon>
      app="arsenal"
      title="تسلیحات"
      description="فهرست و مشاهده محتوای بخش تسلیحات"
      typeLabel="تسلیحات"
      fetchAll={(filters) => apiClient.getWeapons(filters)}
      basePath="/dashboard/arsenal"
      categoryLabel="رده"
      getCategoryLabel={(row) => (row as Weapon).weaponCategory?.name}
    />
  )
}
