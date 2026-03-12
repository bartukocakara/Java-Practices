'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  categories: Category[];
  selectedCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  onCategoryChange: (id: number | null) => void;
  onMinPriceChange: (val: number | null) => void;
  onMaxPriceChange: (val: number | null) => void;
  onClear: () => void;
}

export function ProductFilters({
  categories,
  selectedCategoryId,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: Props) {
  const [minInput, setMinInput] = useState(minPrice?.toString() ?? '');
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() ?? '');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => { setMinInput(minPrice?.toString() ?? ''); }, [minPrice]);
  useEffect(() => { setMaxInput(maxPrice?.toString() ?? ''); }, [maxPrice]);

  const rootCategories = categories.filter(c => c.parentId === null);
  const getChildren    = (parentId: number) => categories.filter(c => c.parentId === parentId);

  const toggleExpand = (id: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const applyPrice = () => {
    onMinPriceChange(minInput ? Number(minInput) : null);
    onMaxPriceChange(maxInput ? Number(maxInput) : null);
  };

  const renderCategory = (cat: Category, depth = 0) => {
    const children   = getChildren(cat.id);
    const isExpanded = expandedCategories.has(cat.id);
    const isSelected = selectedCategoryId === cat.id;

    return (
      <div key={cat.id}>
        <div
          className={cn(
            'flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent',
            isSelected && 'bg-accent text-primary font-medium',
            depth > 0 && 'ml-4'
          )}
        >
          <span
            className="flex-1"
            onClick={() => onCategoryChange(isSelected ? null : cat.id)}
          >
            {cat.name}
          </span>
          {children.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(cat.id); }}
              className="p-0.5 hover:bg-accent-foreground/10 rounded"
            >
              {isExpanded
                ? <ChevronDown className="h-3 w-3" />
                : <ChevronRight className="h-3 w-3" />
              }
            </button>
          )}
        </div>
        {isExpanded && children.map(child => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Categories</h3>
          {selectedCategoryId && (
            <button
              onClick={() => onCategoryChange(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-0.5 pr-3">
            <div
              className={cn(
                'rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent',
                !selectedCategoryId && 'bg-accent font-medium'
              )}
              onClick={() => onCategoryChange(null)}
            >
              All Categories
            </div>
            {rootCategories.map(cat => renderCategory(cat))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                className="h-8 text-sm mt-1"
                min={0}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max ($)</Label>
              <Input
                type="number"
                placeholder="Any"
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                className="h-8 text-sm mt-1"
                min={0}
              />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={applyPrice}>
            Apply
          </Button>
        </div>
      </div>

      <Separator />

      {/* Clear All */}
      <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
        Clear All Filters
      </Button>
    </div>
  );
}