-- ============================================================
-- 007_expanded_categories.sql
-- Expanded category seeding with subcategories for influencer-brand collaborations
-- ============================================================

-- Insert additional categories that are most relevant to brand-influencer campaigns
-- Using ON CONFLICT to safely merge with existing categories

INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
    -- Core Campaign Categories (primary)
    ('Fashion & Style',       'fashion-style',        'Fashion, clothing, accessories, and personal style',         'Shirt',           1),
    ('Beauty & Skincare',     'beauty-skincare',       'Beauty products, makeup, skincare routines, cosmetics',      'Sparkles',        2),
    ('Food & Cooking',        'food-cooking',          'Food reviews, recipes, cooking tutorials, restaurants',      'UtensilsCrossed', 3),
    ('Travel & Adventure',    'travel-adventure',      'Travel destinations, adventures, tourism, and hospitality',  'Plane',           4),
    ('Health & Fitness',      'health-fitness',        'Fitness routines, health tips, wellness, and nutrition',     'Heart',           5),
    ('Technology',            'technology',            'Tech reviews, gadgets, software, apps, and digital tools',   'Laptop',          6),
    ('Entertainment',         'entertainment',         'Music, movies, comedy, podcasts, and pop culture',           'Music',           7),
    ('Education',             'education',             'Educational content, tutorials, online courses, learning',   'BookOpen',        8),
    ('Lifestyle',             'lifestyle',             'Daily life, home decor, organization, and productivity',     'Home',            9),
    ('Finance & Business',    'finance-business',      'Personal finance, investing, entrepreneurship, startups',    'Briefcase',      10),
    ('Sports',                'sports',                'Sports coverage, commentary, athletics, and outdoor',        'Trophy',         11),
    ('Parenting & Family',    'parenting-family',      'Parenting tips, family life, baby products, children',       'Baby',           12),
    ('Art & Photography',     'art-photography',       'Art, photography, illustration, creative content',           'Camera',         13),
    ('Gaming',                'gaming',                'Video games, streaming, esports, game reviews',              'Gamepad2',       14),
    ('Automotive',            'automotive',            'Cars, motorcycles, automotive reviews, test drives',         'Car',            15),
    ('Pets & Animals',        'pets-animals',          'Pet care, animal content, veterinary, pet products',         'Dog',            16),
    ('Real Estate',           'real-estate',           'Property, real estate, home buying, interior design',        'Building',       17),
    ('Sustainability',        'sustainability',        'Eco-friendly, sustainability, green living, environment',    'Leaf',           18),

    -- Additional brand-relevant categories
    ('Home & Garden',         'home-garden',           'Home improvement, gardening, DIY, interior décor',           'Home',           19),
    ('Luxury & Premium',      'luxury-premium',        'Luxury goods, premium brands, high-end lifestyle',          'Crown',          20),
    ('E-Commerce & Retail',   'ecommerce-retail',      'Online shopping, product reviews, unboxing, hauls',         'ShoppingBag',    21),
    ('SaaS & Apps',           'saas-apps',             'Software tools, productivity apps, SaaS reviews',           'Smartphone',     22),
    ('Crypto & Web3',         'crypto-web3',           'Cryptocurrency, blockchain, NFTs, DeFi, Web3',              'Bitcoin',        23),
    ('Mental Health',         'mental-health',         'Mental wellness, self-care, therapy, mindfulness',           'Brain',          24),
    ('Wedding & Events',      'wedding-events',        'Wedding planning, events, party décor, celebrations',       'PartyPopper',    25),
    ('Music & Audio',         'music-audio',           'Music production, instruments, audio gear, playlists',       'Headphones',     26),
    ('Books & Literature',    'books-literature',      'Book reviews, reading lists, literature, publishing',        'BookOpen',       27),
    ('DIY & Crafts',          'diy-crafts',            'Do-it-yourself projects, crafts, handmade, upcycling',      'Hammer',         28),
    ('Outdoor & Camping',     'outdoor-camping',       'Hiking, camping, outdoor gear, nature exploration',         'Mountain',       29),
    ('Career & Professional', 'career-professional',   'Career development, job seeking, professional growth',       'GraduationCap',  30),
    ('Legal & Compliance',    'legal-compliance',      'Legal advice, compliance, regulations, contracts',           'Scale',          31),
    ('Non-Profit & Social',   'nonprofit-social',      'Non-profit causes, social impact, charity, volunteering',   'HeartHandshake', 32)
ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;
