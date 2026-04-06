'use client'

import { ContentLibraryList } from '@/components/dashboard/content-library-list'
import { documentsApi } from '@/lib/api/api-client'
import type { Document } from '@/lib/types'

export default function DocumentsListPage() {
  return (
    <ContentLibraryList<Document>
      app="documents"
      title="اسناد"
      description="فهرست و مشاهدهٔ اسناد و مدارک"
      typeLabel="اسناد"
      fetchAll={documentsApi.getAll}
      basePath="/dashboard/documents"
      categoryLabel="دسته سند"
      getCategoryLabel={(row) => row.documentCategory?.name}
    />
  )
}
