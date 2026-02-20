import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite } from '../api/client'

export default function ProductCard({ product, onPress, onFavoriteToggle, index = 0 }) {
  const { user, syncFavorites } = useAuth()
  const isFaved = user?.favorites?.includes(product._id) || false
  const [faved, setFaved] = useState(isFaved)
  const [toggling, setToggling] = useState(false)

  const handleFavorite = async (e) => {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    const newFaved = !faved
    setFaved(newFaved)
    try {
      let res
      if (newFaved) {
        res = await addFavorite(product._id)
      } else {
        res = await removeFavorite(product._id)
      }
      if (res.data?.favorites) {
        syncFavorites(res.data.favorites)
      }
      if (onFavoriteToggle) onFavoriteToggle(product._id, newFaved)
    } catch {
      setFaved(!newFaved)
    } finally {
      setToggling(false)
    }
  }

  const price = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price || 0).toFixed(2)

  return (
    <div
      className="product-card product-card-animated"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onPress && onPress(product)}
    >
      <div className="product-card-image-wrap">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card-image" />
        ) : (
          <div className="product-card-image-placeholder">
            <i className="fa-solid fa-shoe-prints" />
          </div>
        )}
        <button
          className={`fav-btn${faved ? ' faved' : ''}`}
          onClick={handleFavorite}
          aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
        >
          <i className={`fa-heart ${faved ? 'fa-solid' : 'fa-regular'}`} />
        </button>
      </div>
      <div className="product-card-info">
        <h3 className="product-card-name">{product.title}</h3>
        <p className="product-card-price">${price}</p>
      </div>
    </div>
  )
}
