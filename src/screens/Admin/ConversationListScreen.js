import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAdminConversationsAPI, deleteAdminConversationAPI } from '../../services/apis/Admin/conversation.api';
import SearchBar from '../../components/Admin/SearchBar';
import { COLORS } from '../../utils/constants';

const ConversationListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchConversations = useCallback(async (keyword = '') => {
        try {
            const data = await getAdminConversationsAPI({ search: keyword });
            setConversations(data.conversations ?? data ?? []);
        } catch {
            Alert.alert('Error', 'Failed to load conversations.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchConversations(); }, []);

    const handleDelete = (id) => {
        Alert.alert('Confirm', 'Delete this conversation?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAdminConversationAPI(id);
                        setConversations((prev) => prev.filter((c) => c._id !== id));
                    } catch {
                        Alert.alert('Error', 'Failed to delete conversation.');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('AdminConversationDetail', { conversationId: item._id })}
        >
            <View style={styles.iconWrapper}>
                <Ionicons name="chatbubbles" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title ?? 'Untitled'}</Text>
                <Text style={styles.sub}>
                    {item.user?.fullName ?? 'Unknown'} · {item.messageCount ?? 0} messages
                </Text>
                <Text style={styles.date}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Conversations</Text>
            </View>
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeText={setSearch} onSearch={() => fetchConversations(search)} placeholder="Search conversations..." />
            </View>
            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 32 }} />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(search); }} />}
                    ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    searchContainer: { padding: 12 },
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
        shadowRadius: 6,
        elevation: 2,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    title: { fontWeight: '700', fontSize: 15, color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    date: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
    deleteBtn: { padding: 8 },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 32 },
});

export default ConversationListScreen;
