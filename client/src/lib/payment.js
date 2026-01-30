"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRazorpay = void 0;
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};
exports.loadRazorpay = loadRazorpay;
