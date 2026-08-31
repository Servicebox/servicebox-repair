import DepositoryPublic from '@/components/DepositoryPublic/DepositoryPublic';
import { BASE_URL } from '@/lib/constants';

export const metadata = {
  title: 'Депозитарий файлов — СЕРВИС БОКС Вологда',
  description: 'Прошивки, дашборды и документация сервисного центра СЕРВИС БОКС в Вологде.',
  alternates: {
    canonical: `${BASE_URL}/depository-public`,
  },
};

export default function DepositoryPublicPage() {
  return <DepositoryPublic />;
}
