'use client';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import UserOrders from '@/components/UserOrders/UserOrders';
import UserBookings from '@/components/UserBookings/UserBookings';
import ProfileSettings from '@/components/ProfileSettings/ProfileSettings';
import { Bookmark, ShoppingBag, Settings, User, Trash2, Package, Newspaper, Image as ImageIcon, Tag, Gift } from 'lucide-react';
import GoogleWalletButton from '@/components/GoogleWalletButton/GoogleWalletButton';
import styles from './profile.module.css';

function SafeAvatar({ src, fallback, className, letterClass, size = 80 }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className={letterClass}>{fallback}</span>;
  return (
    <img
      src={src}
      alt="Аватар"
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
    />
  );
}

// ─── Вкладки ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile',   label: 'Профиль',    Icon: User },
  { key: 'favorites', label: 'Избранное',  Icon: Bookmark },
  { key: 'bonuses',   label: 'Бонусы',     Icon: Gift },
  { key: 'orders',    label: 'Мои заказы', Icon: ShoppingBag },
  { key: 'settings',  label: 'Настройки',  Icon: Settings },
];

const FAV_TABS = [
  { key: 'product',   label: 'Товары',  Icon: Package },
  { key: 'news',      label: 'Новости', Icon: Newspaper },
  { key: 'photo',     label: 'Фото',    Icon: ImageIcon },
  { key: 'promotion', label: 'Акции',   Icon: Tag },
];

// ─── Избранное (inline) ───────────────────────────────────────────────────────
function FavoritesTab() {
  const [activeType, setActiveType] = useState('product');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async (type, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/favorites?itemType=${type}&page=${page}&limit=12`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(activeType, 1); }, [activeType, fetchFavorites]);

  const handleRemove = async (item) => {
    setItems(prev => prev.filter(i => i._id !== item._id));
    const res = await fetch('/api/favorites', {
      method: 'POST', // toggle
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemId: item._id, itemType: activeType }),
    });
    if (!res.ok) fetchFavorites(activeType, pagination.page);
  };

  return (
    <div>
      {/* Тип избранного */}
      <nav className={styles.favTabs} aria-label="Тип избранного">
        {FAV_TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`${styles.favTab} ${activeType === key ? styles.favTabActive : ''}`}
            onClick={() => setActiveType(key)}
            aria-selected={activeType === key}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className={styles.skeleton}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <Bookmark size={40} className={styles.emptyIcon} />
          <p>В этой категории пока ничего нет</p>
          <Link href="/" className={styles.browseLink}>Перейти на главную</Link>
        </div>
      ) : (
        <div className={styles.favGrid}>
          {items.map(item => (
            <FavCard key={item._id} item={item} type={activeType} onRemove={handleRemove} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pagination.page === 1}
            onClick={() => fetchFavorites(activeType, pagination.page - 1)}
          >← Назад</button>
          <span className={styles.pageInfo}>{pagination.page} / {pagination.pages}</span>
          <button
            className={styles.pageBtn}
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchFavorites(activeType, pagination.page + 1)}
          >Далее →</button>
        </div>
      )}
    </div>
  );
}

function FavCard({ item, type, onRemove }) {
  const href = {
    product:   `/product/${item.slug}`,
    news:      `/news/${item.slug}`,
    photo:     `/gallery`,
    promotion: `/promotions-page`,
  }[type] ?? '/';

  const thumb = item.images?.[0] || item.featuredImage || item.filePath || item.image || null;

  return (
    <article className={styles.favCard}>
      {thumb && (
        <Link href={href} className={styles.favThumb}>
          <Image src={thumb} alt={item.name || item.title || ''} fill sizes="200px" className={styles.favImg} />
        </Link>
      )}
      <div className={styles.favBody}>
        <Link href={href} className={styles.favTitle}>
          {item.name || item.title || 'Без названия'}
        </Link>
        {item.new_price != null && (
          <p className={styles.favPrice}>{item.new_price.toLocaleString('ru-RU')} ₽</p>
        )}
        <button className={styles.removeBtn} onClick={() => onRemove(item)} aria-label="Удалить">
          <Trash2 size={14} /> Удалить
        </button>
      </div>
    </article>
  );
}

// ─── Вкладка бонусов ─────────────────────────────────────────────────────────
function BonusesTab() {
  const [data, setData]         = useState({ balance: 0, transactions: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading]   = useState(true);

  const fetchBonuses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bonuses?page=${page}&limit=20`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      // тихая ошибка
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBonuses(1); }, [fetchBonuses]);

  const formatDate = iso => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={styles.section}>
      {/* Баланс */}
      <div className={styles.bonusBalance}>
        <span className={styles.bonusBalanceLabel}>Ваш бонусный баланс</span>
        <span className={styles.bonusBalanceValue}>{loading ? '…' : data.balance} баллов</span>
        <p className={styles.bonusInfo}>1 балл = 1 рубль скидки. Баллы можно потратить при следующем заказе.</p>
      </div>

      <h3 className={styles.sectionSubtitle}>История начислений</h3>

      {loading ? (
        <div className={styles.skeleton} style={{ height: 200 }} />
      ) : data.transactions.length === 0 ? (
        <p className={styles.empty}>Операций пока нет</p>
      ) : (
        <ul className={styles.txList}>
          {data.transactions.map(tx => (
            <li key={tx._id} className={`${styles.txItem} ${tx.points > 0 ? styles.txEarn : styles.txSpend}`}>
              <div className={styles.txIcon}>{tx.points > 0 ? '+' : '−'}</div>
              <div className={styles.txDetails}>
                <span className={styles.txDesc}>{tx.description}</span>
                <time className={styles.txDate}>{formatDate(tx.createdAt)}</time>
              </div>
              <span className={styles.txPoints}>
                {tx.points > 0 ? `+${tx.points}` : tx.points} б.
              </span>
            </li>
          ))}
        </ul>
      )}

      {data.pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={data.pagination.page === 1} onClick={() => fetchBonuses(data.pagination.page - 1)}>← Назад</button>
          <span className={styles.pageInfo}>{data.pagination.page} / {data.pagination.pages}</span>
          <button className={styles.pageBtn} disabled={data.pagination.page === data.pagination.pages} onClick={() => fetchBonuses(data.pagination.page + 1)}>Далее →</button>
        </div>
      )}
    </div>
  );
}

// ─── Главная страница профиля ─────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        {/* Шапка профиля */}
        <header className={styles.hero}>
          <div className={styles.avatarWrap}>
            <SafeAvatar
              src={user?.avatarUrl || user?.avatar || null}
              fallback={user?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              className={styles.avatarImg}
              letterClass={styles.avatarLetter}
            />
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{user?.username || user?.email || 'Пользователь'}</h1>
            {user?.email && <p className={styles.heroEmail}>{user.email}</p>}
          </div>
        </header>

        {/* Навигация по вкладкам */}
        <nav className={styles.tabs} role="tablist" aria-label="Разделы профиля">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Контент вкладок */}
        <div className={styles.content} role="tabpanel">

          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Информация о профиле</h2>
              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>Имя пользователя</dt>
                  <dd>{user?.username || '—'}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Email</dt>
                  <dd>{user?.email || '—'}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Роль</dt>
                  <dd>{user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</dd>
                </div>
              </dl>

              {/* Google Wallet */}
              <div className={styles.walletBlock}>
                <h3 className={styles.walletTitle}>Карта лояльности</h3>
                <p className={styles.walletDesc}>
                  Добавьте цифровую карту лояльности ServiceBox в Google Wallet.
                </p>
                <GoogleWalletButton className={styles.walletBtnWrap} />
              </div>
            </div>
          )}

          {activeTab === 'favorites' && <FavoritesTab />}

          {activeTab === 'bonuses' && <BonusesTab />}

          {activeTab === 'orders' && (
            <div className={styles.section}>
              <UserOrders />
              <UserBookings />
            </div>
          )}

          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </div>
    </ProtectedRoute>
  );
}
