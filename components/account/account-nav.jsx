"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Star, User, LogOut, BookUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: '/account', label: 'Dashboard', icon: Home, exact: true },
    { href: '/account/orders', label: 'Orders', icon: Package, exact: false },
    { href: '/account/reviews', label: 'Pending Reviews', icon: Star, exact: false },
    { href: '/account/addresses', label: 'Address Book', icon: BookUser, exact: false },
    { href: '/account/settings', label: 'Account Settings', icon: User, exact: false },
];

export function AccountNav() {
    const pathname = usePathname();

    const isActive = (href, exact) => {
        if (exact) return pathname === href;
        // make sure /account/orders/* is active when on /account/orders
        return pathname.startsWith(href) && (pathname === href || pathname.startsWith(`${href}/`));
    };

    return (
        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        isActive(item.href, item.exact) ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
             <Button variant="ghost" className="mt-4 justify-start text-muted-foreground hover:text-primary">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
            </Button>
        </nav>
    );
}
