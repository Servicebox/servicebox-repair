// models/PriceItem.js
// Позиция прайс-листа запчастей (страница /price + раздел /admin-panel/price).
import mongoose from 'mongoose';

const PriceItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 300 },
    model: { type: String, trim: true, maxlength: 200, default: '' },
    revision: { type: String, trim: true, maxlength: 100, default: '' },
    // Свободная строка группы техники (Телефоны/Ноутбуки/...) — не жёсткий
    // enum, чтобы не блокировать ввод, пока категорий немного.
    category: { type: String, trim: true, maxlength: 100, default: '' },
    // Не required: реальный исходный прайс — это справочник запчастей без
    // цен (только наименование/модель/ревизия), цены дозаполняются через
    // админку постепенно. 0 = "цена ещё не проставлена".
    retailPrice: { type: Number, min: 0, default: 0 },
    // Цена закупки — НИКОГДА не отдаётся в публичные /api/price/data и
    // /api/price/current, только в админских /api/admin/price-items*.
    purchasePrice: { type: Number, min: 0, default: null },
    quantity: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true, versionKey: false }
);

// Текстовый поиск в админке (наименование/модель/описание) + фильтр по категории.
PriceItemSchema.index({ name: 'text', model: 'text', description: 'text' });
PriceItemSchema.index({ category: 1 });

export default mongoose.models.PriceItem || mongoose.model('PriceItem', PriceItemSchema);
