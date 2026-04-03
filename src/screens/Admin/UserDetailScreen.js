import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserByIdAPI, deleteUserAPI } from '../../services/apis/Admin/user.api';
import { COLORS } from '../../utils/constants';

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value ?? '-'}</Text>
    </View>
);

const UserDetailScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getUserByIdAPI(userId);
                setUser(data);
            } catch {
                Alert.alert('Error', 'Failed to load user.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [userId]);

    const handleDelete = () => {
        Alert.alert('Confirm', 'Delete this user?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteUserAPI(userId);
                        navigation.goBack();
                    } catch {
                        Alert.alert('Error', 'Failed to delete user.');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Detail</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.fullName}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role ?? 'client'}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <DetailRow label="Email" value={user?.email} />
                    <DetailRow label="Full Name" value={user?.fullName} />
                    <DetailRow label="Role" value={user?.role} />
                    <DetailRow label="Status" value={user?.isActive ? 'Active' : 'Inactive'} />
                    <DetailRow label="Created" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} />
                </View>

                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('AdminUserEdit', { userId })}
                    >
                        <Ionicons name="pencil-outline" size={18} color={COLORS.white} />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: { marginRight: 12 },
    headerTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
    container: { padding: 16 },
    avatarWrapper: { alignItems: 'center', marginBottom: 20 },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: { color: COLORS.white, fontSize: 32, fontWeight: '700' },
    name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
    roleBadge: {
        marginTop: 6,
        backgroundColor: COLORS.primary + '20',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    roleText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    label: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
    value: { fontSize: 14, color: COLORS.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    btnRow: { flexDirection: 'row', gap: 12 },
    editBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
    deleteBtn: {
        flex: 1,
        backgroundColor: COLORS.danger,
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    deleteBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

export default UserDetailScreen;
