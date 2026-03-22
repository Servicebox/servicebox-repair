// components/withAuth/withAuth.js
'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push('/login');
      }
    }, [isLoggedIn, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
      return null;
    }

    return <Component {...props} />;
  };
}