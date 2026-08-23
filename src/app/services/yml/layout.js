// Служебная страница проверки YML-фида услуг — не для поисковой индексации.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function ServicesYmlLayout({ children }) {
  return children;
}
