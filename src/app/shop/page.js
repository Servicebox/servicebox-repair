'use client';
import styles from './Shop.module.css'; // Импортируем свои стили
import { useRouter } from 'next/navigation';

const Shop = () => {
  const router = useRouter();
  
  return (
    <div className={styles.shop}>
      <a href="http://localhost:3000parts" className={styles.link} />
    </div>
  );
}

export default Shop;