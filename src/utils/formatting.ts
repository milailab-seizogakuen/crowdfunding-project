/**
 * 数値を日本円形式（カンマ区切り、¥記号付き）にフォーマットします
 * @param amount 金額（数値）
 * @returns フォーマットされた金額文字列（例: ¥100,000）
 */
export const formatCurrency = (amount: number): string => {
    return `¥${amount.toLocaleString('ja-JP')}`;
};
