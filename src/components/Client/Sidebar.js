import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../../hooks/useAuth';

const ClientSidebar = ({ conversations, activeId, onSelect, onNew, onDelete, onSettings }) => {
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    const filtered = conversations.filter((c) =>
        (c.title || '').toLowerCase().includes(search.toLowerCase())
    );

    const initials = user?.displayName?.charAt(0)?.toUpperCase() ?? 'U';

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* New chat button */}
            <TouchableOpacity style={styles.newBtn} onPress={onNew}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.newBtnText}>Bắt đầu khám mới</Text>
            </TouchableOpacity>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm lịch sử khám..."
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Conversation list */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {filtered.length === 0 ? (
                    <Text style={styles.empty}>Chưa có lịch sử khám</Text>
                ) : (
                    filtered.map((conv) => (
                        <TouchableOpacity
                            key={conv._id}
                            style={[styles.item, activeId === conv._id && styles.itemActive]}
                            onPress={() => onSelect(conv)}
                        >
                            <Ionicons
                                name="chatbubble-outline"
                                size={15}
                                color={activeId === conv._id ? '#2563EB' : '#94A3B8'}
                                style={{ marginRight: 8 }}
                            />
                            <Text
                                style={[styles.itemText, activeId === conv._id && styles.itemTextActive]}
                                numberOfLines={1}
                            >
                                {conv.title || 'Cuộc khám mới'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => onDelete(conv._id)}
                                style={styles.deleteBtn}
                            >
                                <Ionicons name="trash-outline" size={14} color="#CBD5E1" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* User info footer */}
            <View style={styles.footer}>
                <View style={styles.footerAvatar}>
                    <Text style={styles.footerAvatarText}>{initials}</Text>
                </View>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerName} numberOfLines={1}>
                        {user?.displayName ?? 'Người dùng'}
                    </Text>
                    <Text style={styles.footerPlan}>Tài khoản miễn phí</Text>
                </View>
                <TouchableOpacity onPress={onSettings} style={styles.footerSettings}>
                    <Ionicons name="settings-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>
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
    deleteBtn: { padding: 4 },
    empty: {
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 13,
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
    footerAvatarText: { color: '#2563EB', fontWeight: '700', fontSize: 15 },
    footerInfo: { flex: 1 },
    footerName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    footerPlan: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
    footerSettings: { padding: 4 },
});

export default ClientSidebar;
