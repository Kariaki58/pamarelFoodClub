
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { products, categories } from '@/lib/mock-data'
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

const BRANDS = ["Apple", "Generic", "Official Stores"]
const DISCOUNT_PERCENTAGES = [50, 40, 30, 20, 10]
const SHIPPED_FROM_OPTIONS = [
    { id: 'shipped-abroad', label: 'Shipped from abroad', value: 'abroad'},
    { id: 'shipped-nigeria', label: 'Shipped from Nigeria', value: 'nigeria'}
]

export default function CategoryPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('cat')
  const initialSearchQuery = searchParams.get('q')

  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : [])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' })
  const [selectedDiscounts, setSelectedDiscounts] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedShippedFrom, setSelectedShippedFrom] = useState([])
  const [sortOption, setSortOption] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');

  const productsPerPage = 12

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

  const handleBrandChange = (brand, checked) => {
    setSelectedBrands(prev =>
        checked ? [...prev, brand] : prev.filter(b => b !== brand)
    )
    setCurrentPage(1)
  }

  const handleShippedFromChange = (value, checked) => {
    setSelectedShippedFrom(prev =>
        checked ? [...prev, value] : prev.filter(s => s !== value)
    )
    setCurrentPage(1)
  }
  
  const applyPriceFilter = () => {
    setPriceRange(tempPriceRange)
    setCurrentPage(1)
  }

  useEffect(() => {
    const categorySlug = searchParams.get('cat');
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategories([category.slug]);
      }
    }
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Category filter
    if (selectedCategories.length > 0) {
        const categoryNames = categories.filter(c => selectedCategories.includes(c.slug)).map(c => c.name)
        filtered = filtered.filter(p => categoryNames.includes(p.category))
    }

    // Price filter
    const minPrice = parseFloat(priceRange.min)
    const maxPrice = parseFloat(priceRange.max)
    if (!isNaN(minPrice)) {
        filtered = filtered.filter(p => p.price >= minPrice)
    }
    if (!isNaN(maxPrice)) {
        filtered = filtered.filter(p => p.price <= maxPrice)
    }

    // Discount filter
    if (selectedDiscounts.length > 0) {
        const minDiscount = Math.min(...selectedDiscounts)
        filtered = filtered.filter(p => {
            if (!p.originalPrice) return false;
            const discount = ((p.originalPrice - p.price) / p.originalPrice) * 100;
            return discount >= minDiscount
        })
    }

    // Brand filter
    if (selectedBrands.length > 0) {
        filtered = filtered.filter(p => selectedBrands.includes(p.brand))
    }
    
    // Shipped From filter (assuming product has a `shippedFrom` property, e.g., 'nigeria' or 'abroad')
    // We'll add this to mock data if it doesn't exist, for now we will randomize it
    if (selectedShippedFrom.length > 0) {
        filtered = filtered.filter(p => {
            const shippedFrom = p.id.charCodeAt(0) % 2 === 0 ? 'nigeria' : 'abroad' // dummy data
            return selectedShippedFrom.includes(shippedFrom)
        });
    }

    // Sorting
    switch (sortOption) {
        case 'newest':
            filtered.sort((a, b) => (b.reviews?.[0]?.date > a.reviews?.[0]?.date) ? 1 : -1) // simplistic date sort
            break;
        case 'price-low-high':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high-low':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
        default:
            filtered.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
    }

    return filtered;
  }, [selectedCategories, priceRange, selectedDiscounts, selectedBrands, selectedShippedFrom, sortOption, searchQuery])


  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const currentProducts = filteredAndSortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
  
  const pageTitle = searchQuery ? `Search results for "${searchQuery}"` : "Products";

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
                        <li key={category.id} className="flex items-center space-x-2">
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
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-semibold">Price (₦)</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center space-x-2">
                    <Input type="number" placeholder="₦ Min" className="w-full" value={tempPriceRange.min} onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))} />
                    <Input type="number" placeholder="₦ Max" className="w-full" value={tempPriceRange.max} onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))} />
                  </div>
                  <Button className="mt-2 w-full bg-accent text-accent-foreground" onClick={applyPriceFilter}>Apply</Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="discount">
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
                                <Label htmlFor={`discount-${discount}`} className="text-sm font-normal cursor-pointer">{discount}% or more</Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="brand">
                <AccordionTrigger className="text-lg font-semibold">Brand</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        {BRANDS.map(brand => (
                            <div key={brand} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`brand-${brand}`}
                                    checked={selectedBrands.includes(brand)}
                                    onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                                />
                                <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">{brand}</Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="shipped-from">
                <AccordionTrigger className="text-lg font-semibold">Shipped From</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        {SHIPPED_FROM_OPTIONS.map(option => (
                             <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={option.id}
                                    checked={selectedShippedFrom.includes(option.value)}
                                    onCheckedChange={(checked) => handleShippedFromChange(option.value, !!checked)}
                                />
                                <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">{option.label}</Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold">{pageTitle}</h1>
                    <p className="text-muted-foreground mt-1">{filteredAndSortedProducts.length} items found</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <Label htmlFor="sort" className="hidden sm:block">Sort by:</Label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger id="sort" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {currentProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
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
