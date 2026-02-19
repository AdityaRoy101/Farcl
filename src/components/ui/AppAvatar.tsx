// components/ui/AppAvatar.tsx
import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVgPimc_RQYYbUhV3A_xER8GPifFju7nveLA&s"

interface AppAvatarProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md"
  className?: string
}

export function AppAvatar({
  src,
  alt = "User",
  size = "md",
  className,
}: AppAvatarProps) {
  const sizeClasses =
    size === "sm" ? "h-8 w-8" : "h-10 w-10"

  return (
    <Avatar className={`${sizeClasses} ${className ?? ""}`}>
      {/* Primary image */}
      <AvatarImage
        src={src || DEFAULT_AVATAR_URL}
        alt={alt}
      />

      {/* Fallback image (NOT initials) */}
      <AvatarFallback>
        <img
          src={DEFAULT_AVATAR_URL}
          alt="Default avatar"
          className="h-full w-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  )
}
