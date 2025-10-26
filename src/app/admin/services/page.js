// src/app/admin/services/page.js
import ListService from '@/components/admin/ListService';

// Эта страница может быть серверным компонентом
export default function AdminServicesPage() {
  return (
    <div>
      <h1>Управление услугами</h1>
      <ListService />
    </div>
  );
}