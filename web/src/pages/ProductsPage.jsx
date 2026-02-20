import React, { useState, useEffect, useRef } from 'react'
import { getProducts } from '../api/client'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchProducts()
  }, [search, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await getProducts({ page, limit: 12, search: search || undefined })
      setProducts(res.data.products || res.data)
      setTotalPages(res.data.pages || 1)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setSearch(val)
    }, 450)
  }

  return (
    <div className="page">
      <div className="search-bar-wrap">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={inputValue}
            onChange={handleSearchChange}
            className="search-input"
          />
          {inputValue && (
            <button
              className="search-clear"
              onClick={() => { setInputValue(''); setPage(1); setSearch('') }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner-lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-magnifying-glass empty-icon" />
          <p>No products found</p>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <span className="page-info">{page} / {totalPages}</span>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
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
