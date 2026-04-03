import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { COLORS } from '../../utils/constants';

const DataTable = ({ columns = [], data = [], onRowPress }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                {columns.map((col) => (
                    <Text key={col.key} style={[styles.headerCell, { flex: col.flex ?? 1 }]}>
                        {col.label}
                    </Text>
                ))}
            </View>

            {/* Rows */}
            <ScrollView>
                {data.length === 0 ? (
                    <Text style={styles.empty}>No data found.</Text>
                ) : (
                    data.map((row, index) => (
                        <TouchableOpacity
                            key={row._id ?? index}
                            style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                            onPress={() => onRowPress && onRowPress(row)}
                            activeOpacity={0.7}
                        >
                            {columns.map((col) => (
                                <Text key={col.key} style={[styles.cell, { flex: col.flex ?? 1 }]}>
                                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                                </Text>
                            ))}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerCell: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 13,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rowEven: { backgroundColor: COLORS.white },
    rowOdd: { backgroundColor: COLORS.background },
    cell: {
        fontSize: 13,
        color: COLORS.text,
    },
    empty: {
        textAlign: 'center',
        padding: 24,
        color: COLORS.textLight,
    },
});

export default DataTable;
