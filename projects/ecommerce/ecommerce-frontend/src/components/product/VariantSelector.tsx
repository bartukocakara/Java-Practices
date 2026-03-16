'use client';

import { useState, useEffect } from 'react';
import { ProductVariantResponse } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface Props {
  variants: ProductVariantResponse[];
  onVariantSelect: (variant: ProductVariantResponse | null) => void;
}

export function VariantSelector({ variants, onVariantSelect }: Props) {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  // Get all unique attribute names in order
  const attributeNames = Array.from(
    new Set(
      variants.flatMap(v => Object.keys(v.attributes))
    )
  );

  // Get all values for a given attribute
  const getValuesForAttr = (attrName: string): string[] =>
    Array.from(new Set(variants.map(v => v.attributes[attrName]).filter(Boolean)));

  // Is this value available given current other selections?
  const isAvailable = (attrName: string, value: string): boolean => {
    const test = { ...selectedAttrs, [attrName]: value };
    return variants.some(v =>
      Object.entries(test).every(([k, val]) => v.attributes[k] === val) &&
      v.stock > 0 &&
      v.isActive
    );
  };

  // Match a variant when all attributes are selected
  const matchedVariant: ProductVariantResponse | null = (() => {
    if (Object.keys(selectedAttrs).length !== attributeNames.length) return null;
    return variants.find(v =>
      Object.entries(selectedAttrs).every(([k, val]) => v.attributes[k] === val)
    ) ?? null;
  })();

  useEffect(() => {
    onVariantSelect(matchedVariant);
  }, [matchedVariant]);

  const selectValue = (attrName: string, value: string) => {
    const isSelected = selectedAttrs[attrName] === value;
    if (isSelected) {
      const next = { ...selectedAttrs };
      delete next[attrName];
      setSelectedAttrs(next);
    } else {
      setSelectedAttrs(prev => ({ ...prev, [attrName]: value }));
    }
  };

  if (!variants.length || !attributeNames.length) return null;

  return (
    <div className="space-y-5">
      {attributeNames.map(attrName => (
        <div key={attrName}>
          {/* Attribute label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold">{attrName}</span>
            {selectedAttrs[attrName] && (
              <span className="text-sm text-muted-foreground">
                : <span className="text-foreground font-medium">{selectedAttrs[attrName]}</span>
              </span>
            )}
          </div>

          {/* Value buttons */}
          <div className="flex flex-wrap gap-2">
            {getValuesForAttr(attrName).map(value => {
              const available = isAvailable(attrName, value);
              const selected  = selectedAttrs[attrName] === value;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  onClick={() => selectValue(attrName, value)}
                  className={cn(
                    'relative min-w-[3rem] px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-150',
                    // Selected
                    selected && 'border-primary bg-primary text-primary-foreground shadow-md scale-105',
                    // Available but not selected
                    !selected && available && 'border-border bg-card hover:border-primary/60 hover:bg-primary/5',
                    // Unavailable
                    !available && 'border-border/40 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
                  )}
                >
                  {value}
                  {/* Strike-through for out of stock */}
                  {!available && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="absolute w-full h-px bg-muted-foreground/50 rotate-45 scale-x-110" />
                    </span>
                  )}
                  {/* Check mark for selected */}
                  {selected && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected variant summary */}
      {matchedVariant ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Selected variant</p>
            <p className="text-sm font-semibold mt-0.5">{matchedVariant.displayLabel}</p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              SKU: {matchedVariant.sku}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">
              ${matchedVariant.price.toFixed(2)}
            </p>
            <Badge
              variant={matchedVariant.stock === 0 ? 'destructive' : 'secondary'}
              className="text-xs mt-1"
            >
              {matchedVariant.stock === 0
                ? 'Out of stock'
                : matchedVariant.stock <= 5
                  ? `Only ${matchedVariant.stock} left`
                  : `${matchedVariant.stock} in stock`
              }
            </Badge>
          </div>
        </div>
      ) : (
        /* Prompt */
        <div className="p-3 rounded-xl bg-muted/50 border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            {Object.keys(selectedAttrs).length === 0
              ? `Select ${attributeNames.join(' and ')} to continue`
              : `Also select ${attributeNames.filter(a => !selectedAttrs[a]).join(' and ')}`
            }
          </p>
        </div>
      )}
    </div>
  );
}