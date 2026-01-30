"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const theme_provider_1 = require("@/components/theme-provider");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function ThemeToggle() {
    const { setTheme } = (0, theme_provider_1.useTheme)();
    return (<dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border border-border/40">
                    <lucide_react_1.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                    <lucide_react_1.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                    <span className="sr-only">Toggle theme</span>
                </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="z-[100]">
                <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
}
