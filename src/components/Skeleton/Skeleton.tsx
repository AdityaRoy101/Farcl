// src/components/Skeleton/Skeleton.tsx
import React from "react";

function classNames(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "rounded";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "shimmer" | "none";
}

export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    animation = "pulse",
}: SkeletonProps) {
    const baseClasses = "bg-gray-300/60";

    const animationClasses = {
        pulse: "animate-pulse",
        shimmer:
            "animate-shimmer bg-gradient-to-r from-gray-300/60 via-gray-200/60 to-gray-300/60 bg-[length:200%_100%]",
        none: "",
    };

    const variantClasses = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "",
        rounded: "rounded-xl",
    };

    const widthClass = typeof width === "number" ? `w-[${width}px]` : width ? `w-[${width}]` : "";
    const heightClass = typeof height === "number" ? `h-[${height}px]` : height ? `h-[${height}]` : "";

    return (
        <div
            className={classNames(
                baseClasses,
                animationClasses[animation],
                variantClasses[variant],
                widthClass,
                heightClass,
                className
            )}
        />
    );
}

// Navigation Item Skeleton (with up-down arrow)
function NavItemSkeleton({ width = "w-28" }: { width?: string }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            {/* Icon */}
            <Skeleton variant="rectangular" className="w-5 h-5 flex-shrink-0" />
            {/* Text */}
            <Skeleton variant="rectangular" className={classNames("h-4", width)} />
            {/* Up-Down Arrow Icon */}
            <div className="flex flex-col gap-0.5 ml-1">
                <Skeleton variant="rectangular" className="w-2 h-1 rounded-sm" />
                <Skeleton variant="rectangular" className="w-2 h-1 rounded-sm" />
            </div>
        </div>
    );
}

// Header Skeleton Component - Matches the Header with gradient
export function HeaderSkeleton() {
    return (
        <header
            className="border-b border-cyan-200/50 sticky top-0 z-50 bg-white"
        >
            <div className="flex items-center justify-between px-4 md:px-6 py-3">
                {/* Left Section: Logo/Sidebar Skeleton */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Mobile Menu Button Skeleton */}
                    <div className="lg:hidden">
                        <Skeleton
                            variant="rounded"
                            className="w-10 h-10 bg-white/50"
                        />
                    </div>

                    {/* Logo/Sidebar Static Content */}
                    {/* Placeholder to maintain header height without visible content */}
                    <div className="h-9 md:h-10 w-px opacity-0" aria-hidden="true" />
                </div>

                {/* Desktop Navigation Skeleton - Positioned to align with sidebar */}
                <nav className="hidden lg:flex items-center gap-1 absolute left-[288px]">
                    {/* Organizations Skeleton */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/30 backdrop-blur-sm">
                        <Skeleton
                            variant="rounded"
                            className="w-27 h-5 flex-shrink-0 bg-blue-300/50"
                        />
                        {/* <Skeleton
                            variant="rectangular"
                            className="w-24 h-4 bg-white/60"
                        /> */}
                        {/* Up-Down Arrow */}
                        <svg
                            className="w-3.5 h-3.5 text-gray-400/60 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>

                    <span className="text-gray-400/60 mx-1 font-light">/</span>

                    {/* Workspaces Skeleton */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/30 backdrop-blur-sm">
                        <Skeleton
                            variant="rounded"
                            className="w-27 h-5 flex-shrink-0 bg-blue-300/50"
                        />
                        {/* <Skeleton
                            variant="rounded"
                            className="w-20 h-4 bg-white/60"
                        /> */}
                        {/* Up-Down Arrow */}
                        <svg
                            className="w-3.5 h-3.5 text-gray-400/60 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>

                    <span className="text-gray-400/60 mx-1 font-light">/</span>

                    {/* Projects Skeleton */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/30 backdrop-blur-sm">
                        <Skeleton
                            variant="rounded"
                            className="w-27 h-5 flex-shrink-0 bg-blue-300/50"
                        />

                        {/* Up-Down Arrow */}
                        <svg
                            className="w-3.5 h-3.5 text-gray-400/60 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>
                </nav>

                {/* Right Section: Search, Notifications, Profile */}

            </div>
        </header>
    );
}

// Sidebar Skeleton Component
export function SidebarSkeleton() {
    return (
        <aside className="hidden lg:block w-72 bg-white/70 backdrop-blur-sm border-r border-gray-200 p-5 min-h-[calc(100vh-65px)] sticky top-[65px]">

            {/* List Items Skeleton */}
            <div className="space-y-1">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100"
                    >
                        <Skeleton variant="circular" className="w-2 h-2 flex-shrink-0" />
                        <div className="flex-1">
                            <Skeleton
                                variant="rounded"
                                className={classNames(
                                    "h-4",
                                    i === 1 ? "w-3/4" : i === 2 ? "w-2/3" : "w-1/2"
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>


            {/* Additional skeleton items */}

        </aside>
    );
}

// Welcome Section Skeleton Component
export function WelcomeSkeleton() {
    return (
        <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50" />
            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    {/* Title Skeleton */}
                    <div className="space-y-2">
                        <Skeleton variant="rounded" className="w-72 md:w-96 h-10 md:h-12" />
                    </div>

                    {/* Subtitle Skeleton */}
                    <div className="space-y-2">
                        <Skeleton variant="rounded" className="w-full max-w-xl h-5" />
                        <Skeleton variant="rounded" className="w-3/4 max-w-md h-5" />
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Skeleton variant="rounded" className="w-48 h-12" />
                        <Skeleton variant="rounded" className="w-44 h-12" />
                    </div>

                    {/* Breadcrumb Skeleton */}
                    <div className="pt-2">
                        <Skeleton variant="rounded" className="w-64 h-4" />
                    </div>
                </div>

            </div>
        </div>
    );
}

// Checklist Skeleton Component
export function ChecklistSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 md:p-6 mb-6 md:mb-8 border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="space-y-2">
                    <Skeleton variant="rounded" className="w-48 h-7" />
                    <Skeleton variant="rounded" className="w-64 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" className="w-24 h-4" />
                    <Skeleton variant="rounded" className="w-32 h-2" />
                </div>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200"
                    >
                        <Skeleton variant="rounded" className="w-10 h-10 flex-shrink-0" />
                        <Skeleton variant="rounded" className="flex-1 h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Project Card Skeleton (for future use)
export function ProjectCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
                <Skeleton variant="rounded" className="w-12 h-12 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="rounded" className="w-3/4 h-5" />
                    <Skeleton variant="rounded" className="w-1/2 h-4" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton variant="rounded" className="w-16 h-6" />
                        <Skeleton variant="rounded" className="w-16 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stats Card Skeleton (for future use)
export function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <Skeleton variant="rounded" className="w-24 h-4" />
                <Skeleton variant="circular" className="w-8 h-8" />
            </div>
            <Skeleton variant="rounded" className="w-20 h-8 mb-2" />
            <Skeleton variant="rounded" className="w-32 h-3" />
        </div>
    );
}

// Table Row Skeleton (for future use)
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton
                        variant="rounded"
                        className={classNames(
                            "h-4",
                            i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24"
                        )}
                    />
                </td>
            ))}
        </tr>
    );
}

// Combined Explore Page Skeleton (with Header)
export function ExplorePageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderSkeleton />
            <div className="flex flex-col lg:flex-row relative">
                <SidebarSkeleton />
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <WelcomeSkeleton />
                    <ChecklistSkeleton />
                </main>
            </div>
        </div>
    );
}
// Deploy Sidebar Skeleton Component
export function DeploySidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 min-h-[calc(100vh-65px)] sticky top-[65px]">
      <div className="p-4 space-y-5">
        <Skeleton className="w-24 h-3" />

        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-3/4 h-10 rounded-xl" />
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-40 rounded-xl" />
          </div>
        ))}
      </div>
    </aside>
  );
}
// Combined Deploy Page Skeleton (with Header and Deploy Sidebar)
export function DeployPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSkeleton />

      <div className="flex">
        <DeploySidebarSkeleton />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-full h-40 rounded-2xl" />
          <Skeleton className="w-full h-64 rounded-2xl" />
        </main>
      </div>
    </div>
  );
}

export default Skeleton;