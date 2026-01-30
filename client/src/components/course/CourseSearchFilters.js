"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const defaultFilters = {
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
const CourseSearchFilters = ({ onSearch, categories = [] }) => {
    const [filters, setFilters] = (0, react_1.useState)(defaultFilters);
    const [showAdvanced, setShowAdvanced] = (0, react_1.useState)(false);
    const [searchInput, setSearchInput] = (0, react_1.useState)('');
    // Debounced search
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                const newFilters = { ...filters, search: searchInput };
                setFilters(newFilters);
                onSearch(newFilters);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);
    const handleFilterChange = (key, value) => {
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
    return (<div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input_1.Input type="text" placeholder="Search courses..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10 h-11"/>
                    {searchInput && (<button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <lucide_react_1.X className="h-4 w-4"/>
                        </button>)}
                </div>
                <button_1.Button variant={showAdvanced ? 'secondary' : 'outline'} onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2 relative">
                    <lucide_react_1.SlidersHorizontal className="h-4 w-4"/>
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (<badge_1.Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {activeFiltersCount}
                        </badge_1.Badge>)}
                </button_1.Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select_1.Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                            <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="All Categories"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                                <select_1.SelectItem value="All">All Categories</select_1.SelectItem>
                                {categories.map((cat) => (<select_1.SelectItem key={cat} value={cat}>
                                        {cat}
                                    </select_1.SelectItem>))}
                            </select_1.SelectContent>
                        </select_1.Select>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <select_1.Select value={filters.sort} onValueChange={(v) => handleFilterChange('sort', v)}>
                            <select_1.SelectTrigger>
                                <select_1.SelectValue />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                                {sortOptions.map((opt) => (<select_1.SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </select_1.SelectItem>))}
                            </select_1.SelectContent>
                        </select_1.Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price Range</label>
                        <div className="flex gap-2">
                            <input_1.Input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full" disabled={filters.free}/>
                            <input_1.Input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full" disabled={filters.free}/>
                        </div>
                    </div>

                    {/* Free Only */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Options</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={filters.free} onChange={(e) => handleFilterChange('free', e.target.checked)} className="rounded border-gray-300"/>
                                <span className="text-sm">Free only</span>
                            </label>
                            <button_1.Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                                Reset
                            </button_1.Button>
                        </div>
                    </div>
                </div>)}

            {/* Active Filters Tags */}
            {(filters.search || activeFiltersCount > 0) && (<div className="flex flex-wrap gap-2">
                    {filters.search && (<badge_1.Badge variant="secondary" className="gap-1">
                            Search: "{filters.search}"
                            <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => {
                    setSearchInput('');
                    handleFilterChange('search', '');
                }}/>
                        </badge_1.Badge>)}
                    {filters.category !== 'All' && (<badge_1.Badge variant="secondary" className="gap-1">
                            {filters.category}
                            <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('category', 'All')}/>
                        </badge_1.Badge>)}
                    {filters.free && (<badge_1.Badge variant="secondary" className="gap-1">
                            Free
                            <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('free', false)}/>
                        </badge_1.Badge>)}
                </div>)}
        </div>);
};
exports.default = CourseSearchFilters;
