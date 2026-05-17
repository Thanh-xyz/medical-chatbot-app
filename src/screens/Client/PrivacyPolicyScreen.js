import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../store/SettingsContext';

const INFO_CARDS = [
    {
        icon: 'server-outline',
        title: 'Dữ liệu được lưu',
        desc: 'Hệ thống có thể lưu thông tin tài khoản, hồ sơ cơ bản, lịch sử hội thoại và thiết lập hiện thị để duy trì trải nghiệm liên tục.',
    },
    {
        icon: 'people-outline',
        title: 'Cách dữ liệu được sử dụng',
        desc: 'Dữ liệu được dùng để hiển thị lại lịch sử khám, cá nhân hóa giao diện và vận hành các tính năng hỏi đáp sức khỏe.',
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Quyền kiểm soát của bạn',
        desc: 'Bạn có thể xóa từng đoạn hội thoại hoặc xóa toàn bộ lịch sử chat trong phần cài đặt tài khoản.',
    },
    {
        icon: 'lock-closed-outline',
        title: 'Lưu ý bảo mật',
        desc: 'Không nên nhập giấy tờ tùy thân, mật khẩu, thông tin tài chính hoặc dữ liệu nhạy cảm không cần thiết vào cuộc trò chuyện.',
    },
];

const PrivacyPolicyScreen = ({ navigation }) => {
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F0F4F8';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const cardBorder = isDarkMode ? '#334155' : '#E2E8F0';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const iconBg = isDarkMode ? '#1E3A5F' : '#EFF6FF';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('ClientSettings')}>
                    <Ionicons name="arrow-back-outline" size={16} color={textPrimary} />
                    <Text style={[s.backText, { color: textPrimary }]}>Quay lại</Text>
                </TouchableOpacity>
                <View style={[s.headerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={[s.headerIconWrap, { backgroundColor: iconBg }]}>
                        <Ionicons name="shield-outline" size={24} color="#2563EB" />
                    </View>
                    <Text style={s.headerBadge}>Quyền riêng tư</Text>
                    <Text style={[s.headerTitle, { color: textPrimary }]}>Chính sách quyền riêng tư</Text>
                    <Text style={[s.headerDesc, { color: textMuted }]}>
                        Trang này mô tả ngắn gọn cách Bác sĩ Ảo xử lý dữ liệu trong phiên bản hiện tại.
                    </Text>
                </View>
                <View style={s.grid}>
                    {INFO_CARDS.map((card) => (
                        <View key={card.title} style={[s.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                            <View style={s.infoCardHeader}>
                                <Ionicons name={card.icon} size={20} color="#2563EB" />
                                <Text style={[s.infoCardTitle, { color: textPrimary }]}>{card.title}</Text>
                            </View>
                            <Text style={[s.infoCardDesc, { color: textMuted }]}>{card.desc}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    container: { padding: 16, paddingBottom: 32 },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.06)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    backText: { fontSize: 14, fontWeight: '500' },
    headerCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        marginBottom: 16,
        gap: 6,
    },
    headerIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    headerBadge: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
    headerTitle: { fontSize: 24, fontWeight: '800' },
    headerDesc: { fontSize: 14, lineHeight: 20, marginTop: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        width: '47%',
        flexGrow: 1,
        gap: 8,
    },
    infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoCardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
    infoCardDesc: { fontSize: 13, lineHeight: 18 },
});

export default PrivacyPolicyScreen;
