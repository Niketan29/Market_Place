import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProductById, addFavorite, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.42;

const COLORS = {
  bg: '#1A1A1A',
  card: '#1E1E1E',
  accent: '#FA5000',
  accentDark: '#C43E00',
  white: '#FFFFFF',
  muted: '#888888',
  border: '#2A2A2A',
  fav: '#FF375F',
};

export default function ProductDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { product: routeProduct } = route.params;
  const { user, syncFavorites } = useAuth();

  const [product, setProduct] = useState(routeProduct);
  const [loading, setLoading] = useState(false);
  const isFav = user?.favorites?.includes(product._id);
  const [favorited, setFavorited] = useState(isFav);
  const [toggling, setToggling] = useState(false);

  // Content slide-up animation
  const slideUp = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Heart beat on favorite
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Optionally refresh product from server
    (async () => {
      try {
        const { data } = await getProductById(product._id);
        setProduct(data);
      } catch {}
    })();
  }, []);

  const heartBeat = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleFavoriteToggle = async () => {
    if (toggling || !user) return;
    setToggling(true);
    const next = !favorited;
    setFavorited(next);
    heartBeat();
    try {
      if (next) {
        const { data } = await addFavorite(product._id);
        syncFavorites(data.favorites);
      } else {
        const { data } = await removeFavorite(product._id);
        syncFavorites(data.favorites);
      }
    } catch {
      setFavorited(!next);
    } finally {
      setToggling(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(26,26,26,0.95)']}
            style={styles.imageGradient}
          />
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          {/* Title & Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Tags row */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.accent} />
              <Text style={styles.tagText}>Verified</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="car-outline" size={14} color={COLORS.accent} />
              <Text style={styles.tagText}>Free Shipping</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="refresh-outline" size={14} color={COLORS.accent} />
              <Text style={styles.tagText}>30-Day Returns</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.white} />
      </TouchableOpacity>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Favorite button */}
        <TouchableOpacity
          style={[styles.favBtn, favorited && styles.favBtnActive]}
          onPress={handleFavoriteToggle}
          activeOpacity={0.8}
          disabled={toggling}
        >
          {toggling ? (
            <ActivityIndicator color={favorited ? '#fff' : COLORS.fav} size="small" />
          ) : (
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={24}
                color={favorited ? '#fff' : COLORS.fav}
              />
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Add to Cart (UI only) */}
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartBtnGradient}
          >
            <Ionicons name="bag-add-outline" size={20} color="#fff" />
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  imageWrapper: { width, height: IMAGE_HEIGHT, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT * 0.5,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  titleRow: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.white, lineHeight: 28 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  priceBadge: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
  },
  priceText: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFB80020',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: { color: '#FFB800', fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: { color: '#CCCCCC', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  favBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favBtnActive: {
    backgroundColor: COLORS.fav,
    borderColor: COLORS.fav,
  },
  cartBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  cartBtnGradient: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
