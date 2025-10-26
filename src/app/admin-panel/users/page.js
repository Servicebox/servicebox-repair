// src/app/admin-panel/users/page.jsx

'use client';
import Layout from '../layout';
import UsersManagement from '@/components/Admin/UsersManagement/UsersManagement';

export default function UsersPage() {
  return (
    <Layout>
      <UsersManagement />
    </Layout>
  );
}