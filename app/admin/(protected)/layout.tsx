"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  MessageSquare,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminToken } from "@/app/admin/_lib/admin-api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/orders" },
  { icon: Users, label: "Usuários", href: "/admin/users" },
  { icon: Package, label: "Serviços", href: "/admin/services" },
  { icon: MessageSquare, label: "Suporte", href: "/admin/support" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token && !pathname.endsWith("/login")) {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized && !pathname.endsWith("/login")) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-on-surface flex p-6 gap-6">
      {/* Floating Sidebar */}
      <aside className="w-20 md:w-64 flex flex-col liquid-glass rounded-3xl border border-white/5 py-8 transition-all">
        <div className="px-6 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-headline font-bold text-on-primary">
            E
          </div>
          <span className="hidden md:block mt-4 font-headline text-lg font-bold tracking-tighter">
            Command Center
          </span>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "drop-shadow-[0_0_8px_rgba(81,243,227,0.8)]" : "group-hover:scale-110"
                )} />
                <span className="hidden md:block font-headline text-sm font-bold tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-error/70 hover:text-error hover:bg-error/5 transition-all group">
            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="hidden md:block font-headline text-sm font-bold tracking-wide">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
