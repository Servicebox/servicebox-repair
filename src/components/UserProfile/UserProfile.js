// components/UserProfile/UserProfile.jsx
'use client';
import React from 'react';
import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from '../contexts/AuthContext';
import styles from "./UserProfile.module.css";

const UserOrderList = React.forwardRef(({ orders }, ref) => (
  <div className={styles.userOrdersSection} id="orders" ref={ref}>
    <h3>Ваши заказы</h3>
    {(!orders || orders.length === 0) && (
      <div className={styles.userNoorders}>Заказы отсутствуют.</div>
    )}
    {orders && orders.length > 0 && (
      <ul className={styles.userOrdersList}>
        {orders.map((order, idx) => (
          <li key={order._id ?? idx} className={styles.userOrder}>
            <div>
              <b>Заказ #:</b> {order._id} <br />
              <b>Дата:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString('ru') : '-'} <br />
              <b>Статус:</b> {order.status} <br />
              <b>Состав заказа:</b>
              <ul>
                {order.products.map((p, i) => (
                  <li key={i}>
                    {p.name} × {p.count} (₽{p.price})
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
));

UserOrderList.displayName = 'UserOrderList';

const UserProfileContent = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();
    const ordersRef = useRef(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders', {
                credentials: 'include'
            });
            
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || data || []);
            } else {
                console.warn('Не удалось загрузить заказы');
                setOrders([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            setOrders([]);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#orders" && ordersRef.current) {
            setTimeout(() => {
                ordersRef.current.scrollIntoView({ behavior: "smooth" });
            }, 150);
        }
    }, [orders]);

    if (!user) {
        return <div className={styles.userprofNtfound}>Профиль не найден.</div>;
    }

    return (
        <div className={styles.userprofContainer}>
            <h2>Личный кабинет</h2>
            <div className={styles.userprofDetails}>
                <p><b>Имя:</b> {user.username || 'Не указано'}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Телефон:</b> {user.phone || 'Не указан'}</p>
                <p><b>Роль:</b> {user.role === "admin" ? "Администратор" : "Пользователь"}</p>
                {user.emailVerified && <span className={styles.userprofVerified}>✔ Email подтвержден</span>}
                {!user.emailVerified && <span className={styles.userprofNotverif}>Email не подтвержден</span>}
            </div>
            <UserOrderList orders={orders} ref={ordersRef} />
        </div>
    );
};

const UserProfile = () => {
    return (
        <Suspense fallback={<div className="loading">Загрузка профиля...</div>}>
            <UserProfileContent />
        </Suspense>
    );
};

export default UserProfile;