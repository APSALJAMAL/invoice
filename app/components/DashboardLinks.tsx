'use client';

import { cn } from '@/lib/utils';
import { CreditCard, HomeIcon, Shield, Users2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const dashboardLinks = [
  {
    id: 0,
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['ADMIN', 'OWNER'], // visible to all
  },
  {
    id: 1,
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: Users2,
    roles: ['ADMIN', 'OWNER'],
  },
  {
    id: 2,
    name: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    roles: ['USER','ADMIN', 'OWNER'],
  },
  {
    id: 3,
    name: 'Owner Panel',
    href: '/dashboard/owner',
    icon: Shield,
    roles: ['OWNER'],
  },
];

interface DashboardLinksProps {
  role: 'USER' | 'ADMIN' | 'OWNER' | string;
}

export function DashboardLinks({ role }: DashboardLinksProps) {
  const pathname = usePathname();

  const visibleLinks = dashboardLinks.filter((link) =>
    link.roles.includes(role)
  );

  return (
    <>
      {visibleLinks.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className={cn(
            pathname === link.href
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground',
            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary'
          )}
        >
          <link.icon className="size-4" />
          {link.name}
        </Link>
      ))}
    </>
  );
}
