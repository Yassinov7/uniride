'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SidebarLink({ href, icon, label, closeDrawer }) {
    const router = useRouter();
    const pathname = usePathname();
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        if (closeDrawer) closeDrawer();
        setClicked(true);
        router.push(href);
    };

    // ✨ عند تغيّر المسار، أوقف اللودر
    useEffect(() => {
        setClicked(false);
    }, [pathname]);

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-orange-500 transition-all text-sm font-medium w-full text-right"
        >
            {icon}
            <span className="flex items-center gap-2">
                {label}
                {clicked && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            </span>
        </button>
    );
}
