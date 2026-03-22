'use client';
import { useContext } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import UserProfileWrapper from '@/components/UserProfile/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import UserOrders from '@/components/UserOrders/UserOrders';
import UserBookings from '@/components/UserBookings/UserBookings';
import { ShopContext } from '@/components/ShopContext/ShopContext';
import { Suspense } from 'react';

export default function ProfilePage() {
  const { currentUser, isLoggedIn } = useAuth();
  const { userOrders } = useContext(ShopContext);

  return (
    <ProtectedRoute>
      <div className="profile-page container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="loading-container">
            <div>Загрузка профиля...</div>
          </div>
        }>
          <div className="grid gap-8">
            {/* Профиль пользователя */}
            <UserProfileWrapper/>
            
            {/* Мои заказы (товары) */}
            <UserOrders />
            
            {/* Мои записи на услуги */}
            <UserBookings />
          </div>
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
