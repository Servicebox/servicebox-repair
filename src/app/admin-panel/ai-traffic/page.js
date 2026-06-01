// app/admin-panel/ai-traffic/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/AuthContext';
import AiTrafficDashboard from '@/components/Admin/AiTrafficDashboard/AiTrafficDashboard';

import styles from '../AdminPanel.module.css';

export default function AiTrafficPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return <AiTrafficDashboard />;
}