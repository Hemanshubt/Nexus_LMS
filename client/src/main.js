"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_tsx_1 = __importDefault(require("./App.tsx"));
require("./index.css");
const theme_provider_tsx_1 = require("./components/theme-provider.tsx");
client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
        <theme_provider_tsx_1.ThemeProvider defaultTheme="dark" storageKey="nexus-theme">
            <App_tsx_1.default />
        </theme_provider_tsx_1.ThemeProvider>
    </react_1.default.StrictMode>);
