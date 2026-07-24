import styles from './PhosphorCube.module.css';

// Куб-бренд: чистый CSS 3D transform, без сторонних библиотек.
export default function PhosphorCube({ size = 'sm' }) {
  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeSm;

  const showSideText = size !== 'sm';

  return (
    <div className={`${styles.scene} ${sizeClass}`} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.cube}>
        <div className={`${styles.face} ${styles.front}`}>SB</div>
        <div className={`${styles.face} ${styles.back}`}>SB</div>
        <div className={`${styles.face} ${styles.right}`}>{showSideText ? 'СЕРВИС' : ''}</div>
        <div className={`${styles.face} ${styles.left}`}>{showSideText ? 'БОКС' : ''}</div>
        <div className={`${styles.face} ${styles.top}`} />
        <div className={`${styles.face} ${styles.bottom}`} />
      </div>
    </div>
  );
}
