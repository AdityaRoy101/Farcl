// src/lib/globalConfig.ts

export const globalTypography = {
    fontFamily: {
        sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    },

    fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    },

    // Heading styles
    headings: {
        h1: {
            sizes: ["text-2xl", "text-3xl", "text-4xl", "text-5xl"], // Responsive: md, lg, xl
            weight: "font-bold",
            color: "text-gray-900",
        },
        h2: {
            sizes: ["text-xl", "text-2xl"],
            weight: "font-bold",
            color: "text-gray-900",
        },
        h3: {
            sizes: ["text-base", "text-lg"],
            weight: "font-semibold",
            color: "text-gray-900",
        },
        sectionTitle: {
            size: "text-xs",
            weight: "font-semibold",
            color: "text-gray-400",
            extras: "uppercase tracking-wider",
        },
    },

    // Body/paragraph styles
    paragraph: {
        base: {
            size: "text-base",
            weight: "font-normal",
            color: "text-gray-600",
        },
        small: {
            size: "text-sm",
            weight: "font-normal",
            color: "text-gray-500",
        },
        xs: {
            size: "text-xs",
            weight: "font-normal",
            color: "text-gray-400",
        },
    },

    // Label styles
    labels: {
        form: {
            size: "text-sm",
            weight: "font-medium",
            color: "text-gray-700",
        },
        button: {
            size: "text-sm",
            weight: "font-medium",
        },
        tag: {
            size: "text-sm",
            weight: "font-medium",
        },
    },
} as const;



export const globalColors = {
    // Primary brand colors
    primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6", // Main primary
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
    },

    gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
    },

    // Emerald (success, workspace indicators)
    emerald: {
        50: "#ecfdf5",
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#10b981",
        600: "#059669",
        700: "#047857",
    },

    // Violet (project indicators, accents)
    violet: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
    },

    // Red (errors, destructive actions)
    red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
    },

    // Indigo (accents, gradients)
    indigo: {
        50: "#eef2ff",
        100: "#e0e7ff",
        500: "#6366f1",
        600: "#4f46e5",
    },

    // Semantic colors
    semantic: {
        success: "#10b981", // emerald-500
        error: "#ef4444", // red-500
        warning: "#f59e0b", // amber-500
        info: "#3b82f6", // blue-500
    },

    // Component-specific colors
    header: {
        background: "bg-white/70",
        backdropBlur: "backdrop-blur-sm",
        borderColor: "border-gray-200",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-500",
        textMuted: "text-gray-400",
    },

    sidebar: {
        background: "bg-white/70",
        backdropBlur: "backdrop-blur-sm",
        borderColor: "border-gray-200",
        itemBackground: "bg-white",
        itemHover: "hover:bg-blue-50",
        itemBorder: "border-gray-100",
        itemBorderHover: "hover:border-blue-200",
    },

    cards: {
        background: "bg-white",
        border: "border-gray-200",
        shadow: "shadow-sm",
        hoverShadow: "hover:shadow-lg",
    },

    buttons: {
        primary: {
            background: "bg-blue-500",
            hover: "hover:bg-blue-600",
            text: "text-white",
            shadow: "shadow-lg shadow-blue-500/25",
        },
        secondary: {
            background: "bg-gray-100",
            hover: "hover:bg-gray-200",
            text: "text-gray-700",
            border: "border-gray-200",
        },
        success: {
            background: "bg-emerald-500",
            hover: "hover:bg-emerald-600",
            text: "text-white",
        },
        violet: {
            background: "bg-violet-500",
            hover: "hover:bg-violet-600",
            text: "text-white",
            shadow: "shadow-lg shadow-violet-500/25",
        },
    },

    inputs: {
        background: "bg-white",
        border: "border-gray-200",
        focusRing: "focus:ring-2 focus:ring-blue-500/30",
        placeholder: "placeholder-gray-400",
    },

    indicators: {
        active: "bg-emerald-500",
        inactive: "bg-gray-400",
        online: "bg-emerald-500",
        offline: "bg-gray-400",
    },
} as const;


export const globalSpacing = {
    // Border radius
    radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        base: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
    },

    // Common component heights
    heights: {
        button: "h-11",
        input: "h-11",
        icon: {
            sm: "w-4 h-4",
            md: "w-5 h-5",
            lg: "w-6 h-6",
            xl: "w-8 h-8",
        },
    },

    // Common padding
    padding: {
        card: "p-4 md:p-6",
        section: "p-6 md:p-8",
        button: "px-6 py-3",
        input: "px-3 py-2.5",
    },

    // Common gaps
    gap: {
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
        xl: "gap-6",
    },
} as const;


export const globalEffects = {
    shadows: {
        sm: "shadow-sm",
        base: "shadow",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
    },

    blur: {
        sm: "blur-sm",
        base: "blur",
        md: "blur-md",
        lg: "blur-lg",
        xl: "blur-xl",
        "2xl": "blur-2xl",
        "3xl": "blur-3xl",
    },

    backdrop: {
        blur: "backdrop-blur-sm",
    },

    transitions: {
        all: "transition-all",
        colors: "transition-colors",
        transform: "transition-transform",
        duration: {
            fast: "duration-150",
            normal: "duration-200",
            slow: "duration-300",
            slower: "duration-500",
        },
    },
} as const;


export const cssVariables = {
    light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0 0)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.145 0 0)",
        primary: "oklch(0.205 0 0)",
        primaryForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.97 0 0)",
        secondaryForeground: "oklch(0.205 0 0)",
        muted: "oklch(0.97 0 0)",
        mutedForeground: "oklch(0.556 0 0)",
        accent: "oklch(0.97 0 0)",
        accentForeground: "oklch(0.205 0 0)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
        radius: "0.625rem",
    },
    dark: {
        background: "oklch(0.145 0 0)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.205 0 0)",
        cardForeground: "oklch(0.985 0 0)",
        primary: "oklch(0.922 0 0)",
        primaryForeground: "oklch(0.205 0 0)",
        secondary: "oklch(0.269 0 0)",
        secondaryForeground: "oklch(0.985 0 0)",
        muted: "oklch(0.269 0 0)",
        mutedForeground: "oklch(0.708 0 0)",
        accent: "oklch(0.269 0 0)",
        accentForeground: "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0 0)",
    },
    sidebar: {
        background: "oklch(0.985 0 0)",
        foreground: "oklch(0.145 0 0)",
        primary: "oklch(0.205 0 0)",
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.97 0 0)",
        accentForeground: "oklch(0.205 0 0)",
        border: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
    },
    charts: {
        1: "oklch(0.646 0.222 41.116)",
        2: "oklch(0.6 0.118 184.704)",
        3: "oklch(0.398 0.07 227.392)",
        4: "oklch(0.828 0.189 84.429)",
        5: "oklch(0.769 0.188 70.08)",
    },
} as const;


export const scrollbarStyles = {
    width: "6px",
    track: "#f1f5f9",
    thumb: "#cbd5e1",
    thumbHover: "#94a3b8",
    borderRadius: "3px",
} as const;


export const animations = {
    shimmer: {
        name: "shimmer",
        duration: "2s infinite linear",
        keyframes: {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
        },
    },
    pulse: {
        name: "pulse",
        duration: "2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        keyframes: {
            "0%, 100%": { opacity: "1" },
            "50%": { opacity: ".5" },
        },
    },
    spin: {
        name: "spin",
        duration: "1s linear infinite",
        keyframes: {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
        },
    },
} as const;


export const gradients = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600",
    primaryHover: "hover:from-blue-600 hover:to-blue-700",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    successHover: "hover:from-emerald-600 hover:to-emerald-700",
    violet: "bg-gradient-to-br from-violet-500 to-violet-600",
    violetHover: "hover:from-violet-600 hover:to-violet-700",
    blueIndigo: "bg-gradient-to-r from-blue-50 to-indigo-50",
    text: {
        bluePrimary: "bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent",
    },
    background: {
        emeraldSubtle: "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50",
        violetSubtle: "bg-gradient-to-br from-violet-50 via-white to-violet-50/50",
        blueSubtle: "bg-gradient-to-br from-blue-50 via-white to-blue-50/50",
    },
} as const;


export const globalConfig = {
    typography: globalTypography,
    colors: globalColors,
    spacing: globalSpacing,
    effects: globalEffects,
    cssVariables,
    scrollbar: scrollbarStyles,
    animations,
    gradients,
} as const;

export default globalConfig;
