const { create, getAll, getById, update, deletePromotion, getActivePromotions } = require('../access/promotionAccess');

class PromotionService {
    async createPromotion(data) {
        return await create(data);
    }

    async getAllPromotions() {
        return await getAll();
    }

    async getPromotionById(id) {
        return await getById(id);
    }

    async updatePromotion(id, data) {
        await update(id, data);
        return await getById(id);
    }

    async deletePromotion(id) {
        await deletePromotion(id);
    }

    async getActivePromotions() {
        return await getActivePromotions();
    }

    // Logic áp dụng promotion cho invoice
    async applyPromotion(invoiceTotal, promotionCode) {
        const promotions = await getActivePromotions();
        const promotion = promotions.find(p => p.code === promotionCode);
        if (!promotion) {
            throw new Error('Promotion not found or inactive');
        }

        let discount = 0;
        if (promotion.discountType === 'percent') {
            discount = (invoiceTotal * promotion.discountValue) / 100;
        } else if (promotion.discountType === 'amount') {
            discount = promotion.discountValue;
        }

        return {
            originalTotal: invoiceTotal,
            discount,
            finalTotal: invoiceTotal - discount,
            promotion
        };
    }
}

module.exports = new PromotionService();