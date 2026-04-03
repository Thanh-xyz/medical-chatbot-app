import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUsersAPI, deleteUserAPI } from '../../services/apis/Admin/user.api';
import SearchBar from '../../components/Admin/SearchBar';
import { COLORS } from '../../utils/constants';

const UserListScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchUsers = useCallback(async (keyword = '') => {
        try {
            const data = await getUsersAPI({ search: keyword });
            setUsers(data.users ?? data ?? []);
        } catch {
            Alert.alert('Error', 'Failed to load users.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = (userId) => {
        Alert.alert('Confirm', 'Delete this user?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteUserAPI(userId);
                        setUsers((prev) => prev.filter((u) => u._id !== userId));
                    } catch {
                        Alert.alert('Error', 'Failed to delete user.');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.fullName?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role ?? 'client'}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminUserDetail', { userId: item._id })}
                >
                    <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminUserEdit', { userId: item._id })}
                >
                    <Ionicons name="pencil-outline" size={20} color={COLORS.warning} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Users</Text>
            </View>
            <View style={styles.searchContainer}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    onSearch={() => fetchUsers(search)}
                    placeholder="Search users..."
                />
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 32 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(search); }} />
                    }
                    ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
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
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    info: { flex: 1 },
    name: { fontWeight: '700', fontSize: 15, color: COLORS.text },
    email: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    roleBadge: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary + '20',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    roleText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 6 },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 32, fontSize: 15 },
});

export default UserListScreen;
