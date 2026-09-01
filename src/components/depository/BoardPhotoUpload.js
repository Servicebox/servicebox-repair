// src/components/depository/BoardPhotoUpload.js
'use client';
import { useRef, useState } from 'react';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoUpload.module.css';

export default function BoardPhotoUpload({ onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [deviceType, setDeviceType] = useState('videocard');
  const [chip, setChip] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { setMsg({ type: 'err', text: 'Файл больше 15 МБ' }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setMsg({ type: 'err', text: 'Выберите фото' }); return; }
    if (title.trim().length < 3) { setMsg({ type: 'err', text: 'Название — минимум 3 символа' }); return; }
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title.trim());
      fd.append('deviceType', deviceType);
      fd.append('chip', chip.trim());
      fd.append('description', description.trim());
      const res = await fetch('/api/admin/board-photos', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      setMsg({ type: 'ok', text: 'Загружено: ' + data.boardPhoto.slug });
      setFile(null); setPreview(''); setTitle(''); setChip(''); setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded?.();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label}>Фото платы (JPEG/PNG/WebP, до 15 МБ)</label>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className={styles.file} />
      {preview && <img src={preview} alt="Предпросмотр" className={styles.preview} />}

      <label className={styles.label}>Название платы *</label>
      <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Palit GTX 1060 6ГБ, чип GP106-401-A1" />

      <label className={styles.label}>Тип устройства</label>
      <select className={styles.input} value={deviceType} onChange={e => setDeviceType(e.target.value)}>
        {DEVICE_TYPES.map(t => <option key={t} value={t}>{deviceTypeLabel(t)}</option>)}
      </select>

      <label className={styles.label}>Чип (опц.)</label>
      <input className={styles.input} value={chip} onChange={e => setChip(e.target.value)} placeholder="GP106-401-A1" />

      <label className={styles.label}>Описание (опц.)</label>
      <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} rows={3} />

      <button className={styles.submit} disabled={busy}>{busy ? 'Загрузка…' : 'Загрузить'}</button>
      {msg && <p className={msg.type === 'ok' ? styles.ok : styles.err}>{msg.text}</p>}
    </form>
  );
}
