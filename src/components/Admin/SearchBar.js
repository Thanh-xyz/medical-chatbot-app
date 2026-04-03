import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...', onSearch }) => {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                returnKeyType="search"
                onSubmitEditing={onSearch}
            />
            {value?.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        padding: 0,
    },
    clearBtn: {
        marginLeft: 8,
    },
});

export default SearchBar;
