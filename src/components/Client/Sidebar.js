import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../../hooks/useAuth';
import { useSettings } from '../../store/SettingsContext';
const groupByDate = (convs) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart - 86400000);

    const groups = { today: [], yesterday: [], older: [] };
    for (const c of convs) {
        const d = new Date(c.updatedAt || c.createdAt || 0);
        if (d >= todayStart) groups.today.push(c);
        else if (d >= yesterdayStart) groups.yesterday.push(c);
        else groups.older.push(c);
    }
    const result = [];
    if (groups.today.length) result.push({ label: 'Hôm nay', items: groups.today });
    if (groups.yesterday.length) result.push({ label: 'Hôm qua', items: groups.yesterday });
    if (groups.older.length) result.push({ label: 'Trước đó', items: groups.older });
    return result;
};

const ClientSidebar = ({ conversations, activeId, loading, error, onSelect, onNew, onDelete, onRename, onSettings }) => {
    const [search, setSearch] = useState('');
    const [renameTarget, setRenameTarget] = useState(null); // { _id, title }
    const [renameText, setRenameText] = useState('');
    const { user } = useAuth();
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#111827' : '#FFFFFF';
    const borderColor = isDarkMode ? '#1F2937' : '#E2E8F0';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#1E293B';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const searchBg = isDarkMode ? '#1F2937' : '#F8FAFC';
    const searchBorder = isDarkMode ? '#374151' : '#E2E8F0';
    const itemActiveBg = isDarkMode ? '#1E3A5F' : '#EFF6FF';
    const footerBg = isDarkMode ? '#111827' : undefined;
    const modalBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const modalBorder = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const filtered = conversations.filter((c) =>
        (c.title || '').toLowerCase().includes(search.toLowerCase())
    );
    const groups = groupByDate(filtered);

    const initials = user?.displayName?.charAt(0)?.toUpperCase()
        ?? user?.fullName?.charAt(0)?.toUpperCase()
        ?? 'U';

    const openContextMenu = (conv) => {
        Alert.alert(
            conv.title || 'Cuộc khám',
            null,
            [
                {
                    text: 'Đổi tên',
                    onPress: () => {
                        setRenameTarget(conv);
                        setRenameText(conv.title || '');
                    },
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Xóa cuộc khám?',
                            'Hành động này không thể hoàn tác.',
                            [
                                { text: 'Huỷ', style: 'cancel' },
                                { text: 'Xóa', style: 'destructive', onPress: () => onDelete(conv._id) },
                            ]
                        );
                    },
                },
                { text: 'Huỷ', style: 'cancel' },
            ]
        );
    };

    const submitRename = () => {
        if (renameTarget && renameText.trim()) {
            onRename?.(renameTarget._id, renameText.trim());
        }
        setRenameTarget(null);
        setRenameText('');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg, borderRightColor: borderColor }]} edges={['top', 'bottom']}>
            <View style={[styles.brandRow, { borderBottomColor: borderColor }]}>
                <View style={styles.brandIcon}>
                    <Text style={styles.brandIconText}>AI</Text>
                </View>
                <Text style={[styles.brandName, { color: textPrimary }]}>Bác sĩ Ảo</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.collapseBtn}>
                    <Ionicons name="reorder-three-outline" size={20} color={textMuted} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.newBtn} onPress={onNew}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.newBtnText}>Bắt đầu khám mới</Text>
            </TouchableOpacity>
            <View style={[styles.searchWrapper, { backgroundColor: searchBg, borderColor: searchBorder }]}>
                <Ionicons name="search-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: textPrimary }]}
                    placeholder="Tìm lịch sử khám..."
                    placeholderTextColor={textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <Text style={[styles.empty, { color: textMuted }]}>Đang tải lịch sử khám...</Text>
                ) : error ? (
                    <Text style={[styles.empty, styles.errorText]}>{error}</Text>
                ) : groups.length === 0 ? (
                    <Text style={[styles.empty, { color: textMuted }]}>Chưa có lịch sử khám</Text>
                ) : (
                    groups.map((group) => (
                        <View key={group.label}>
                            <Text style={[styles.groupLabel, { color: textMuted }]}>{group.label}</Text>
                            {group.items.map((conv) => (
                                <TouchableOpacity
                                    key={conv._id}
                                    style={[styles.item, activeId === conv._id && [styles.itemActive, { backgroundColor: itemActiveBg }]]}
                                    onPress={() => onSelect(conv)}
                                >
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={15}
                                        color={activeId === conv._id ? '#2563EB' : textMuted}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={[styles.itemText, { color: textMuted }, activeId === conv._id && styles.itemTextActive]}
                                        numberOfLines={1}
                                    >
                                        {conv.title || 'Cuộc khám mới'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openContextMenu(conv)}
                                        style={styles.moreBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="ellipsis-vertical" size={14} color={textMuted} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
            <View style={[styles.footer, { backgroundColor: footerBg, borderTopColor: borderColor }]}>
                <View style={[styles.footerAvatar, { overflow: 'hidden' }]}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.footerAvatarImage} />
                    ) : (
                        <Text style={styles.footerAvatarText}>{initials}</Text>
                    )}
                </View>
                <View style={styles.footerInfo}>
                    <Text style={[styles.footerName, { color: textPrimary }]} numberOfLines={1}>
                        {user?.displayName ?? user?.fullName ?? 'Người dùng'}
                    </Text>
                    <Text style={[styles.footerPlan, { color: textMuted }]}>Gói miễn phí</Text>
                </View>
                <TouchableOpacity onPress={onSettings} style={styles.footerSettings}>
                    <Ionicons name="settings-outline" size={18} color={textMuted} />
                </TouchableOpacity>
            </View>
            <Modal
                visible={!!renameTarget}
                transparent
                animationType="fade"
                onRequestClose={() => setRenameTarget(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: modalBg, borderColor: modalBorder }]}>
                        <Text style={[styles.modalTitle, { color: textPrimary }]}>Đổi tên cuộc khám</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: inputBg, borderColor: modalBorder, color: textPrimary }]}
                            value={renameText}
                            onChangeText={setRenameText}
                            placeholder="Nhập tên mới..."
                            placeholderTextColor={textMuted}
                            autoFocus
                            maxLength={100}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel, { borderColor: modalBorder }]}
                                onPress={() => setRenameTarget(null)}
                            >
                                <Text style={[styles.modalBtnText, { color: textMuted }]}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnSave]}
                                onPress={submitRename}
                            >
                                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
    },
    newBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        borderRadius: 10,
        margin: 16,
        paddingVertical: 13,
        paddingHorizontal: 16,
        gap: 8,
    },
    newBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
    list: { flex: 1, paddingHorizontal: 8 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 1,
    },
    itemActive: { backgroundColor: '#EFF6FF' },
    itemText: { flex: 1, color: '#64748B', fontSize: 14 },
    itemTextActive: { color: '#2563EB', fontWeight: '500' },
    moreBtn: { padding: 4 },
    groupLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 4,
    },
    empty: {
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 13,
    },
    errorText: {
        color: '#DC2626',
        lineHeight: 18,
        paddingHorizontal: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    footerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    footerAvatarImage: { width: 36, height: 36, borderRadius: 18 },
    footerAvatarText: { color: '#2563EB', fontWeight: '700', fontSize: 15 },
    footerInfo: { flex: 1 },
    footerName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    footerPlan: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
    footerSettings: { padding: 4 },
    brandRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, gap: 10,
    },
    brandIcon: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    },
    brandIconText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    brandName: { fontSize: 15, fontWeight: '700' },
    collapseBtn: { padding: 4 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
    modalInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 20,
    },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalBtnCancel: { borderWidth: 1 },
    modalBtnSave: { backgroundColor: '#2563EB' },
    modalBtnText: { fontSize: 15, fontWeight: '600' },
});

export default ClientSidebar;
