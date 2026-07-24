import styles from './PhosphorCube.module.css';

// Куб-бренд: чистый CSS 3D transform, без сторонних библиотек.
// Грани куба — чистый градиент (текст на вращающихся гранях нечитаем на маленьком размере).
// "СЕРВИС БОКС" вместо этого плавает отдельным покачивающимся слоем рядом с кубом.
export default function PhosphorCube({ size = 'sm' }) {
  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeSm;

  return (
    <div className={`${styles.scene} ${sizeClass}`} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.cube}>
        <div className={`${styles.face} ${styles.front}`} />
        <div className={`${styles.face} ${styles.back}`} />
        <div className={`${styles.face} ${styles.right}`} />
        <div className={`${styles.face} ${styles.left}`} />
        <div className={`${styles.face} ${styles.top}`} />
        <div className={`${styles.face} ${styles.bottom}`} />
      </div>
      <span className={`${styles.dangleWord} ${styles.dangleServis}`}>СЕРВИС</span>
      <span className={`${styles.dangleWord} ${styles.dangleBoks}`}>БОКС</span>
    </div>
  );
}
