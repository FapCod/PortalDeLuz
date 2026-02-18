"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Zap,
    Calendar,
    CreditCard,
    LogOut,
    Menu,
    X,
    Users,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/periodos", label: "Períodos", icon: Calendar },
    { href: "/admin/lotes", label: "Lotes / Vecinos", icon: Users },
    { href: "/admin/lecturas", label: "Lecturas", icon: Zap },
    { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileOpen, setMobileOpen] = useState(false)

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const NavLinks = () => (
        <>
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                    </Link>
                )
            })}
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 p-4">
                {/* Logo */}
                <div className="flex items-center gap-3 px-3 py-4 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">Portal de Luz</p>
                        <p className="text-xs text-gray-400 leading-tight">Las Palmeras del Sol</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    <NavLinks />
                </nav>

                {/* Footer */}
                <div className="border-t pt-4 space-y-2">
                    <Link
                        href="/consulta"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Vista pública
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-gray-900">Portal de Luz</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 pt-16" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-1">
                            <NavLinks />
                        </nav>
                        <div className="border-t mt-4 pt-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
