// Служебная страница проверки YML-фида — не для поисковой индексации.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function YmlCheckLayout({ children }) {
  return children;
}
