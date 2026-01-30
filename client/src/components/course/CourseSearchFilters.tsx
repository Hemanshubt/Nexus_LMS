import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
    onSearch: (filters: SearchFilters) => void;
    categories?: string[];
}

export interface SearchFilters {
    search: string;
    category: string;
    sort: string;
    minPrice: string;
    maxPrice: string;
    free: boolean;
}

const defaultFilters: SearchFilters = {
    search: '',
    category: 'All',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    free: false
};

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
];

const CourseSearchFilters = ({ onSearch, categories = [] }: SearchFiltersProps) => {
    const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                const newFilters = { ...filters, search: searchInput };
                setFilters(newFilters);
                onSearch(newFilters);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch(newFilters);
    };

    const handleReset = () => {
        setFilters(defaultFilters);
        setSearchInput('');
        onSearch(defaultFilters);
    };

    const activeFiltersCount = [
        filters.category !== 'All',
        filters.sort !== 'newest',
        filters.minPrice !== '',
        filters.maxPrice !== '',
        filters.free
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search courses..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 h-11"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant={showAdvanced ? 'secondary' : 'outline'}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2 relative"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select
                            value={filters.category}
                            onValueChange={(v) => handleFilterChange('category', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <Select
                            value={filters.sort}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price Range</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full"
                                disabled={filters.free}
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full"
                                disabled={filters.free}
                            />
                        </div>
                    </div>

                    {/* Free Only */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Options</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.free}
                                    onChange={(e) => handleFilterChange('free', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm">Free only</span>
                            </label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-muted-foreground"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Tags */}
            {(filters.search || activeFiltersCount > 0) && (
                <div className="flex flex-wrap gap-2">
                    {filters.search && (
                        <Badge variant="secondary" className="gap-1">
                            Search: "{filters.search}"
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setSearchInput('');
                                    handleFilterChange('search', '');
                                }}
                            />
                        </Badge>
                    )}
                    {filters.category !== 'All' && (
                        <Badge variant="secondary" className="gap-1">
                            {filters.category}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('category', 'All')}
                            />
                        </Badge>
                    )}
                    {filters.free && (
                        <Badge variant="secondary" className="gap-1">
                            Free
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange('free', false)}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseSearchFilters;
