"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = void 0;
exports.ThemeProvider = ThemeProvider;
const react_1 = require("react");
const initialState = {
    theme: "system",
    setTheme: () => null,
};
const ThemeProviderContext = (0, react_1.createContext)(initialState);
function ThemeProvider({ children, defaultTheme = "system", storageKey = "nexus-ui-theme", ...props }) {
    const [theme, setTheme] = (0, react_1.useState)(() => localStorage.getItem(storageKey) || defaultTheme);
    (0, react_1.useEffect)(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    }, [theme]);
    const value = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };
    return (<ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>);
}
const useTheme = () => {
    const context = (0, react_1.useContext)(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
exports.useTheme = useTheme;
