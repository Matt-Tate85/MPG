// src/data/beef.js - Simplified version to get the build working
export const beefCuts = [
  {
    id: 'topside',
    name: 'Topside',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/topside-2',
    description: 'A lean cut from the hindquarter, commonly used for roasting. Its leanness makes it a popular choice for those looking for a healthier option.',
    image: '/assets/images/beef/topside.jpg',
    keywords: ['roast', 'lean', 'economical', 'traditional'],
    cookingMethods: ['Roasting', 'Pot-roasting', 'Braising'],
    characteristics: 'Lean, tender when cooked properly, economical',
    alternatives: ['Silverside', 'Top Rump'],
    fullDescription: 
      '<h2>Topside</h2>' +
      '<p>Topside is a lean cut from the hindquarter of the animal, commonly used for roasting joints. The cut comes from the inner muscle of the thigh and is among the most popular cuts for Sunday roasts due to its leanness.</p>' +
      
      '<h3>Characteristics</h3>' +
      '<ul>' +
        '<li>Lean with minimal fat</li>' +
        '<li>Tender when cooked properly</li>' +
        '<li>Economical compared to premium cuts</li>' +
        '<li>Traditional British roasting joint</li>' +
      '</ul>' +
      
      '<h3>Cooking Methods</h3>' +
      '<p><strong>Roasting:</strong> Best cooked medium-rare and served thinly sliced. To prevent the joint from drying out, cook at a high temperature initially (220°C) then reduce to moderate (170°C). Rest for at least 20 minutes before carving.</p>' +
      
      '<p><strong>Pot-Roasting:</strong> This involves cooking the meat with liquid in a covered pot, either on the hob or in the oven. The moist heat helps prevent the meat from drying out.</p>' +
      
      '<p><strong>Braising:</strong> Cut the topside into smaller pieces for slow cooking with vegetables, herbs, and stock.</p>' +
      
      '<h3>Butcher\'s Tips</h3>' +
      '<ul>' +
        '<li>For roasting, choose a joint with a thin layer of fat for added flavor</li>' +
        '<li>Keep the fat on during cooking to help baste the meat</li>' +
        '<li>Topside can be cut into steaks though they are less tender than other steak cuts</li>' +
        '<li>Can be marinated to enhance tenderness and flavor</li>' +
      '</ul>'
  },
  {
    id: 'sirloin',
    name: 'Sirloin',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/sirloin',
    description: 'A premium cut from the loin with good marbling, suitable for steaks and roasts. Known for its tenderness and flavor.',
    image: '/assets/images/beef/sirloin.jpg',
    keywords: ['premium', 'steak', 'marbling', 'tender'],
    cookingMethods: ['Grilling', 'Roasting', 'Pan-frying'],
    characteristics: 'Tender, good fat marbling, rich flavor',
    alternatives: ['Ribeye', 'Striploin'],
    fullDescription: 
      '<h2>Sirloin</h2>' +
      '<p>Sirloin is a premium cut from the loin region, located between the fillet and the rib. It\'s known for its excellent balance of tenderness and flavor, with good marbling throughout.</p>' +
      
      '<h3>Characteristics</h3>' +
      '<ul>' +
        '<li>Well-marbled with fat, providing excellent flavor</li>' +
        '<li>Tender texture with a slight chew</li>' +
        '<li>Premium-priced cut</li>' +
        '<li>Versatile for various cooking methods</li>' +
      '</ul>' +
      
      '<h3>Cooking Methods</h3>' +
      '<p><strong>Grilling/Barbecuing:</strong> Ideal for cooking as steaks over high heat, developing a flavorful crust while maintaining a juicy interior. Best served medium-rare to medium.</p>' +
      
      '<p><strong>Roasting:</strong> A sirloin joint makes an excellent roast, best cooked to medium-rare at 190°C for approximately 15 minutes per 500g plus 15 minutes extra.</p>' +
      
      '<p><strong>Pan-frying:</strong> Cook steaks in a very hot cast iron pan with a small amount of oil. Finish with butter for added richness.</p>'
  }
];
