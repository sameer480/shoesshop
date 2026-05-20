/* ------------------------------------------------------------------
   Shoe catalogue — 60 Men Casual, 60 Women, 60 Kids (180 total)
   Image pool restricted to verified shoe-only product shots.
   ------------------------------------------------------------------ */

// Verified shoe-only Unsplash photo IDs (no models / clothing in frame)
const menImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
];

const womenImages = [
  "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
];

const kidsImages = [
  "https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
];

// Fallback used by <ShoeCard> if an image fails to load
export const FALLBACK_SHOE_IMG =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";

const menModels = [
  "Classic Runner", "Urban Edge", "Trail Pro", "Heritage Low", "Street Cruz",
  "Court Premium", "Vintage Sport", "Drift Lite", "Flex Walk", "Bolt Trainer",
  "Apex Casual", "Nova Slip-On", "Range Loafer", "Atlas Sneaker", "Pulse Mid",
  "Rover Walk", "Zenith Court", "Echo Runner", "Ridge Trail", "Crest Casual",
  "Forge Lite", "Helix Street", "Iron Walk", "Jet Runner", "Kai Casual",
  "Lynx Pro", "Mason Mid", "Noble Low", "Orbit Glide", "Phantom Step",
];

const menBrands = [
  "Nike", "Adidas", "Puma", "Reebok", "New Balance",
  "Vans", "Converse", "Skechers", "Asics", "Fila",
];

const womenModels = [
  "Glide Air", "Bloom Casual", "Aura Slip-On", "Velvet Walk", "Stride Lite",
  "Grace Sneaker", "Luxe Court", "Bliss Runner", "Charm Low", "Dream Step",
  "Mist Lite", "Pearl Slip", "Rose Court", "Sparkle Mid", "Petal Walk",
  "Lily Casual", "Iris Runner", "Daisy Sport", "Sky Glide", "Coral Lite",
  "Honey Slip", "Sage Sneaker", "Ruby Court", "Topaz Mid", "Opal Walk",
  "Jade Glide", "Amber Step", "Violet Lite", "Ivory Court", "Lotus Slip",
];

const womenBrands = [
  "Nike", "Adidas", "Puma", "Reebok", "New Balance",
  "Steve Madden", "Aldo", "Skechers", "Asics", "Fila",
];

const kidsModels = [
  "Mini Runner", "Spark Hop", "Buzz Splash", "Magic Roar", "Star Jump",
  "Glow Bounce", "Hero Step", "Rainbow Walk", "Lightning Slip", "Bubble Lite",
  "Rocket Casual", "Dino Velcro", "Unicorn Glide", "Pixel Sneaker", "Pop Sport",
  "Splash Mid", "Doodle Slip", "Galaxy Lite", "Comet Court", "Storm Walk",
  "Sunny Hop", "Cloud Bounce", "Junior Pro", "Tiny Trail", "Zoom Step",
  "Wonder Slip", "Cosmic Lite", "Tiger Walk", "Bunny Bounce", "Hopper Mid",
];

const kidsBrands = [
  "Skechers Kids", "Nike Kids", "Adidas Kids", "Puma Kids", "Crocs",
  "Disney", "Bata Bubblegummers", "Liberty Force 10", "Reebok Kids", "Fila Kids",
];

const colorPalettes = [
  ["Black", "White"],
  ["Navy", "Gray"],
  ["Olive", "Beige"],
  ["Red", "Black"],
  ["Blue", "White"],
  ["Charcoal", "Mint"],
  ["Brown", "Tan"],
  ["Pink", "White"],
  ["Yellow", "Black"],
  ["Green", "Cream"],
];

export const SIZES_ADULT = [6, 7, 8, 9, 10, 11, 12];
export const SIZES_KIDS = [1, 2, 3, 4, 5, 6, 7];

// Deterministically pick which sizes are in stock for a given shoe
const availableSizes = (allSizes, seed) =>
  allSizes.filter((_, idx) => ((seed * 31 + idx * 17) % 5) !== 0);

const PER_CATEGORY = 60;

const price = (i, lo, hi) => Math.round((lo + ((i * 73) % (hi - lo))) / 10) * 10 - 1;
const rating = (i) => +(3.8 + ((i * 13) % 12) / 10).toFixed(1);

const buildColorImages = (imagePool, colors, offset) => {
  const map = {};
  colors.forEach((c, idx) => {
    map[c] = imagePool[(offset + idx) % imagePool.length];
  });
  return map;
};

const makeMenCasual = () =>
  Array.from({ length: PER_CATEGORY }, (_, i) => {
    const colors = colorPalettes[i % colorPalettes.length];
    return {
      id: `m${i + 1}`,
      name: `${menBrands[i % menBrands.length]} ${menModels[i % menModels.length]}`,
      category: "men",
      type: "Casual",
      brand: menBrands[i % menBrands.length],
      price: price(i, 1499, 5999),
      image: menImages[i % menImages.length],
      colorImages: buildColorImages(menImages, colors, i),
      colors,
      sizes: SIZES_ADULT,
      availableSizes: availableSizes(SIZES_ADULT, i + 1),
      rating: rating(i),
    };
  });

const makeWomen = () =>
  Array.from({ length: PER_CATEGORY }, (_, i) => {
    const colors = colorPalettes[(i + 3) % colorPalettes.length];
    return {
      id: `w${i + 1}`,
      name: `${womenBrands[i % womenBrands.length]} ${womenModels[i % womenModels.length]}`,
      category: "women",
      type: i % 3 === 0 ? "Sneakers" : i % 3 === 1 ? "Casual" : "Slip-On",
      brand: womenBrands[i % womenBrands.length],
      price: price(i, 1799, 6499),
      image: womenImages[i % womenImages.length],
      colorImages: buildColorImages(womenImages, colors, i + 2),
      colors,
      sizes: SIZES_ADULT,
      availableSizes: availableSizes(SIZES_ADULT, i + 1),
      rating: rating(i + 2),
    };
  });

const makeKids = () =>
  Array.from({ length: PER_CATEGORY }, (_, i) => {
    const colors = colorPalettes[(i + 6) % colorPalettes.length];
    return {
      id: `k${i + 1}`,
      name: `${kidsBrands[i % kidsBrands.length]} ${kidsModels[i % kidsModels.length]}`,
      category: "kids",
      type: i % 3 === 0 ? "Velcro" : i % 3 === 1 ? "Sports" : "Slip-On",
      brand: kidsBrands[i % kidsBrands.length],
      price: price(i, 799, 3499),
      image: kidsImages[i % kidsImages.length],
      colorImages: buildColorImages(kidsImages, colors, i + 4),
      colors,
      sizes: SIZES_KIDS,
      availableSizes: availableSizes(SIZES_KIDS, i + 11),
      rating: rating(i + 5),
    };
  });

export const menShoes = makeMenCasual();
export const womenShoes = makeWomen();
export const kidsShoes = makeKids();

export const allShoes = [...menShoes, ...womenShoes, ...kidsShoes];
