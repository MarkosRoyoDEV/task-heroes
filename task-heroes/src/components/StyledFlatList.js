import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

const StyledFlatList = ({ 
    data, 
    renderItem, 
    keyExtractor, 
    ListEmptyComponent,
    contentContainerStyle,
    ...props 
}) => {
    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="never"
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    }
});

export default StyledFlatList; 