// models/OptfmSyncState.js
import mongoose from 'mongoose';

const OptfmSyncStateSchema = new mongoose.Schema({
  markupPercent: {
    type: Number,
    required: true,
    min: [0, 'Наценка не может быть отрицательной'],
    default: 30,
  },
  syncInProgress: {
    type: Boolean,
    default: false,
  },
  lastSyncStartedAt: Date,
  lastSyncFinishedAt: Date,
  lastSyncError: String,
  lastSyncStats: {
    categoriesUpserted: Number,
    productsUpserted: Number,
    productsDeactivated: Number,
    imagesDownloaded: Number,
    // true, если прогон прервался раньше последней страницы каталога
    // (обычно из-за WAF поставщика) — деактивация в этом случае
    // пропускается, см. syncProducts.js
    incomplete: Boolean,
  },
}, {
  timestamps: { createdAt: false, updatedAt: true },
});

export default mongoose.models.OptfmSyncState || mongoose.model('OptfmSyncState', OptfmSyncStateSchema);
