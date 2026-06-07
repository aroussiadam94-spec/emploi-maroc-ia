/**
 * components/DashboardLayoutSkeleton.tsx
 * Full-page loading skeleton shown while the Dashboard data is being fetched.
 *
 * The skeleton mirrors the visual structure of DashboardLayout:
 *   • Left sidebar with logo placeholder, menu items, and a user profile area.
 *   • Main content area with a heading placeholder and a grid of content cards.
 *
 * Using a skeleton instead of a spinner provides a better perceived performance
 * by showing the approximate final layout immediately.
 */

import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton – mirrors the fixed left navigation panel */}
      <div className="w-[280px] border-r border-border bg-background p-4 space-y-6">
        {/* Logo area placeholder */}
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-8 w-8 rounded-md" />   {/* Brand icon */}
          <Skeleton className="h-4 w-24" />              {/* Brand name */}
        </div>

        {/* Menu items placeholder – three navigation rows */}
        <div className="space-y-2 px-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* User profile area at bottom – avatar + name + email */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-9 w-9 rounded-full" /> {/* Avatar */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />           {/* Name */}
              <Skeleton className="h-2 w-32" />           {/* Email */}
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton – page heading + stat cards + detail section */}
      <div className="flex-1 p-4 space-y-4">
        {/* Content blocks */}
        <Skeleton className="h-12 w-48 rounded-lg" />   {/* Page title */}

        {/* Stat/summary card grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        {/* Large detail panel below the cards */}
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
