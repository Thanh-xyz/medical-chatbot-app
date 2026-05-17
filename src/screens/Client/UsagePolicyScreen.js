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

const POLICIES = [
    {
        icon: 'checkmark-circle',
        color: '#16A34A',
        text: 'Bác sĩ Ảo chỉ cung cấp thông tin sức khỏe tham khảo, không thay thế bác sĩ hoặc cơ sở y tế.',
        type: 'ok',
    },
    {
        icon: 'checkmark-circle',
        color: '#16A34A',
        text: 'Không sử dụng hệ thống để tự chẩn đoán, tự kê đơn, thay đổi liều thuốc hoặc trì hoãn việc đi khám.',
        type: 'ok',
    },
    {
        icon: 'warning',
        color: '#F59E0B',
        text: 'Với triệu chứng nguy hiểm như đau ngực, khó thở, ngất, co giật, chảy máu nhiều hoặc ý định tự làm hại bản thân, hãy gọi cấp cứu hoặc đến cơ sở y tế gần nhất.',
        type: 'warn',
    },
    {
        icon: 'checkmark-circle',
        color: '#16A34A',
        text: 'Không nhập thông tin cá nhân nhạy cảm của người khác nếu bạn không có quyền chia sẻ.',
        type: 'ok',
    },
    {
        icon: 'checkmark-circle',
        color: '#16A34A',
        text: 'Không dùng hệ thống để tạo nội dung gây hại, sai lệch y tế, lừa đảo hoặc vi phạm pháp luật.',
        type: 'ok',
    },
];

const UsagePolicyScreen = ({ navigation }) => {
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
                        <Ionicons name="medical-outline" size={24} color="#2563EB" />
                    </View>
                    <Text style={s.headerBadge}>An toàn y tế</Text>
                    <Text style={[s.headerTitle, { color: textPrimary }]}>Chính sách sử dụng</Text>
                    <Text style={[s.headerDesc, { color: textMuted }]}>
                        Những nguyên tắc dưới đây giúp Bác sĩ Ảo được dùng đúng mục đích và an toàn trong các tình huống liên quan đến sức khỏe.
                    </Text>
                </View>
                <View style={[s.policyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    {POLICIES.map((item, idx) => (
                        <View
                            key={idx}
                            style={[
                                s.policyRow,
                                idx < POLICIES.length - 1 && [s.policyRowBorder, { borderBottomColor: cardBorder }],
                            ]}
                        >
                            <Ionicons name={item.icon} size={20} color={item.color} style={s.policyIcon} />
                            <Text style={[s.policyText, { color: textPrimary }]}>{item.text}</Text>
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
    policyCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    policyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 18,
        gap: 12,
    },
    policyRowBorder: { borderBottomWidth: 1 },
    policyIcon: { marginTop: 1, flexShrink: 0 },
    policyText: { flex: 1, fontSize: 14, lineHeight: 20 },
});

export default UsagePolicyScreen;
