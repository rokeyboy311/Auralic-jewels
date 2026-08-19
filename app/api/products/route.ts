import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const metalType = searchParams.get('metalType');
    const purity = searchParams.get('purity');
    const stoneType = searchParams.get('stoneType');
    const gender = searchParams.get('gender');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'featured';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let products = dbStore.getProducts();

    // Filters
    if (category) {
      const catLower = category.toLowerCase().replace(/['s]/g, '');
      products = products.filter((p) => {
        const pCatLower = p.category.toLowerCase().replace(/['s]/g, '');
        return pCatLower.includes(catLower) || catLower.includes(pCatLower);
      });
    }

    if (collection) {
      const colLower = collection.toLowerCase();
      products = products.filter((p) => p.collection.toLowerCase().replace(/\s+/g, '-').includes(colLower));
    }

    if (metalType) {
      products = products.filter((p) => p.metalType.toLowerCase() === metalType.toLowerCase());
    }

    if (purity) {
      products = products.filter((p) => p.purity.toLowerCase() === purity.toLowerCase());
    }

    if (stoneType) {
      products = products.filter((p) => p.stoneType.toLowerCase() === stoneType.toLowerCase());
    }

    if (gender) {
      products = products.filter((p) => p.gender.toLowerCase() === gender.toLowerCase() || p.gender.toLowerCase() === 'unisex');
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) products = products.filter((p) => p.priceUSD >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) products = products.filter((p) => p.priceUSD <= max);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.stoneType.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'price-asc') {
      products.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.priceUSD - a.priceUSD);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'best-seller') {
      products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // featured
      products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
