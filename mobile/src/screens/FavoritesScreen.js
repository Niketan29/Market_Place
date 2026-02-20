import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getProductById } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const COLORS = {
  bg: '#1A1A1A',
  accent: '#FA5000',
  white: '#FFFFFF',
  muted: '#888888',
};

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const favIds = user?.favorites ?? [];
    if (favIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        favIds.map((id) => getProductById(id))
      );
      const loaded = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value.data);
      setProducts(loaded);
    } catch {
      // partial failure is fine
    } finally {
      setLoading(false);
    }
  }, [user?.favorites]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleFavoriteToggle = (productId, isFav) => {
    if (!isFav) {
      // Remove from local list immediately
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  const renderCard = ({ item, index }) => (
    <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        onFavoriteToggle={handleFavoriteToggle}
        index={index}
      />
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-dislike-outline" size={56} color={COLORS.muted} />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart on any product to save it here
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.length > 0 && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {products.length} saved item{products.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          products.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  countText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  list: { paddingTop: 8, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  columnWrapper: { paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  cardWrapper: { flex: 1 },
  cardLeft: {},
  cardRight: {},
  empty: { alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
