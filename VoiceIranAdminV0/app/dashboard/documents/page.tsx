'use client'

import { ContentLibraryList } from '@/components/dashboard/content-library-list'
import apiClient from '@/lib/api/client'
import type { Document } from '@/lib/types'

export default function DocumentsListPage() {
  return (
    <ContentLibraryList<Document>
      app="documents"
      title="اسناد"
      description="فهرست و مشاهده اسناد و مدارک"
      typeLabel="اسناد"
      fetchAll={(filters) => apiClient.getDocuments(filters)}
      basePath="/dashboard/documents"
      categoryLabel="دسته سند"
      getCategoryLabel={(row) => (row as Document).documentCategory?.name}
    />
  )
}
