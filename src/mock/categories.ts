export interface AttributeOption {
  value: string
  label: string
}

export interface AttributeSchema {
  key: string
  label: string
  type: 'select' | 'text' | 'boolean'
  options?: AttributeOption[]
}

export interface MarketSubcategory {
  id: string
  name: string
  slug: string
  categoryId: string
}

export interface MarketCategory {
  id: string
  name: string
  slug: string
  icon: string
  attributes?: AttributeSchema[]
  subcategories: MarketSubcategory[]
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: 'cat_toys',
    name: 'Toys',
    slug: 'toys',
    icon: '🧸',
    subcategories: [
      { id: 'sub_dolls', name: 'Dolls', slug: 'dolls', categoryId: 'cat_toys' },
      { id: 'sub_edu_art', name: 'Educational & Art', slug: 'educational-art', categoryId: 'cat_toys' },
      { id: 'sub_rc_cars', name: 'Remote Control', slug: 'remote-control', categoryId: 'cat_toys' },
      { id: 'sub_puzzles', name: 'Puzzles & Games', slug: 'puzzles-games', categoryId: 'cat_toys' },
    ],
  },
  {
    id: 'cat_stationery',
    name: 'Stationery',
    slug: 'stationery',
    icon: '✏️',
    subcategories: [
      { id: 'sub_pens', name: 'Pens', slug: 'pens', categoryId: 'cat_stationery' },
      { id: 'sub_color_pencils', name: 'Color Pencils', slug: 'color-pencils', categoryId: 'cat_stationery' },
      { id: 'sub_calculators', name: 'Calculators', slug: 'calculators', categoryId: 'cat_stationery' },
      { id: 'sub_notebooks', name: 'Notebooks & Paper', slug: 'notebooks-paper', categoryId: 'cat_stationery' },
    ],
  },
  {
    id: 'cat_watches',
    name: 'Watches',
    slug: 'watches',
    icon: '⌚',
    attributes: [
      {
        key: 'strap_material',
        label: 'Strap Material',
        type: 'select',
        options: [
          { value: 'resin', label: 'Resin' },
          { value: 'stainless_steel', label: 'Stainless Steel' },
          { value: 'leather', label: 'Leather' },
          { value: 'silicone', label: 'Silicone' },
          { value: 'nylon', label: 'Nylon' },
        ],
      },
      {
        key: 'dial_color',
        label: 'Dial Color',
        type: 'select',
        options: [
          { value: 'black', label: 'Black' },
          { value: 'white', label: 'White' },
          { value: 'silver', label: 'Silver' },
          { value: 'gold', label: 'Gold' },
          { value: 'blue', label: 'Blue' },
        ],
      },
      {
        key: 'water_resistance',
        label: 'Water Resistance',
        type: 'select',
        options: [
          { value: 'none', label: 'Not Water Resistant' },
          { value: '30m', label: '30m / 3ATM' },
          { value: '50m', label: '50m / 5ATM' },
          { value: '100m', label: '100m / 10ATM' },
        ],
      },
    ],
    subcategories: [
      { id: 'sub_analog', name: 'Analog', slug: 'analog', categoryId: 'cat_watches' },
      { id: 'sub_digital', name: 'Digital', slug: 'digital', categoryId: 'cat_watches' },
      { id: 'sub_sports_watch', name: 'Sports', slug: 'sports', categoryId: 'cat_watches' },
    ],
  },
  {
    id: 'cat_kitchen',
    name: 'Kitchen',
    slug: 'kitchen',
    icon: '🍳',
    subcategories: [
      { id: 'sub_knives', name: 'Knives', slug: 'knives', categoryId: 'cat_kitchen' },
      { id: 'sub_spoons', name: 'Spoons & Ladles', slug: 'spoons-ladles', categoryId: 'cat_kitchen' },
      { id: 'sub_kettles', name: 'Hot Kettle', slug: 'hot-kettle', categoryId: 'cat_kitchen' },
      { id: 'sub_mixers', name: 'Cake Machine & Mixer', slug: 'cake-machine-mixer', categoryId: 'cat_kitchen' },
      { id: 'sub_kitchen_misc', name: 'Kitchen Misc', slug: 'kitchen-misc', categoryId: 'cat_kitchen' },
    ],
  },
  {
    id: 'cat_ceramics',
    name: 'Ceramics & Glass',
    slug: 'ceramics-glass',
    icon: '🏺',
    subcategories: [
      { id: 'sub_plates', name: 'Plates & Bowls', slug: 'plates-bowls', categoryId: 'cat_ceramics' },
      { id: 'sub_showpieces', name: 'Showpieces', slug: 'showpieces', categoryId: 'cat_ceramics' },
      { id: 'sub_cups', name: 'Cups & Mugs', slug: 'cups-mugs', categoryId: 'cat_ceramics' },
    ],
  },
  {
    id: 'cat_bags',
    name: 'Bags & Belts',
    slug: 'bags-belts',
    icon: '👜',
    attributes: [
      {
        key: 'color',
        label: 'Color',
        type: 'select',
        options: [
          { value: 'black', label: 'Black' },
          { value: 'brown', label: 'Brown' },
          { value: 'tan', label: 'Tan' },
          { value: 'blue', label: 'Blue' },
          { value: 'olive', label: 'Olive' },
          { value: 'red', label: 'Red' },
        ],
      },
    ],
    subcategories: [
      { id: 'sub_handbags', name: 'Handbags', slug: 'handbags', categoryId: 'cat_bags' },
      { id: 'sub_backpacks', name: 'Backpacks', slug: 'backpacks', categoryId: 'cat_bags' },
      { id: 'sub_belts', name: 'Belts', slug: 'belts', categoryId: 'cat_bags' },
      { id: 'sub_school_bags', name: 'School Bags', slug: 'school-bags', categoryId: 'cat_bags' },
    ],
  },
  {
    id: 'cat_bathroom',
    name: 'Bathroom Items',
    slug: 'bathroom-items',
    icon: '🛁',
    subcategories: [
      { id: 'sub_towels', name: 'Towels', slug: 'towels', categoryId: 'cat_bathroom' },
      { id: 'sub_bath_mats', name: 'Bath Mats', slug: 'bath-mats', categoryId: 'cat_bathroom' },
      { id: 'sub_bath_misc', name: 'Bath Accessories', slug: 'bath-accessories', categoryId: 'cat_bathroom' },
    ],
  },
  {
    id: 'cat_shoes',
    name: 'Shoes & Shoe Brush',
    slug: 'shoes-shoe-brush',
    icon: '👟',
    attributes: [
      {
        key: 'size',
        label: 'Size (EU)',
        type: 'select',
        options: [
          { value: '36', label: '36' }, { value: '37', label: '37' }, { value: '38', label: '38' },
          { value: '39', label: '39' }, { value: '40', label: '40' }, { value: '41', label: '41' },
          { value: '42', label: '42' }, { value: '43', label: '43' }, { value: '44', label: '44' },
        ],
      },
    ],
    subcategories: [
      { id: 'sub_mens_shoes', name: "Men's Shoes", slug: 'mens-shoes', categoryId: 'cat_shoes' },
      { id: 'sub_womens_shoes', name: "Women's Shoes", slug: 'womens-shoes', categoryId: 'cat_shoes' },
      { id: 'sub_kids_shoes', name: "Kids' Shoes", slug: 'kids-shoes', categoryId: 'cat_shoes' },
      { id: 'sub_shoe_care', name: 'Shoe Care', slug: 'shoe-care', categoryId: 'cat_shoes' },
    ],
  },
  {
    id: 'cat_wedding',
    name: 'Wedding Items',
    slug: 'wedding-items',
    icon: '💍',
    subcategories: [
      { id: 'sub_wedding_decor', name: 'Decoration', slug: 'decoration', categoryId: 'cat_wedding' },
      { id: 'sub_wedding_gifts', name: 'Gift Sets', slug: 'gift-sets', categoryId: 'cat_wedding' },
      { id: 'sub_wedding_wrap', name: 'Gift Wrapping', slug: 'gift-wrapping', categoryId: 'cat_wedding' },
    ],
  },
  {
    id: 'cat_birthday',
    name: 'Birthday Items',
    slug: 'birthday-items',
    icon: '🎂',
    subcategories: [
      { id: 'sub_candles', name: 'Candles', slug: 'candles', categoryId: 'cat_birthday' },
      { id: 'sub_balloons', name: 'Balloons', slug: 'balloons', categoryId: 'cat_birthday' },
      { id: 'sub_party_decor', name: 'Party Decoration', slug: 'party-decoration', categoryId: 'cat_birthday' },
    ],
  },
  {
    id: 'cat_food_colors',
    name: 'Food Colors',
    slug: 'food-colors',
    icon: '🎨',
    subcategories: [
      { id: 'sub_liquid_colors', name: 'Liquid Food Colors', slug: 'liquid-food-colors', categoryId: 'cat_food_colors' },
      { id: 'sub_edible_glitter', name: 'Edible Glitter', slug: 'edible-glitter', categoryId: 'cat_food_colors' },
    ],
  },
  {
    id: 'cat_electric',
    name: 'Electric Items',
    slug: 'electric-items',
    icon: '⚡',
    subcategories: [
      { id: 'sub_extension', name: 'Extension Cords', slug: 'extension-cords', categoryId: 'cat_electric' },
      { id: 'sub_fans', name: 'Fans', slug: 'fans', categoryId: 'cat_electric' },
      { id: 'sub_bulbs', name: 'Bulbs & Lights', slug: 'bulbs-lights', categoryId: 'cat_electric' },
    ],
  },
]

export const getCategoryById = (id: string) => MARKET_CATEGORIES.find(c => c.id === id)
export const getSubcategoryById = (id: string) =>
  MARKET_CATEGORIES.flatMap(c => c.subcategories).find(s => s.id === id)
