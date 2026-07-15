const PRODUCTS = [
  {
    id: "kashmiri-pure-saffron",
    name: "Kashmiri Pure Saffron (Mongra Grade A+)",
    category: "saffron",
    image: "assets/saffron.png",
    tagline: "100% Pure Saffron Threads from Kashmir",
    shortDescription: "Known for its rich aroma, deep crimson color, and premium quality — packed with antioxidants that support mood, heart health, skin glow, and overall well-being.",
    description: `Our Kashmiri Saffron (Mongra Grade A+) is sourced directly from the fields of Pampore and Pulwama, J&K. Harvested entirely by hand, it represents the finest crimson threads of Crocus sativus, stripped of yellow styles. This gives it a deep color, intense aroma, and unparalleled flavor profile. Saffron is widely praised for its medicinal and cosmetic qualities: it aids digestion, improves mood, enhances skin health, and is highly rich in antioxidants.`,
    stockStatus: "in-stock",
    stockText: "In Stock - Fresh Harvest",
    details: {
      origin: "Pampore / Pulwama, Kashmir",
      grade: "A+ Mongra (Highest Grade)",
      harvestDate: "October - November 2025",
      packaging: "Airtight Glass Vial",
      usage: "Soak 3-5 threads in warm milk or water for 15 minutes before adding to desserts, biryanis, or skincare routines."
    },
    options: [
      { weight: "1 Gram", price: 480 },
      { weight: "5 Grams", price: 2200 },
      { weight: "10 Grams", price: 4200 }
    ]
  },
  {
    id: "almond-giri-premium",
    name: "Kashmiri Almond Giri (Best Quality)",
    category: "nuts",
    image: "assets/almonds.png",
    tagline: "Sweet, Oil-Rich Kashmiri Almond Kernels",
    shortDescription: "High-quality almonds provide healthy fats, plant protein, dietary fiber, and Vitamin E in a small daily handful.",
    description: `Grown in the cold mountainous orchards of Kashmir, our Almond Giri (Mamra and local sweet varieties) is smaller, more concentrated, and far richer in natural oils than bulk-imported California almonds. Every nut is hand-cracked to preserve its natural shape and high nutritional values. Rich in Vitamin E, magnesium, and dietary fiber, these almonds are excellent for brain development, heart health, and maintaining cholesterol levels.`,
    stockStatus: "in-stock",
    stockText: "In Stock - Raw & Unsalted",
    details: {
      origin: "Pulwama Orchards, Kashmir",
      grade: "Selected Sweet Giri",
      harvestDate: "September 2025",
      packaging: "Food-grade Resealable Pouch (Vacuum-packed)",
      usage: "Soak 5-10 almonds overnight, peel, and eat in the morning for maximum nutrient absorption."
    },
    options: [
      { weight: "250 Grams", price: 400 },
      { weight: "500 Grams", price: 750 },
      { weight: "1 KG", price: 1450 }
    ]
  },
  {
    id: "walnut-giri-premium",
    name: "Kashmiri Walnut Giri (Premium Quality)",
    category: "nuts",
    image: "assets/walnuts.png",
    tagline: "Light-Colored, Crispy Extra-Light Halves",
    shortDescription: "Rich in omega-3 fats, antioxidants, and fiber — concentrated whole-food nutrition.",
    description: `Kashmiri Walnuts are famous worldwide for their buttery texture and premium taste. Our Walnut Giri consists of premium-selected 'Snow White' and 'Light' halves. We crack them locally and package them immediately to prevent oxidization, preserving their fresh, crispy crunch. Packed with Alpha-Linolenic Acid (plant-based omega-3), these walnuts are excellent for brain function, anti-inflammatory support, and promoting gut health.`,
    stockStatus: "low-stock",
    stockText: "Low Stock - Freshly Cracked",
    details: {
      origin: "Tahab Crossing area, Pulwama, Kashmir",
      grade: "Extra Light Halves (Premium)",
      harvestDate: "October 2025",
      packaging: "Nitrogen Flushed Airtight Pouch",
      usage: "Enjoy as a snack, add to oatmeal/salads, or bake into cakes and breads."
    },
    options: [
      { weight: "250 Grams", price: 480 },
      { weight: "500 Grams", price: 900 },
      { weight: "1 KG", price: 1750 }
    ]
  },
  {
    id: "shahi-festive-combo",
    name: "Shahi Kashmiri Festive Gift Box",
    category: "combos",
    image: "assets/gift_box.png",
    tagline: "Premium Assorted Gift Box from Pulwama",
    shortDescription: "Our special wooden gift combo containing premium Mongra saffron, high-quality almonds, and walnut kernels. Perfect for festivals and wellness gifting.",
    description: `Celebrate weddings, Eid, Diwali, or any special occasion with a taste of royal Kashmir. The Shahi Festive Gift Box features our signature dry fruits arranged in a hand-crafted wooden box. Each compartment holds a premium item representing the pure essence of Kashmir. It's not just a gift; it's a blessing of health, vitality, and purity.`,
    stockStatus: "in-stock",
    stockText: "In Stock - Gift Wrapping Available",
    details: {
      origin: "Pulwama, Kashmir",
      grade: "Assorted Premium Grade",
      harvestDate: "Handmade Pack",
      packaging: "Handcrafted Pine Wood Box with Brass Clasp",
      usage: "A wonderful health-oriented gift for relatives, friends, business partners, or wedding guests."
    },
    options: [
      { weight: "Standard Combo (1g Saffron + 250g Almonds + 250g Walnuts)", price: 1300 },
      { weight: "Premium Combo (2g Saffron + 500g Almonds + 500g Walnuts)", price: 2500 }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS;
}
