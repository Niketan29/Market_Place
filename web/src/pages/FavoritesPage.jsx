import React, { useState, useEffect } from 'react'
import { getProducts } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [user?.favorites])

  const fetchFavorites = async () => {
    if (!user?.favorites?.length) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await getProducts({ limit: 200 })
      const all = res.data.products || res.data
      const favSet = new Set(user.favorites)
      setProducts(all.filter(p => favSet.has(p._id)))
    } catch (err) {
      console.error('Failed to fetch favorites', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">My Favorites</h2>
        {products.length > 0 && (
          <span className="page-count">{products.length} items</span>
        )}
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner-lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="fa-regular fa-heart empty-icon" />
          <p>No favorites yet</p>
          <p className="empty-sub">Tap the heart on any product to save it here</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p, i) => (
            <ProductCard
              key={p._id}
              product={p}
              onPress={setSelectedProduct}
              index={i}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
