"use client"

import {ReactNode} from 'react'
import {AppHeader} from './AppHeader'
import {BottomNav} from './BottomNav'

interface AppShellProps {
  children: ReactNode
  headerTitle?: string
  showBack?: boolean
  transparentHeader?: boolean
  hideNav?: boolean
}

export function AppShell({children, headerTitle, showBack, transparentHeader = false, hideNav = false}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <AppHeader title={headerTitle} showBack={showBack} transparent={transparentHeader} />
      <main id="main" className={`pt-14 ${!hideNav ? 'pb-20' : 'pb-4'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
