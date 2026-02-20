import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#1A1A1A',
  card: '#1E1E1E',
  accent: '#FA5000',
  white: '#FFFFFF',
  muted: '#888888',
  border: '#2A2A2A',
};

const LIMIT = 6;

export default function ProductListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Animated search bar width
  const searchWidth = useRef(new Animated.Value(width - 80)).current;
  const [searchFocused, setSearchFocused] = useState(false);

  // Header entrance animation
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(headerTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const searchTimeout = useRef(null);

  const fetchProducts = useCallback(
    async (p = 1, q = search, reset = false) => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getProducts(p, LIMIT, q);
        setProducts(reset || p === 1 ? data.products : (prev) => [...prev, ...data.products]);
        setTotalPages(data.pages);
        setPage(p);
      } catch {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search]
  );

  // Reload products when screen is focused (e.g. after favoriting from detail)
  useFocusEffect(
    useCallback(() => {
      fetchProducts(1, search, true);
    }, [search])
  );

  // Debounced search
  const handleSearchChange = (text) => {
    setSearchInput(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(text);
    }, 450);
  };

  const onSearchFocus = () => {
    setSearchFocused(true);
    Animated.timing(searchWidth, {
      toValue: width - 80,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const onSearchBlur = () => setSearchFocused(false);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, search, true);
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      fetchProducts(page + 1, search, false);
    }
  };

  const handleFavoriteToggle = () => {
    // Silently succeed — the server + auth context handle state
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

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>What are you looking for?</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, searchFocused && styles.searchWrapperFocused]}>
        <Ionicons name="search-outline" size={18} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.muted}
          value={searchInput}
          onChangeText={handleSearchChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchInput('');
              setSearch('');
            }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="search" size={48} color={COLORS.muted} />
        <Text style={styles.emptyText}>
          {search ? `No results for "${search}"` : 'No products found'}
        </Text>
      </View>
    );
  };

  // Pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          onPress={() => page > 1 && fetchProducts(page - 1, search, true)}
          disabled={page <= 1}
        >
          <Ionicons name="chevron-back" size={18} color={page <= 1 ? COLORS.muted : COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.pageText}>
          {page} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
          onPress={() => page < totalPages && fetchProducts(page + 1, search, true)}
          disabled={page >= totalPages}
        >
          <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? COLORS.muted : COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderCard}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View>
            {renderFooter()}
            {renderPagination()}
            <View style={{ height: 20 }} />
          </View>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      {error ? (
        <View style={styles.errorBar}>
          <Ionicons name="warning-outline" size={16} color="#fff" />
          <Text style={styles.errorBarText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { paddingBottom: 24 },
  columnWrapper: { paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  subGreeting: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 8,
  },
  searchWrapperFocused: { borderColor: COLORS.accent },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 15 },
  cardWrapper: { flex: 1 },
  cardLeft: { marginRight: 0 },
  cardRight: { marginLeft: 0 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 12,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { color: COLORS.white, fontSize: 14, fontWeight: '600', minWidth: 50, textAlign: 'center' },
  errorBar: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorBarText: { color: '#fff', fontSize: 13, flex: 1 },
});
