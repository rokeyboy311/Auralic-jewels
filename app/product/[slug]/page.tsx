'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Award,
  Sparkles,
  Truck,
  RotateCcw,
  Check,
  Star,
  ChevronRight,
  Info,
  Ruler,
  Sliders,
  Wand2,
  MessageSquare,
} from 'lucide-react';
import { Product, Review } from '@/lib/types';
import { getProductBySlug, getProducts, getProductReviews, submitProductReview } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import CustomDesignModal from '@/components/CustomDesignModal';
import ProductJsonLd from '@/components/ProductJsonLd';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { openChat } = useChat();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('7');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'craft' | 'shipping' | 'care'>('specs');
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getProductBySlug(slug);
      if (res.success && res.data) {
        const prodData = res.data;
        setProduct(prodData);
        if (prodData.variants && prodData.variants.length > 0) {
          setSelectedVariantId(prodData.variants[0].id);
        }

        // Fetch related products & reviews
        const [relatedRes, reviewsRes] = await Promise.all([
          getProducts({ category: prodData.category, limit: 4 }),
          getProductReviews(prodData.id),
        ]);
        if (relatedRes.success && relatedRes.data) {
          setRelatedProducts(relatedRes.data.filter((p) => p.id !== prodData.id));
        }
        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-serif text-xl text-[#73685a]">
        Retrieving Masterpiece from Maison Archives...
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const isFavorited = isInWishlist(product.id);
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPriceUSD = selectedVariant?.priceUSD || product.priceUSD;
  const currentCompareUSD = selectedVariant?.comparePriceUSD || product.comparePriceUSD;

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, 1, selectedSize);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setIsSubmittingReview(true);
    const res = await submitProductReview({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      userCountry: 'Verified Patron',
    });
    setIsSubmittingReview(false);
    if (res.success && res.data) {
      setReviews([res.data, ...reviews]);
      setShowReviewForm(false);
      setReviewName('');
      setReviewTitle('');
      setReviewComment('');
      success('Review Submitted', 'Thank you for sharing your experience with the Maison.');
    } else {
      error('Submission Failed', 'Could not record your review.');
    }
  };

  const ringSizes = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '10'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
      {product && <ProductJsonLd product={product} />}
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#73685a] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#141210]">
          Maison
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <Link href="/shop" className="hover:text-[#141210]">
          Shop
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <span className="text-[#141210] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Gallery + Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT: MULTI-IMAGE GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-[#f0e9df] border border-[#c5b49e]/40 overflow-hidden shadow-xs">
            {product.images[selectedImageIndex] && (
              <Image
                src={product.images[selectedImageIndex].url}
                alt={product.name}
                fill
                priority
                className="object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.isNewArrival && (
                <span className="bg-[#141210] text-[#faf8f5] text-[10px] tracking-[0.2em] uppercase px-3 py-1 font-medium">
                  New Arrival
                </span>
              )}
              {product.stoneType && product.stoneType !== 'None' && (
                <span className="bg-[#faf8f5]/90 text-[#141210] text-[10px] tracking-widest uppercase px-2.5 py-1 border border-[#c5b49e]/40">
                  {product.stoneType}
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-xs transition-all z-10 ${
                isFavorited
                  ? 'bg-[#141210] text-[#d4af37]'
                  : 'bg-[#faf8f5]/85 text-[#2b2621] hover:bg-[#141210] hover:text-[#d4af37]'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#d4af37]' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square bg-[#f0e9df] border transition-all overflow-hidden ${
                    selectedImageIndex === idx
                      ? 'border-[#9b7e46] ring-1 ring-[#9b7e46]'
                      : 'border-[#c5b49e]/40 hover:border-[#9b7e46]'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT DETAILS & CONFIGURATION */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#73685a] uppercase tracking-wider mb-2">
              <span>SKU: {product.sku}</span>
              {product.rating > 0 && (
                <div className="flex items-center gap-1 text-[#9b7e46]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-[#9b7e46]' : 'text-[#c5b49e]'
                      }`}
                    />
                  ))}
                  <span className="font-mono ml-1 text-xs">({reviews.length})</span>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] leading-tight font-light">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#73685a] mt-2 leading-relaxed font-light">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing Section */}
          <div className="p-4 bg-[#f2ece2] border border-[#ebdccd] flex items-baseline justify-between">
            <div>
              <span className="text-[10px] tracking-widest text-[#9b7e46] uppercase block">
                Acquisition Value
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-medium text-[#141210]">
                  {formatPrice(currentPriceUSD)}
                </span>
                {currentCompareUSD && (
                  <span className="text-sm text-[#998b79] line-through font-serif">
                    {formatPrice(currentCompareUSD)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Ready for Armored Dispatch</span>
              </span>
              <p className="text-[10px] text-[#73685a]">Complimentary Ferrari Group Delivery</p>
            </div>
          </div>

          {/* Variant Selector (Metal Alloys & Karats) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-[#4a4237] font-medium">
                Select Metal Alloy & Purity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 text-left border transition-all text-xs ${
                      selectedVariantId === v.id
                        ? 'bg-[#141210] text-[#faf8f5] border-[#141210] shadow-xs'
                        : 'bg-white text-[#2b2621] border-[#c5b49e]/60 hover:border-[#9b7e46]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {v.purity} {v.metalType}
                      </span>
                      <span className="font-mono text-[#d4af37]">{formatPrice(v.priceUSD)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ring Sizing Selector (If category is Rings) */}
          {(product.category === 'Rings' || product.name.toLowerCase().includes('ring')) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-[#4a4237] font-medium">
                  Select Ring Size (US Standard)
                </label>
                <Link
                  href="/size-guide"
                  className="text-xs text-[#9b7e46] hover:underline flex items-center gap-1"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Size Guide</span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {ringSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-10 text-xs font-mono border transition-all flex items-center justify-center ${
                      selectedSize === sz
                        ? 'bg-[#141210] text-[#d4af37] border-[#141210] font-bold'
                        : 'bg-white text-[#2b2621] border-[#c5b49e]/60 hover:border-[#9b7e46]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product, selectedVariant, 1, selectedSize)}
                className="py-4 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-4 bg-[#d4af37] hover:bg-[#b8952b] text-[#141210] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Acquire Now</span>
              </button>
            </div>

            {/* Custom Design & Modification Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="py-3 px-3 bg-[#f2ece2] hover:bg-[#ebdccd] border border-[#c5b49e] text-[#141210] text-[11px] uppercase tracking-[0.12em] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[#9b7e46]" />
                <span>3D Visualizer / Specs</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openChat({
                    subject: `Customization Inquiry: ${product.name} (${product.sku})`,
                    type: 'product_modification',
                    initialMessage: `Greetings. I am interested in acquiring "${product.name}" (SKU: ${product.sku}). I would like to consult regarding custom metal options (${selectedVariant ? selectedVariant.metalType : product.metalType}), sizing (${selectedSize}), and custom engraving inscription.`,
                    productId: product.id,
                    productContext: {
                      productId: product.id,
                      productName: product.name,
                      productSlug: product.slug,
                      sku: product.sku,
                      image: product.images[0]?.url || '',
                      priceUSD: product.priceUSD,
                      selectedMetal: selectedVariant ? selectedVariant.metalType : product.metalType,
                      selectedPurity: selectedVariant ? selectedVariant.purity : product.purity,
                      selectedSize: selectedSize,
                    },
                  })
                }
                className="py-3 px-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-[11px] uppercase tracking-[0.12em] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#dfd0b5]" />
                <span>Chat with Atelier Jeweller</span>
              </button>
            </div>

            <p className="text-[11px] text-[#73685a] text-center">
              Includes GIA/IGI Gemological Dossier, Lacquered Auralic Presentation Chest & Travel Pouch.
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#ebdccd] text-xs text-[#4a4237]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9b7e46]" />
              <span>Lifetime Authenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#9b7e46]" />
              <span>Ferrari Armored Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#9b7e46]" />
              <span>30-Day Insured Return</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#9b7e46]" />
              <span>Complimentary Resizing</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS: SPECIFICATIONS, CRAFTSMANSHIP, SHIPPING, CARE */}
      <div className="pt-8 border-t border-[#ebdccd] space-y-8">
        <div className="flex border-b border-[#ebdccd] gap-6 sm:gap-12 overflow-x-auto text-xs sm:text-sm uppercase tracking-widest font-serif">
          {[
            { key: 'specs', label: 'Specifications & Hallmarks' },
            { key: 'craft', label: 'Artisanal Craftsmanship' },
            { key: 'shipping', label: 'Armored Delivery' },
            { key: 'care', label: 'Care & Maintenance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#9b7e46] text-[#141210] font-medium'
                  : 'border-transparent text-[#73685a] hover:text-[#141210]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs bg-white p-6 border border-[#c5b49e]/30">
            <div className="space-y-1">
              <span className="text-[#9b7e46] uppercase tracking-wider block">Metal Type & Purity</span>
              <p className="font-serif text-sm text-[#141210]">
                {product.purity} Solid {product.metalType}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b7e46] uppercase tracking-wider block">Gross Weight / Net Gold</span>
              <p className="font-serif text-sm text-[#141210]">
                {product.grossWeightGrams || 5.8}g Gross {product.netGoldWeightGrams ? `(${product.netGoldWeightGrams}g Pure Gold)` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b7e46] uppercase tracking-wider block">Gemstone Type</span>
              <p className="font-serif text-sm text-[#141210]">{product.stoneType || 'Natural Diamond'}</p>
            </div>
            {product.stoneWeightCarats && (
              <div className="space-y-1">
                <span className="text-[#9b7e46] uppercase tracking-wider block">Total Carat Weight</span>
                <p className="font-serif text-sm text-[#141210]">{product.stoneWeightCarats} Carats</p>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[#9b7e46] uppercase tracking-wider block">Assay Hallmark</span>
              <p className="font-serif text-sm text-[#141210]">{product.hallmarkAssayOffice || 'Paris Assay Eagle Head & Atelier Stamp'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b7e46] uppercase tracking-wider block">Gemological Certification</span>
              <p className="font-serif text-sm text-[#141210]">
                {product.certification ? `${product.certification.issuer} #${product.certification.certificateNumber}` : 'GIA / IGI Laser Inscribed Dossier'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Craftsmanship */}
        {activeTab === 'craft' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#4a4237] leading-relaxed max-w-4xl bg-white p-6 border border-[#c5b49e]/30">
            <p>{product.description}</p>
            <p>
              Hand-forged by generational artisans in our Place Vendôme atelier. Every claw and pavé bead is sculpted by hand with microscopic precision to elevate the gemstone above the metal, yielding unmatched brilliance and fire.
            </p>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#4a4237] leading-relaxed max-w-4xl bg-white p-6 border border-[#c5b49e]/30">
            <p>
              Consignments travel in unmarked, double-sealed security containers via Ferrari Group and FedEx Priority Valuables. All shipments are 100% insured from our Paris vault until personal physical signature handover at your destination.
            </p>
            <p>
              Standard transit is 2–4 business days worldwide. White-glove private concierge delivery directly to your residence or hotel suite is available at checkout.
            </p>
          </div>
        )}

        {/* Tab 4: Care */}
        {activeTab === 'care' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#4a4237] leading-relaxed max-w-4xl bg-white p-6 border border-[#c5b49e]/30">
            <p>{product.careInstructions || 'Clean gently with lukewarm water and a soft micro-bristle brush. Store individually in your Auralic velvet pouch.'}</p>
            <p>
              Maison Auralic provides complimentary lifetime ultrasonic cleaning and annual prong inspection at any of our global boutiques.
            </p>
          </div>
        )}
      </div>

      {/* CLIENT REVIEWS & VERIFIED PATRON TESTIMONIALS */}
      <div className="pt-8 border-t border-[#ebdccd] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
              Verified Patron Feedback
            </span>
            <h3 className="font-serif text-2xl text-[#141210] uppercase">
              Acquisition Reviews ({reviews.length})
            </h3>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-[#f2ece2] p-6 border border-[#ebdccd] max-w-xl space-y-4"
          >
            <h4 className="font-serif text-lg text-[#141210]">Record Your Patron Review</h4>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setReviewRating(st)}
                    className="p-1 text-[#9b7e46]"
                  >
                    <Star
                      className={`w-6 h-6 ${st <= reviewRating ? 'fill-[#9b7e46]' : 'text-[#c5b49e]'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="product-review-name-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Your Name
              </label>
              <input
                id="product-review-name-input"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Lady Montgomery"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="product-review-headline-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Review Headline
              </label>
              <input
                id="product-review-headline-input"
                name="headline"
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Unrivaled fire and elegance..."
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="product-review-comment-textarea" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Detailed Feedback
              </label>
              <textarea
                id="product-review-comment-textarea"
                name="comment"
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe the craftsmanship, brilliance, and delivery experience..."
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-[#73685a] italic">
              Be the first patron to record an acquisition review for this creation.
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 border border-[#c5b49e]/30 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex text-[#9b7e46]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#9b7e46]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#73685a] uppercase font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h5 className="font-serif text-sm text-[#141210] font-medium">{rev.title}</h5>
                <p className="text-xs text-[#73685a] leading-relaxed">{rev.comment}</p>
                <div className="pt-2 border-t border-[#ebdccd] flex justify-between text-[10px] text-[#4a4237]">
                  <span>
                    <strong>{rev.userName}</strong> ({rev.userCountry})
                  </span>
                  {rev.isVerifiedBuyer && (
                    <span className="text-[#9b7e46] font-medium">✓ Verified Acquisition</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RELATED RECOMMENDED PIECES */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#ebdccd] space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
              Complementary Pairings
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#141210] uppercase">
              You May Also Admire
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Custom Design & Modification Modal */}
      <CustomDesignModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialProduct={product}
        initialTab="modify"
      />
    </div>
  );
}
