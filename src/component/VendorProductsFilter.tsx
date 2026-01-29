import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/api'
import { FaFilter, FaSortAmountDown, FaCheck, FaStar, FaShoppingCart, FaTh, FaBars } from 'react-icons/fa'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { guestCartUtils } from '../utils/cartUtils'

interface Product {
  id: string
  name: string
  description?: string
  brand?: string
  price: string
  discountPercentage?: string
  images?: string[]
  rating?: string
  status?: string
  category?: {
    id: string
    name: string
  }
  vendor?: {
    id: string
    businessName: string
  }
  stock?: number
  variants?: Array<{
    size?: string
    color?: string
    stock?: number
    images?: string[]
  }>
}

interface Notification {
  show: boolean
  message: string
  productName: string
}

interface VendorProductsFilterProps {
  vendorId: string | null
}

const MIN = 10
const MAX = 10000

const VendorProductsFilter: React.FC<VendorProductsFilterProps> = ({ vendorId }) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState<string>('')
  const [sort, setSort] = useState<string>('newest')
  const [minVal, setMinVal] = useState<number>(MIN)
  const [maxVal, setMaxVal] = useState<number>(MAX)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'double' | 'single'>('double')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    priceFilter: false,
    brands: false,
  })
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    productName: ''
  })

  useEffect(() => {
    if (vendorId) {
      fetchVendorProducts()
    }
  }, [vendorId])

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    const locked = isSortOpen || isFilterOpen
    if (locked) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isSortOpen, isFilterOpen])

  const fetchVendorProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getProducts({ 
        vendorId,
        status: 'ACTIVE'
      })
      const fetchedProducts = Array.isArray(response) ? response : response.data || []
      setProducts(fetchedProducts)
    } catch (error) {
      console.error('Failed to fetch vendor products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(x => x !== brand) : [...prev, brand])
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat])
  }

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()

    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      navigate(`/product/${product.id}`)
      return
    }

    const currentStock = product.stock || 0
    if (currentStock === 0) {
      setNotification({
        show: true,
        message: 'Out of stock!',
        productName: product.name
      })
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000)
      return
    }

    const basePrice = parseFloat(product.price)
    const discountPercent = product.discountPercentage ? parseFloat(product.discountPercentage) : 0
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice

    const cartItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] || '/images/placeholder-products.png',
      brand: product.brand || 'Unknown',
      description: product.description || product.name,
      size: 'Free Size',
      color: 'Default',
      quantity: 1,
      maxStock: currentStock
    }

    guestCartUtils.addItem(cartItem)

    setNotification({
      show: true,
      message: 'Added to cart successfully!',
      productName: product.name
    })

    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000)
  }

  // Get unique values from products
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  const uniqueCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))]

  // Filter and sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand || '')
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category?.name || '')
      const price = parseFloat(p.price)
      const matchesPrice = price >= minVal && price <= maxVal
      return matchesQuery && matchesBrand && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sort) {
        case 'low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0')
        case 'newest':
        default:
          return 0
      }
    })

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    }
    return product.stock || 0
  }

  const getFirstAvailableImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return `https://backend.originplatforms.co${product.images[0]}`
    }
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          return `https://backend.originplatforms.co${variant.images[0]}`
        }
      }
    }

    return '/images/placeholder-products.png'
  }

  const renderProductCard = (product: Product) => {
    const basePrice = parseFloat(product.price)
    const discountPercent = product.discountPercentage ? parseFloat(product.discountPercentage) : 0
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice
    const totalStock = getTotalStock(product)
    const hasVariants = product.variants && product.variants.length > 0
    const isOutOfStock = totalStock === 0

    return (
      <div 
        key={product.id} 
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative">
          <img
            src={getFirstAvailableImage(product)}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-products.png'
            }}
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {discountPercent.toFixed(0)}% OFF
            </div>
          )}
          {isOutOfStock ? (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
              OUT OF STOCK
            </div>
          ) : totalStock <= 5 ? (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ONLY {totalStock} LEFT
            </div>
          ) : null}
          {hasVariants && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
              OPTIONS AVAILABLE
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.brand || 'No Brand'}</p>

          <div className="flex items-center mb-2">
            {product.rating && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="text-sm text-gray-700">{parseFloat(product.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">{formatPrice(finalPrice.toString())}</span>
              {discountPercent > 0 && (
                <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          {!isOutOfStock && (
            <button
              onClick={(e) => addToCart(e, product)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FaShoppingCart />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!vendorId) {
    return null
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(107,114,128,0.6) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(107,114,128,0.6); border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
      `}</style>

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="bg-white rounded-full p-1">
            <FaCheck className="text-green-500 text-sm" />
          </div>
          <div>
            <div className="font-semibold">{notification.message}</div>
            <div className="text-sm">{notification.productName}</div>
          </div>
        </div>
      )}

      {/* Mobile quick-controls */}
      <div className="md:hidden max-w-full mb-1">
        <div className="flex items-center gap-0 bg-white border border-gray-200 divide-x divide-gray-200 text-sm h-11">
          <button
            className="flex-1 flex items-center justify-center gap-2 h-full"
            onClick={() => setIsFilterOpen(true)}
          >
            <FaFilter />
            Filters
          </button>

          <button
            className="flex-1 flex items-center justify-center gap-2 h-full"
            onClick={() => setIsSortOpen(true)}
          >
            <FaSortAmountDown />
            Sort
          </button>

          <button
            className="flex-1 flex items-center justify-center gap-2 h-full"
            onClick={() => setViewMode(viewMode === 'double' ? 'single' : 'double')}
          >
            {viewMode === 'double' ? <FaBars /> : <FaTh />}
            View
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Desktop controls */}
        <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-gray-700 font-medium">
              {filteredProducts.length} Products
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('double')}
                className={`p-2 ${viewMode === 'double' ? 'bg-gray-100' : ''}`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 ${viewMode === 'single' ? 'bg-gray-100' : ''}`}
              >
                <FaBars />
              </button>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white p-4 max-h-[calc(100vh-6rem)] overflow-auto pr-2 custom-scrollbar">
                <h3 className="font-bold text-lg mb-3">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-md py-3 pl-4 pr-12 text-sm bg-[#f5f5f5]"
                  />
                </div>

                {uniqueCategories.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mt-6 mb-3">
                      <h3 className="font-bold text-lg">Categories</h3>
                      <button onClick={() => toggleSection('categories')} className={`p-1 transform transition-transform ${openSections.categories ? 'rotate-180' : 'rotate-0'}`}>
                        <RiArrowDropDownLine size={24} />
                      </button>
                    </div>
                    {openSections.categories && (
                      <ul className="text-gray-600 space-y-3">
                        {uniqueCategories.map((cat) => (
                          <li key={cat} className="flex items-center gap-3">
                            <input
                              id={`cat-${cat}`}
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => toggleCategory(cat)}
                              className="w-4 h-4 accent-black"
                            />
                            <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {uniqueBrands.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mt-6 mb-3">
                      <h3 className="font-bold text-lg">Brands</h3>
                      <button onClick={() => toggleSection('brands')} className={`p-1 transform transition-transform ${openSections.brands ? 'rotate-180' : 'rotate-0'}`}>
                        <RiArrowDropDownLine size={24} />
                      </button>
                    </div>
                    {openSections.brands && (
                      <ul className="text-gray-600 space-y-3">
                        {uniqueBrands.map((brand) => (
                          <li key={brand} className="flex items-center gap-3">
                            <input
                              id={`brand-${brand}`}
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 accent-black"
                            />
                            <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">{brand}</label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Price Range</h3>
                    <button onClick={() => toggleSection('priceFilter')} className={`p-1 transform transition-transform ${openSections.priceFilter ? 'rotate-180' : 'rotate-0'}`}>
                      <RiArrowDropDownLine size={24} />
                    </button>
                  </div>
                  {openSections.priceFilter && (
                    <div>
                      <div className="relative mt-3">
                        <div className="h-2 bg-green-500 rounded-full" />
                        <div
                          className="absolute h-2 bg-green-600 rounded-full"
                          style={{
                            left: `${((minVal - MIN) / (MAX - MIN)) * 100}%`,
                            right: `${100 - ((maxVal - MIN) / (MAX - MIN)) * 100}%`,
                          }}
                        />
                        <input
                          type="range"
                          min={MIN}
                          max={MAX}
                          value={minVal}
                          onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
                          className="absolute left-0 top-0 w-full h-6 appearance-none pointer-events-auto bg-transparent"
                        />
                        <input
                          type="range"
                          min={MIN}
                          max={MAX}
                          value={maxVal}
                          onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
                          className="absolute left-0 top-0 w-full h-6 appearance-none pointer-events-auto bg-transparent"
                        />
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        Price: ₹{minVal} — ₹{maxVal}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products available from this vendor.</p>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
                {filteredProducts.map((product) => renderProductCard(product))}
              </div>
            )}
          </main>

          {/* Mobile Sort Sheet */}
          {isSortOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsSortOpen(false)} />
              <div className="fixed left-0 right-0 bottom-0 mx-auto w-full max-w-xl rounded-t-xl bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Sort</h3>
                  <button onClick={() => setIsSortOpen(false)} className="p-2 text-gray-600">×</button>
                </div>
                <ul className="space-y-4">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'low', label: 'Price: Low to High' },
                    { value: 'high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                  ].map((option) => (
                    <li key={option.value} className="flex items-center justify-between">
                      <div className="text-sm">{option.label}</div>
                      <input
                        type="radio"
                        name="sort"
                        checked={sort === option.value}
                        onChange={() => { setSort(option.value); setIsSortOpen(false); }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Mobile Filter Sheet */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
              <div className="fixed left-0 right-0 bottom-0 mx-auto w-full max-w-xl rounded-t-xl bg-white p-4 shadow-lg overflow-auto" style={{ maxHeight: '80vh' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 text-gray-600">×</button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Search</h4>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-md py-3 pl-4 pr-12 text-sm bg-[#f5f5f5]"
                    />
                  </div>

                  {uniqueCategories.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Categories</h4>
                      <ul className="space-y-3">
                        {uniqueCategories.map((cat) => (
                          <li key={cat} className="flex items-center gap-3">
                            <input
                              id={`mobile-cat-${cat}`}
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => toggleCategory(cat)}
                              className="w-4 h-4 accent-black"
                            />
                            <label htmlFor={`mobile-cat-${cat}`} className="text-sm">{cat}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uniqueBrands.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Brands</h4>
                      <ul className="space-y-3">
                        {uniqueBrands.map((brand) => (
                          <li key={brand} className="flex items-center gap-3">
                            <input
                              id={`mobile-brand-${brand}`}
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 accent-black"
                            />
                            <label htmlFor={`mobile-brand-${brand}`} className="text-sm">{brand}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-3">Price Range</h4>
                    <div className="relative mt-3">
                      <div className="h-2 bg-green-500 rounded-full" />
                      <div
                        className="absolute h-2 bg-green-600 rounded-full"
                        style={{
                          left: `${((minVal - MIN) / (MAX - MIN)) * 100}%`,
                          right: `${100 - ((maxVal - MIN) / (MAX - MIN)) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={MIN}
                        max={MAX}
                        value={minVal}
                        onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
                        className="absolute left-0 top-0 w-full h-6 appearance-none pointer-events-auto bg-transparent"
                      />
                      <input
                        type="range"
                        min={MIN}
                        max={MAX}
                        value={maxVal}
                        onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
                        className="absolute left-0 top-0 w-full h-6 appearance-none pointer-events-auto bg-transparent"
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Price: ₹{minVal} — ₹{maxVal}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex items-center justify-between mt-6">
                  <button
                    onClick={() => {
                      setSelectedCategories([])
                      setSelectedBrands([])
                      setMinVal(MIN)
                      setMaxVal(MAX)
                      setQuery('')
                    }}
                    className="text-sm text-gray-600"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-[#75bd4b] text-white px-8 py-2 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default VendorProductsFilter
