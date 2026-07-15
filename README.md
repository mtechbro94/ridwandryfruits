# Ridwan DryFruits — Premium Kashmiri Dry Fruits & Saffron

Welcome to the official repository for the **Ridwan DryFruits** e-commerce website. This is a warm, premium, and fully responsive online storefront designed to sell organic Kashmiri dry fruits and pure Pampore saffron directly to customers across India.

🌐 **Live Website:** [https://ridwandryfruits.netlify.app](https://ridwandryfruits.netlify.app)

---

## 🌟 Core Features

- **Responsive Mobile-First Design:** Optimized for smooth browsing on small screens and slow networks (critical for mobile data in J&K/India).
- **Persistent Shopping Cart:** Powered by `localStorage` so items remain in the cart even if the customer refreshes the page. Supports composite keys (e.g. tracking Saffron 1g vs Saffron 5g as separate items).
- **Interactive Product Modal:** Clicking any product slides open a specs panel showing origin, grade, harvest details, recommended usage, size options, and real-time price updates.
- **Interactive Beaker Purity Tester:** An educational widget on the Saffron Purity page simulating the water test (pure saffron floats and slowly turns water golden-yellow, while dyed saffron sinks and bleeds red instantly).
- **Multi-Option Checkout Gateway:**
  - **WhatsApp Order Builder:** Prefills shipping information and cart tables into a pre-formatted WhatsApp message for manual D2C settlement.
  - **Razorpay Sandbox Simulator:** Provides payment gateway animations (UPI, Card, Netbanking) and successful checkout sequences.
  - **Cash on Delivery (COD):** Fast processing page that registers shipping details.
- **Asynchronous Order Logging:** Connects directly to Google Sheets to log customer orders in the background with zero loading delay.

---

## 📂 Project Structure

```bash
Ridwans_DryFruits/
├── index.html        # Core HTML5 layout, view sections, modals, and drawers
├── style.css         # Styling system (custom variables, saffron theme, glassmorphism)
├── app.js            # Router engine, cart state, order compilers, and test beaker animations
├── products.js       # Product inventory catalogue, prices, and description strings
├── netlify.toml      # Deployment headers and configuration settings for Netlify
├── README.md         # Repository documentation (this file)
└── assets/           # High-resolution product images and backgrounds
    ├── almonds.png   # Kashmiri Almond Giri
    ├── gift_box.png  # Pine-wood Gift Box
    ├── kashmir_bg.png# Kashmiri Valley backdrop
    ├── logo.jpeg     # Ridwan DryFruits Profile Photo Logo
    ├── saffron.png   # Kashmiri Pampore Saffron Mongra
    └── walnuts.png   # Premium Walnut kernels
```

---

## ⚙️ Local Development

To run the project locally on your machine:

1. Clone or download the repository.
2. Open your terminal in the repository folder and start a local HTTP server:
   ```bash
   # Python 3
   python -m http.server 3001
   ```
3. Open your browser and go to:
   👉 **[http://localhost:3001](http://localhost:3001)**

---

## 🛠️ Configuration & Database Setup

### 1. Order Log (Google Sheet)
To store orders in a spreadsheet automatically:
1. Create a blank spreadsheet on [Google Sheets](https://sheets.google.com).
2. Go to **Extensions > Apps Script**, paste the database connection script (available in `walkthrough.md`), and click **Deploy > New Deployment**.
3. Set access to **Anyone** and copy the Web App URL.
4. Open `app.js` and paste your URL into `orderLogEndpoint` in `SHOP_CONFIG` (lines 1 to 6):
   ```javascript
   orderLogEndpoint: "https://script.google.com/macros/s/.../exec"
   ```

### 2. WhatsApp Number
To change the recipient of order text messages, modify `whatsappNumber` in `app.js`:
```javascript
whatsappNumber: "919906999999" // Use country code (91) without a + symbol
```

### 3. Product Catalog (Pricing, Stock, Descriptions)
To modify prices, descriptions, and stock statuses, open `products.js` and edit the array entries. 
For example, to set Walnut Giri to out of stock, change `stockStatus` to `"out-of-stock"`.

---

## 🚀 Deployment

This site is automatically deployed to **Netlify** through GitHub. 

Every time you push changes to the `main` branch:
```bash
git add .
git commit -m "update details"
git push origin main
```
Netlify automatically detects the push, pulls the fresh code, and updates the live site at `ridwandryfruits.netlify.app` within 10 seconds.
