import mongoose from 'mongoose';

const CalculatorConfigSchema = new mongoose.Schema({
    // Храним весь объект цен. Mixed позволяет сохранять любую структуру JSON
    pricingData: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

// ✅ Исправлено имя модели (латиница, PascalCase)
export default mongoose.models.CalculatorConfig || mongoose.model('CalculatorConfig', CalculatorConfigSchema);