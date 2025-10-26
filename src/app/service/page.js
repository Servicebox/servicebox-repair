// src/app/service/page.js
import { Suspense } from 'react';
import Service from '../../components/Service/Service';

export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Загрузка услуг...</div>}>
      <Service />
    </Suspense>
  );
}