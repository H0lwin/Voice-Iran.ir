'use client'

import { ContentLibraryList } from '@/components/dashboard/content-library-list'
import { martyrsApi } from '@/lib/api/api-client'
import type { Martyr } from '@/lib/types'

export default function MartyrsListPage() {
  return (
    <ContentLibraryList<Martyr>
      app="martyrs"
      title="شهدا"
      description="فهرست و مشاهدهٔ محتوای یادوارهٔ شهدا"
      typeLabel="شهدا"
      fetchAll={martyrsApi.getAll}
      basePath="/dashboard/martyrs"
      categoryLabel="دسته"
      getCategoryLabel={(row) => row.martyrCategory?.name}
    />
  )
}
