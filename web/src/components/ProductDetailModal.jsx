import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite } from '../api/client'

export default function ProductDetailModal({ product, onClose }) {
  const { user, syncFavorites } = useAuth()
  const [visible, setVisible] = useState(false)
  const [faved, setFaved] = useState(user?.favorites?.includes(product._id) || false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const handleKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleFavorite = async () => {
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
    } catch {
      setFaved(!newFaved)
    } finally {
      setToggling(false)
    }
  }

  const price = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price || 0).toFixed(2)

  return ReactDOM.createPortal(
    <div className={`modal-backdrop${visible ? ' visible' : ''}`} onClick={close}>
      <div
        className={`modal-sheet${visible ? ' slide-up' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>

        {product.image ? (
          <img src={product.image} alt={product.name} className="modal-image" />
        ) : (
          <div className="modal-image-placeholder">
            <i className="fa-solid fa-shoe-prints" />
          </div>
        )}

        <div className="modal-body">
          <h2 className="modal-name">{product.title}</h2>
          <p className="modal-price">${price}</p>

          {product.description && (
            <p className="modal-description">{product.description}</p>
          )}
        </div>

        <div className="modal-actions">
          <button
            className={`modal-fav-btn${faved ? ' faved' : ''}`}
            onClick={handleFavorite}
          >
            <i className={`fa-heart ${faved ? 'fa-solid' : 'fa-regular'}`} />
            {faved ? 'Saved' : 'Save'}
          </button>
          <button className="modal-cart-btn">
            <i className="fa-solid fa-bag-shopping" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
