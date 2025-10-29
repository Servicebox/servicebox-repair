'use client';
import styles from './Shop.module.css'; // Импортируем свои стили
import { useRouter } from 'next/navigation';

const Shop = () => {
  const router = useRouter();
  
  return (
    <div className={styles.shop}>
      <a href="https://service-box-35.ruparts" className={styles.link} />
    </div>
  );
}

export default Shop;