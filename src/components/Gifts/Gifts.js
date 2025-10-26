// components/Gifts/Gifts.js
'use client';

import FormWithoutOverlay from "../FormWithoutOverlay/FormWithoutOverlay";
import styles from "./Gifts.module.css";

function Gifts() {
    return (
        <section className={styles.gifts}>
            <h2 className={styles.animatedTitle}>Задай вопрос сейчас и получи скидку на ремонт 20%</h2>
            <FormWithoutOverlay />
        </section>
    );
}

export default Gifts;