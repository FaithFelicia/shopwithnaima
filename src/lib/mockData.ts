export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  colors: {name: string;hex: string;}[];
  stock: number;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  brand: string;
  tags: string[];
}

export const PRODUCTS: Product[] = [
// BAGS
{
  id: 'bg-001',
  name: 'Mini Shoulder Bag',
  category: 'bags',
  subcategory: 'shoulder bags',
  price: 9500,
  discountPrice: 7600,
  images: [
  '/assets/images/2450-1789558835761.jpeg',
  '/assets/images/2600-1789558835861.jpeg'],

  sizes: ['One Size'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }, { name: 'Tan', hex: '#C4A882' }, { name: 'White', hex: '#FAFAF8' }],
  stock: 20,
  featured: true,
  isNew: true,
  isBestSeller: true,
  rating: 4.9,
  reviewCount: 234,
  description: 'Compact leather shoulder bag with gold-tone hardware and adjustable strap. The perfect everyday companion.',
  brand: 'NAIMA',
  tags: ['shoulder bag', 'leather', 'mini']
},
{
  id: 'bg-002',
  name: 'Structured Tote',
  category: 'bags',
  subcategory: 'handbags',
  price: 1000,
  images: [
  '/assets/images/2300-1789558835759.jpeg',
  '/assets/images/1000-1789558746670.jpeg'],

  sizes: ['One Size'],
  colors: [{ name: 'Camel', hex: '#C9975C' }, { name: 'Black', hex: '#0A0A0A' }],
  stock: 12,
  featured: true,
  isNew: false,
  isBestSeller: false,
  rating: 4.7,
  reviewCount: 88,
  description: 'Structured leather tote with suede interior. Spacious enough for work, stylish enough for weekends.',
  brand: 'NAIMA',
  tags: ['tote', 'leather', 'work']
},
{
  id: 'bg-003',
  name: 'Crossbody Chain Bag',
  category: 'bags',
  subcategory: 'crossbody',
  price: 6800,
  images: [
  '/assets/images/3000-1789558835841.jpeg',
  '/assets/images/2450-1789558835761.jpeg'],

  sizes: ['One Size'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }, { name: 'Silver', hex: '#C0C0C0' }],
  stock: 35,
  featured: false,
  isNew: true,
  isBestSeller: true,
  rating: 4.6,
  reviewCount: 156,
  description: 'Quilted crossbody with chain strap and magnetic closure. Compact yet holds all your essentials.',
  brand: 'NAIMA',
  tags: ['crossbody', 'chain', 'evening']
},
{
  id: 'bg-004',
  name: 'Classic Handbag',
  category: 'bags',
  subcategory: 'handbags',
  price: 2400,
  images: ['/assets/images/2550-1789559077716.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }],
  stock: 25,
  featured: true,
  isNew: true,
  isBestSeller: false,
  rating: 4.7,
  reviewCount: 12,
  description: 'Stylish everyday handbag with clean lines and durable finish. A must-have for any wardrobe.',
  brand: 'NAIMA',
  tags: ['handbag', 'everyday', 'classic']
},
{
  id: 'bg-005',
  name: 'Chic Shoulder Bag',
  category: 'bags',
  subcategory: 'shoulder bags',
  price: 2200,
  images: ['/assets/images/2200-1789559219120.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Brown', hex: '#8B6347' }],
  stock: 20,
  featured: false,
  isNew: true,
  isBestSeller: false,
  rating: 4.6,
  reviewCount: 8,
  description: 'Elegant shoulder bag with adjustable strap and spacious interior. Perfect for day-to-night styling.',
  brand: 'NAIMA',
  tags: ['shoulder bag', 'chic', 'everyday']
},
{
  id: 'bg-006',
  name: 'Compact Tote Bag',
  category: 'bags',
  subcategory: 'handbags',
  price: 2100,
  images: ['/assets/images/2100-1789559233986.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Beige', hex: '#D4C5A9' }],
  stock: 30,
  featured: false,
  isNew: true,
  isBestSeller: false,
  rating: 4.5,
  reviewCount: 6,
  description: 'Compact tote with structured base and clean silhouette. Versatile enough for work or weekend.',
  brand: 'NAIMA',
  tags: ['tote', 'compact', 'versatile']
},
{
  id: 'bg-007',
  name: 'Premium Bucket Bag',
  category: 'bags',
  subcategory: 'shoulder bags',
  price: 2550,
  images: ['/assets/images/2550-1789559247451.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Tan', hex: '#C4A882' }],
  stock: 18,
  featured: true,
  isNew: true,
  isBestSeller: false,
  rating: 4.8,
  reviewCount: 10,
  description: 'Drawstring bucket bag with premium finish and gold-tone hardware. Effortlessly stylish.',
  brand: 'NAIMA',
  tags: ['bucket bag', 'premium', 'drawstring']
},
{
  id: 'bg-008',
  name: 'Mini Crossbody Bag',
  category: 'bags',
  subcategory: 'crossbody',
  price: 2000,
  images: ['/assets/images/2001-1789559258994.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }],
  stock: 22,
  featured: false,
  isNew: true,
  isBestSeller: false,
  rating: 4.5,
  reviewCount: 5,
  description: 'Sleek mini crossbody bag with secure zip closure and detachable strap. Ideal for essentials on the go.',
  brand: 'NAIMA',
  tags: ['crossbody', 'mini', 'compact']
},
{
  id: 'bg-009',
  name: 'Naima Signature Bag',
  category: 'bags',
  subcategory: 'handbags',
  price: 2500,
  images: ['/assets/images/2500-1789559822027.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }],
  stock: 20,
  featured: true,
  isNew: true,
  isBestSeller: false,
  rating: 4.8,
  reviewCount: 4,
  description: 'The Naima Signature Bag — a statement piece with clean lines and premium finish. Elevate your everyday look.',
  brand: 'NAIMA',
  tags: ['handbag', 'signature', 'premium']
},
{
  id: 'bg-010',
  name: 'Luxury Statement Bag',
  category: 'bags',
  subcategory: 'handbags',
  price: 3500,
  images: ['/assets/images/3500-1789559846475.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Brown', hex: '#8B6347' }],
  stock: 15,
  featured: true,
  isNew: true,
  isBestSeller: true,
  rating: 4.9,
  reviewCount: 3,
  description: 'Our most luxurious bag yet. Crafted with premium materials and exquisite detailing for the fashion-forward woman.',
  brand: 'NAIMA',
  tags: ['handbag', 'luxury', 'statement']
},
{
  id: 'bg-011',
  name: 'Everyday Tote',
  category: 'bags',
  subcategory: 'handbags',
  price: 2000,
  images: ['/assets/images/2000-1789559859081.jpeg'],
  sizes: ['One Size'],
  colors: [{ name: 'Beige', hex: '#D4C5A9' }],
  stock: 25,
  featured: false,
  isNew: true,
  isBestSeller: false,
  rating: 4.6,
  reviewCount: 2,
  description: 'A versatile everyday tote with spacious interior and durable construction. Your perfect daily companion.',
  brand: 'NAIMA',
  tags: ['tote', 'everyday', 'versatile']
},
// ACCESSORIES
{
  id: 'ac-004',
  name: 'Leather Belt',
  category: 'accessories',
  subcategory: 'belts',
  price: 2800,
  images: [
  '/assets/images/2300-1789558835759.jpeg',
  '/assets/images/1000-1789558746670.jpeg'],

  sizes: ['S/M', 'L/XL'],
  colors: [{ name: 'Black', hex: '#0A0A0A' }, { name: 'Tan', hex: '#C4A882' }],
  stock: 48,
  featured: false,
  isNew: false,
  isBestSeller: true,
  rating: 4.5,
  reviewCount: 143,
  description: 'Full-grain leather belt with matte-black buckle. A wardrobe staple that outlasts trends.',
  brand: 'NAIMA',
  tags: ['belt', 'leather', 'essential']
}];


export const CATEGORIES = [
{
  id: 'shoes',
  name: 'Shoes',
  image: '/assets/images/1000-1789558746670.jpeg',
  count: 24,
  href: '/shop'
},
{
  id: 'clothing',
  name: 'Clothing',
  image: '/assets/images/2300-1789558835759.jpeg',
  count: 48,
  href: '/shop'
},
{
  id: 'bags',
  name: 'Bags',
  image: '/assets/images/3000-1789558835841.jpeg',
  count: 18,
  href: '/shop'
},
{
  id: 'accessories',
  name: 'Accessories',
  image: '/assets/images/2600-1789558835861.jpeg',
  count: 32,
  href: '/shop'
}];


export const REVIEWS = [
{
  id: 'r1',
  name: 'Amina Ochieng',
  location: 'Nairobi',
  rating: 5,
  date: '2 weeks ago',
  text: 'The quality is absolutely incredible. My Mini Shoulder Bag arrived in two days and the packaging was so premium. I\'ve gotten so many compliments!',
  product: 'Mini Shoulder Bag',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19acd6d4c-1784018815580.png"
},
{
  id: 'r2',
  name: 'Wanjiru Muthoni',
  location: 'Westlands',
  rating: 5,
  date: '1 month ago',
  text: 'Shop With Naima is my go-to for everything fashion. The Naima Signature Bag is so beautiful and the quality is perfect. Already ordered two more styles!',
  product: 'Naima Signature Bag',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb9d2bd5-1772275824517.png"
},
{
  id: 'r3',
  name: 'Fatuma Hassan',
  location: 'Mombasa',
  rating: 5,
  date: '3 weeks ago',
  text: 'The Mini Shoulder Bag is everything. Genuine leather, beautiful gold hardware. Delivery to Mombasa was fast and the bag was wrapped so carefully.',
  product: 'Mini Shoulder Bag',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_48fee4323-1789557663617.png"
}];


export const KENYAN_COUNTIES = [
'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Garissa',
'Malindi', 'Kitale', 'Embu', 'Kericho', 'Bungoma', 'Kilifi',
'Lamu', 'Mandera', 'Marsabit', 'Isiolo', 'Migori', 'Homa Bay',
'Siaya', 'Vihiga', 'Busia', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
'Nandi', 'Baringo', 'Laikipia', 'Samburu', 'West Pokot', 'Turkana',
'Bomet', 'Narok', 'Kajiado', 'Makueni', 'Kitui', 'Tana River',
'Kwale', 'Taita Taveta', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Nyamira'];
