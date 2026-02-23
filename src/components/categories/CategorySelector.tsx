import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, X, Tag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/api";
import type { Category } from "@/types/database.types";

interface CategorySelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    maxSelection?: number;
    label?: string;
    description?: string;
    compact?: boolean;
}

const CategorySelector = ({
    selectedIds,
    onChange,
    maxSelection = 5,
    label = "Select Categories",
    description,
    compact = false,
}: CategorySelectorProps) => {
    const [search, setSearch] = useState("");

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(true),
        staleTime: 5 * 60 * 1000, // Categories don't change often
    });

    const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((s) => s !== id));
        } else if (selectedIds.length < maxSelection) {
            onChange([...selectedIds, id]);
        }
    };

    const remove = (id: string) => {
        onChange(selectedIds.filter((s) => s !== id));
    };

    const selectedCategories = categories.filter((c) =>
        selectedIds.includes(c.id)
    );

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading categories...</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            {!compact && (
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">{label}</label>
                        <span className="text-xs text-muted-foreground">
                            {selectedIds.length}/{maxSelection} selected
                        </span>
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* Selected tags */}
            <AnimatePresence>
                {selectedCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {selectedCategories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                            >
                                <Badge
                                    className="bg-coral/10 text-coral border-coral/20 hover:bg-coral/20 cursor-pointer pr-1.5 gap-1"
                                    onClick={() => remove(cat.id)}
                                >
                                    <Tag className="w-3 h-3" />
                                    {cat.name}
                                    <X className="w-3 h-3 ml-0.5" />
                                </Badge>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                />
            </div>

            {/* Category grid */}
            <div
                className={`grid gap-2 max-h-[280px] overflow-y-auto pr-1 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
                    }`}
            >
                {filtered.map((cat, index) => {
                    const isSelected = selectedIds.includes(cat.id);
                    const isDisabled = !isSelected && selectedIds.length >= maxSelection;

                    return (
                        <motion.button
                            key={cat.id}
                            type="button"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => !isDisabled && toggle(cat.id)}
                            disabled={isDisabled}
                            className={`
                relative flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm
                transition-all duration-200 group
                ${isSelected
                                    ? "border-coral bg-coral/5 text-coral font-medium shadow-sm"
                                    : isDisabled
                                        ? "border-border/50 bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                                        : "border-border hover:border-coral/40 hover:bg-coral/5 cursor-pointer"
                                }
              `}
                        >
                            {/* Checkbox indicator */}
                            <div
                                className={`
                  w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors
                  ${isSelected
                                        ? "bg-coral text-white"
                                        : "border border-border group-hover:border-coral/40"
                                    }
                `}
                            >
                                {isSelected && <Check className="w-3 h-3" />}
                            </div>

                            <span className="truncate">{cat.name}</span>
                        </motion.button>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                    No categories match "{search}"
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
