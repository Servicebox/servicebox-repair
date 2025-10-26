// src/app/admin-panel/orders/page.jsx
'use client';
import Layout from '../layout';
import OrdersManagement from '@/components/Admin/OrdersManagement/OrdersManagement';

export default function OrdersPage() {
  return (
    <Layout>
      <OrdersManagement />
    </Layout>
  );
}