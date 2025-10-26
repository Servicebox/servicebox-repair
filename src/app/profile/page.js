// app/profile/page.js
'use client';
import { useContext } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import UserProfileWrapper from '@/components/UserProfile/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import UserOrders from '@/components/UserOrders/UserOrders';
import { ShopContext } from '@/components/ShopContext/ShopContext';
import { Suspense } from 'react';

export default function ProfilePage() {
  const { currentUser, isLoggedIn } = useAuth();
  const { userOrders } = useContext(ShopContext);

  return (
    <ProtectedRoute>
      <div className="profile-page">
        <Suspense fallback={
          <div className="loading-container">
            <div>Загрузка профиля...</div>
          </div>
        }>
          <UserProfileWrapper/>
          <UserOrders />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}