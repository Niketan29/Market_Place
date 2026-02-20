import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite } from '../api/client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns, 24px side + 8px gap

const COLORS = {
  card: '#1E1E1E',
  accent: '#FA5000',
  white: '#FFFFFF',
  muted: '#888888',
  border: '#2A2A2A',
  fav: '#FF375F',
};

export default function ProductCard({ product, onPress, onFavoriteToggle, index = 0 }) {
  const { user, syncFavorites } = useAuth();

  const isFav = user?.favorites?.includes(product._id);
  const [favorited, setFavorited] = useState(isFav);
  const [toggling, setToggling] = useState(false);

  // Card press scale
  const cardScale = useRef(new Animated.Value(1)).current;
  // Heart beat animation
  const heartScale = useRef(new Animated.Value(1)).current;
  // Entrance animation
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(entranceTranslateY, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onCardPressIn = () =>
    Animated.spring(cardScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onCardPressOut = () =>
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();

  const heartBeat = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
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
      if (onFavoriteToggle) onFavoriteToggle(product._id, next);
    } catch {
      // revert on error
      setFavorited(!next);
    } finally {
      setToggling(false);
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: entranceOpacity,
        transform: [{ scale: cardScale }, { translateY: entranceTranslateY }],
      },
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onCardPressIn}
        onPressOut={onCardPressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Favorite button overlay */}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={handleFavoriteToggle}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={18}
                color={favorited ? COLORS.fav : '#ccc'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  touchable: { flex: 1 },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#252525',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { padding: 10 },
  title: { color: COLORS.white, fontSize: 12, fontWeight: '600', marginBottom: 4, lineHeight: 16 },
  price: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
});
