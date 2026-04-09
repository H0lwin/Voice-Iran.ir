'use client'

import { ContentLibraryList } from '@/components/dashboard/content-library-list'
import apiClient from '@/lib/api/client'
import type { Martyr } from '@/lib/types'

export default function MartyrsListPage() {
  return (
    <ContentLibraryList<Martyr>
      app="martyrs"
      title="شهدا"
      description="فهرست و مشاهده محتوای یادواره شهدا"
      typeLabel="شهدا"
      fetchAll={(filters) => apiClient.getMartyrs(filters)}
      basePath="/dashboard/martyrs"
      categoryLabel="دسته"
      getCategoryLabel={(row) => (row as Martyr).martyrCategory?.name}
    />
  )
}
