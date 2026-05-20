import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { useI18n, formatBDT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { discountPercent, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const disc = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const imgRef = useRef<HTMLImageElement>(null);
  const startY = useRef(0);

  const zoomIn = () => { if (imgRef.current) imgRef.current.style.transform = 'scale(1.05)'; };
  const zoomOut = () => { if (imgRef.current) imgRef.current.style.transform = ''; };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    zoomIn();
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientY - startY.current) > 8) zoomOut();
  };
  const onTouchEnd = () => setTimeout(zoomOut, 250);

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden border border-transparent hover:border-primary/20 hover:shadow-(--shadow-hover) transition-all duration-300"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={zoomOut}
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block relative aspect-square bg-secondary overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name[lang]}
          loading="lazy"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
          ref={imgRef}
          className="w-full h-full object-cover transition-transform duration-300 select-none pointer-events-none group-hover:scale-105"
        />
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded">
            -{disc}%
          </span>
        )}
        {product.tags?.includes("new") && (
          <span className="absolute top-2 right-2 bg-success text-success-foreground text-[11px] font-bold px-2 py-0.5 rounded">
            {t("badge.new")}
          </span>
        )}
      </Link>
      <div className="p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition">
            {product.name[lang]}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-primary font-bold text-base">{formatBDT(product.price, lang)}</span>
          {product.retailPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatBDT(product.retailPrice, lang)}</span>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-foreground font-medium">{product.rating}</span>
            <span>({product.reviewCount})</span>
          </span>
          {outOfStock ? (
            <span className="text-destructive">{t("stock.out")}</span>
          ) : product.stock < 10 ? (
            <span className="text-amber-600">{t("stock.low", { n: product.stock })}</span>
          ) : null}
        </div>

        <button
          disabled={outOfStock}
          onClick={() => add(product.id, 1)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          {t("card.add")}
        </button>
      </div>
    </div>
  );
}
