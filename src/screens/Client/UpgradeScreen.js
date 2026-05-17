import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../store/SettingsContext';

const PLANS = [
    {
        key: 'free',
        icon: 'shield-outline',
        iconColor: '#2563EB',
        iconBg: '#EFF6FF',
        name: 'Miễn phí',
        desc: 'Phù hợp để bắt đầu sử dụng Bác sĩ Ảo',
        price: '0đ',
        priceSuffix: '',
        btnLabel: 'Tiếp tục dùng miễn phí',
        btnStyle: 'outline',
        recommended: false,
        features: [
            'Chat sức khỏe cơ bản',
            'Lưu lịch sử hội thoại',
            'Nhận cảnh báo y tế quan trọng',
            'Tuỳ chỉnh kích thước chữ',
            'Giới hạn sử dụng theo ngày',
        ],
        featuresHeader: 'Tính năng nổi bật:',
    },
    {
        key: 'pro',
        icon: 'sparkles',
        iconColor: '#FFFFFF',
        iconBg: '#2563EB',
        name: 'Nâng cao',
        desc: 'Dành cho người hỏi đáp sức khỏe thường xuyên',
        price: '89.000đ',
        priceSuffix: '/ tháng',
        btnLabel: 'Chọn gói Nâng cao',
        btnStyle: 'primary',
        recommended: true,
        features: [
            'Mọi tính năng của gói Miễn phí',
            'Hạn mức tin nhắn cao hơn',
            'Ưu tiên phản hồi khi hệ thống bận',
            'Tóm tắt hội thoại dài',
            'Truy cập sớm tính năng mới',
        ],
        featuresHeader: 'Bao gồm mọi thứ trong gói Miễn phí:',
    },
    {
        key: 'max',
        icon: 'trophy-outline',
        iconColor: '#2563EB',
        iconBg: '#EFF6FF',
        name: 'Tối đa',
        desc: 'Dành cho người cần hạn mức sử dụng cao nhất',
        price: '199.000đ',
        priceSuffix: '/ tháng',
        btnLabel: 'Chọn gói Tối đa',
        btnStyle: 'outline',
        recommended: false,
        features: [
            'Mọi tính năng của gói Nâng cao',
            'Hạn mức sử dụng cao nhất',
            'Ưu tiên xử lý ở giờ cao điểm',
            'Lưu trữ lịch sử lâu hơn',
            'Hỗ trợ nhiều mô hình AI hơn',
        ],
        featuresHeader: 'Tính năng nổi bật:',
    },
];

const UpgradeScreen = ({ navigation }) => {
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F0F4F8';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const cardBorder = isDarkMode ? '#334155' : '#E2E8F0';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const heroBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const heroBorder = isDarkMode ? '#334155' : '#E2E8F0';
    const noteCardBg = isDarkMode ? '#1E3A5F' : '#EFF6FF';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
                <View style={[s.heroCard, { backgroundColor: heroBg, borderColor: heroBorder }]}>
                    <View style={s.heroLeft}>
                        <View style={s.badgeRow}>
                            <Ionicons name="refresh-outline" size={13} color="#16A34A" />
                            <Text style={s.badgeText}>Gói dịch vụ Bác sĩ Ảo</Text>
                        </View>
                        <Text style={[s.heroTitle, { color: textPrimary }]}>
                            Nâng cấp trải nghiệm hỏi đáp sức khỏe khi bạn cần nhiều hơn.
                        </Text>
                        <Text style={[s.heroSubtitle, { color: textMuted }]}>
                            Chọn gói phù hợp để hạn mức cao hơn, phản hồi ổn định hơn và các tính năng AI hỗ trợ quản lý hội thoại sức khỏe tốt hơn.
                        </Text>
                    </View>
                    <View style={[s.noteCard, { backgroundColor: noteCardBg }]}>
                        <Text style={s.noteTitle}>Lưu ý y tế</Text>
                        <Text style={[s.noteText, { color: textMuted }]}>
                            Bác sĩ Ảo chỉ cung cấp thông tin tham khảo và không thay thế bác sĩ, cơ sở y tế hoặc dịch vụ cấp cứu.
                        </Text>
                    </View>
                </View>
                <View style={s.plansRow}>
                    {PLANS.map((plan) => (
                        <View
                            key={plan.key}
                            style={[
                                s.planCard,
                                { backgroundColor: cardBg, borderColor: plan.recommended ? '#2563EB' : cardBorder },
                                plan.recommended && s.planCardFeatured,
                            ]}
                        >
                            {plan.recommended && (
                                <View style={s.recommendedBadge}>
                                    <Text style={s.recommendedText}>Được đề xuất</Text>
                                </View>
                            )}
                            <View style={[s.planIconWrap, { backgroundColor: plan.iconBg }]}>
                                <Ionicons name={plan.icon} size={22} color={plan.iconColor} />
                            </View>
                            <Text style={[s.planName, { color: textPrimary }]}>{plan.name}</Text>
                            <Text style={[s.planDesc, { color: textMuted }]}>{plan.desc}</Text>
                            <View style={s.priceRow}>
                                <Text style={[s.price, { color: textPrimary }]}>{plan.price}</Text>
                                {plan.priceSuffix ? (
                                    <Text style={[s.priceSuffix, { color: textMuted }]}>{plan.priceSuffix}</Text>
                                ) : null}
                            </View>
                            <TouchableOpacity
                                style={[
                                    s.planBtn,
                                    plan.btnStyle === 'primary'
                                        ? s.planBtnPrimary
                                        : [s.planBtnOutline, { borderColor: cardBorder }],
                                ]}
                                onPress={() => {
                                    if (plan.key === 'free') return;
                                    Alert.alert('Nâng cấp gói', `Tính năng thanh toán sẽ sớm ra mắt.`);
                                }}
                            >
                                <Text
                                    style={[
                                        s.planBtnText,
                                        plan.btnStyle === 'primary' ? s.planBtnTextPrimary : { color: '#2563EB' },
                                    ]}
                                >
                                    {plan.btnLabel}
                                </Text>
                            </TouchableOpacity>
                            <Text style={[s.featuresHeader, { color: textPrimary }]}>{plan.featuresHeader}</Text>
                            {plan.features.map((f) => (
                                <View key={f} style={s.featureRow}>
                                    <Ionicons name="checkmark" size={15} color="#16A34A" style={{ marginRight: 8, marginTop: 1 }} />
                                    <Text style={[s.featureText, { color: textMuted }]}>{f}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                <Text style={[s.footer, { color: textMuted }]}>
                    Giá và hạn mức hiển thị là nội dung hiển thị mẫu. Thanh toán, hóa đơn và quản lý gói sẽ được kết nối ở bước sau.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    container: { padding: 16, paddingBottom: 32 },
    heroCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
        gap: 16,
    },
    heroLeft: { gap: 8 },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0FDF4',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },
    heroTitle: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
    heroSubtitle: { fontSize: 14, lineHeight: 20 },
    noteCard: {
        borderRadius: 12,
        padding: 14,
        gap: 4,
    },
    noteTitle: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
    noteText: { fontSize: 13, lineHeight: 18 },
    plansRow: { gap: 14 },
    planCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 0,
    },
    planCardFeatured: { borderWidth: 2 },
    recommendedBadge: {
        backgroundColor: '#2563EB',
        alignSelf: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
    },
    recommendedText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    planIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    planName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
    planDesc: { fontSize: 13, marginBottom: 16 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 16 },
    price: { fontSize: 28, fontWeight: '800' },
    priceSuffix: { fontSize: 14, marginBottom: 3 },
    planBtn: {
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginBottom: 20,
    },
    planBtnPrimary: { backgroundColor: '#2563EB' },
    planBtnOutline: { borderWidth: 1 },
    planBtnText: { fontSize: 15, fontWeight: '700' },
    planBtnTextPrimary: { color: '#FFFFFF' },
    featuresHeader: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    featureText: { fontSize: 13, flex: 1, lineHeight: 18 },
    footer: { textAlign: 'center', fontSize: 12, marginTop: 24, lineHeight: 18 },
});

export default UpgradeScreen;
