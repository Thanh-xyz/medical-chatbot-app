import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAdminConversationsAPI, getAdminMessagesAPI } from '../../services/apis/Admin/conversation.api';
import { COLORS } from '../../utils/constants';

const MessageListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAdminConversationsAPI({});
                setConversations(data.conversations ?? data ?? []);
            } catch {
                Alert.alert('Error', 'Failed to load.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <View style={styles.iconWrapper}>
                <Ionicons name="mail" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title ?? 'Conversation'}</Text>
                <Text style={styles.sub}>{item.user?.fullName ?? 'Unknown user'} · {item.messageCount ?? 0} messages</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: COLORS.primary + '20' }]}>
                <Text style={styles.badgeText}>{item.messageCount ?? 0}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 32 }} />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No messages found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    list: { padding: 12 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        elevation: 2,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 32 },
});

export default MessageListScreen;
