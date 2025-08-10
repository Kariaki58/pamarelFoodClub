"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/account/product-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { Pagination } from '@/components/account/pagination'

const DISCOUNT_PERCENTAGES = [50, 40, 30, 20, 10]
const SECTIONS = [
  { id: 'food', label: 'Food' },
  { id: 'gadget', label: 'Gadgets' }
]

export default function CategoryPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('cat')
  const initialSearchQuery = searchParams.get('q')

  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : [])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' })
  const [selectedDiscounts, setSelectedDiscounts] = useState([])
  const [selectedSections, setSelectedSections] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [sortOption, setSortOption] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const productsPerPage = 12

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success) {
            setCategories(data.categories)
            
            // Check if URL has a numeric category (for ratings)
            if (initialCategory && !isNaN(initialCategory)) {
              setMinRating(parseInt(initialCategory))
            }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [initialCategory])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        let url = `/api/products?page=${currentPage}&limit=${productsPerPage}`
        
        // Handle category filter (either category slug or rating)
        if (selectedCategories.length > 0) {
          const isRatingFilter = !isNaN(selectedCategories[0])
          if (isRatingFilter) {
            url += `&minRating=${selectedCategories[0]}`
          } else {
            url += `&cat=${selectedCategories[0]}`
          }
        }
        
        if (searchQuery) {
          url += `&q=${searchQuery}`
        }

        // Add price filter if set
        if (priceRange.min) {
          url += `&minPrice=${priceRange.min}`
        }
        if (priceRange.max) {
          url += `&maxPrice=${priceRange.max}`
        }

        // Add discount filter if set
        if (selectedDiscounts.length > 0) {
          url += `&minDiscount=${Math.min(...selectedDiscounts)}`
        }

        // Add section filter if set
        if (selectedSections.length > 0) {
          url += `&sections=${selectedSections.join(',')}`
        }

        // Add sort option
        url += `&sort=${sortOption}`

        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products)
          setTotalProducts(data.total)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategories, currentPage, searchQuery, priceRange, selectedDiscounts, selectedSections, sortOption])

  const handleCategoryChange = (slug, checked) => {
    setSelectedCategories(prev =>
      checked ? [...prev, slug] : prev.filter(c => c !== slug)
    )
    setCurrentPage(1)
  }

  const handleDiscountChange = (discount, checked) => {
    setSelectedDiscounts(prev =>
        checked ? [...prev, discount] : prev.filter(d => d !== discount)
    )
    setCurrentPage(1)
  }

  const handleSectionChange = (section, checked) => {
    setSelectedSections(prev =>
      checked ? [...prev, section] : prev.filter(s => s !== section)
    )
    setCurrentPage(1)
  }
  
  const applyPriceFilter = () => {
    setPriceRange(tempPriceRange)
    setCurrentPage(1)
  }

  const pageTitle = searchQuery 
    ? `Search results for "${searchQuery}"`
    : selectedCategories.length > 0 && !isNaN(selectedCategories[0])
      ? `Products with ${selectedCategories[0]}+ stars`
      : "Products";

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="space-y-6">
            <Accordion type="multiple" defaultValue={["category", "price"]} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-semibold">Category</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {categories.map(category => (
                        <li key={category._id} className="flex items-center space-x-2">
                           <Checkbox
                                id={`cat-${category.slug}`}
                                checked={selectedCategories.includes(category.slug)}
                                onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
                            />
                            <Label htmlFor={`cat-${category.slug}`} className="text-sm font-normal hover:text-primary transition-colors cursor-pointer">
                                {category.name}
                            </Label>
                        </li>
                    ))}
                    {/* Rating filter */}
                    <li className="flex items-center space-x-2">
                      <Checkbox
                          id="rating-4"
                          checked={selectedCategories.includes('4')}
                          onCheckedChange={(checked) => handleCategoryChange('4', !!checked)}
                      />
                      <Label htmlFor="rating-4" className="text-sm font-normal hover:text-primary transition-colors cursor-pointer">
                          4+ Star Rated
                      </Label>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="section">
                <AccordionTrigger className="text-lg font-semibold">Section</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {SECTIONS.map(section => (
                        <li key={section.id} className="flex items-center space-x-2">
                           <Checkbox
                                id={`section-${section.id}`}
                                checked={selectedSections.includes(section.id)}
                                onCheckedChange={(checked) => handleSectionChange(section.id, !!checked)}
                            />
                            <Label htmlFor={`section-${section.id}`} className="text-sm font-normal hover:text-primary transition-colors cursor-pointer">
                                {section.label}
                            </Label>
                        </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-semibold">Price (₦)</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      placeholder="₦ Min" 
                      className="w-full" 
                      value={tempPriceRange.min} 
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))} 
                    />
                    <Input 
                      type="number" 
                      placeholder="₦ Max" 
                      className="w-full" 
                      value={tempPriceRange.max} 
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))} 
                    />
                  </div>
                  <Button 
                    className="mt-2 w-full bg-accent text-accent-foreground" 
                    onClick={applyPriceFilter}
                  >
                    Apply
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* <AccordionItem value="discount">
                <AccordionTrigger className="text-lg font-semibold">Discount Percentage</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        {DISCOUNT_PERCENTAGES.map(discount => (
                             <div key={discount} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`discount-${discount}`}
                                    checked={selectedDiscounts.includes(discount)}
                                    onCheckedChange={(checked) => handleDiscountChange(discount, !!checked)}
                                />
                                <Label htmlFor={`discount-${discount}`} className="text-sm font-normal cursor-pointer">
                                    {discount}% or more
                                </Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem> */}
            </Accordion>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold">{pageTitle}</h1>
                    <p className="text-muted-foreground mt-1">{totalProducts} items found</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <Label htmlFor="sort" className="hidden sm:block">Sort by:</Label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger id="sort" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="best-rated">Best Rated</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <p>Loading products...</p>
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalProducts / productsPerPage)}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold">No Products Found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or search to find what you're looking for.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  )
}