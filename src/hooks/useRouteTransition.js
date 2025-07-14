'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useRouteTransition(onNavigateEnd) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);

    const navigate = (href) => {
        setLoading(true);

        startTransition(() => {
            router.push(href);
        });
    };

    return {
        navigate,
        loading,
        isPending,
        stop: () => setLoading(false) // يمكنك استدعاؤه من الخارج
    };
}
