import type { Metadata } from 'next'
import type React from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    return data?.product ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await fetchProduct(params.id)

  const title = product?.name ? `${product.name} | ShoweCabin` : 'Ürün | ShoweCabin'
  const description = product?.description ? String(product.description).slice(0, 160) : 'ShoweCabin ürün detay sayfası.'

  const path = `/products/${params.id}`
  const canonical = SITE_URL ? new URL(path, SITE_URL).toString() : undefined

  const images: string[] = []
  if (product?.main_image) images.push(product.main_image)
  if (Array.isArray(product?.images)) {
    for (const img of product.images) {
      if (img?.image_url && !images.includes(img.image_url)) images.push(img.image_url)
    }
  }

  return {
    title,
    description,
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'ShoweCabin',
      images: images.length
        ? images.slice(0, 4).map((url) => ({ url }))
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length ? [images[0]] : undefined,
    },
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
