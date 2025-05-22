// src/data/beef.js - Expanded with more meat cuts
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
    fullDescription: `
      <h2>Topside</h2>
      <p>Topside is a lean cut from the hindquarter of the animal, commonly used for roasting joints. The cut comes from the inner muscle of the thigh and is among the most popular cuts for Sunday roasts due to its leanness.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Lean with minimal fat</li>
        <li>Tender when cooked properly</li>
        <li>Economical compared to premium cuts</li>
        <li>Traditional British roasting joint</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Roasting:</strong> Best cooked medium-rare and served thinly sliced. To prevent the joint from drying out, cook at a high temperature initially (220°C) then reduce to moderate (170°C). Rest for at least 20 minutes before carving.</p>
      
      <p><strong>Pot-Roasting:</strong> This involves cooking the meat with liquid in a covered pot, either on the hob or in the oven. The moist heat helps prevent the meat from drying out.</p>
      
      <p><strong>Braising:</strong> Cut the topside into smaller pieces for slow cooking with vegetables, herbs, and stock.</p>
      
      <h3>Butcher's Tips</h3>
      <ul>
        <li>For roasting, choose a joint with a thin layer of fat for added flavor</li>
        <li>Keep the fat on during cooking to help baste the meat</li>
        <li>Topside can be cut into steaks though they are less tender than other steak cuts</li>
        <li>Can be marinated to enhance tenderness and flavor</li>
      </ul>
    `
  },
  {
    id: 'silverside',
    name: 'Silverside',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/silverside',
    description: 'Located in the hindquarter, this is a lean cut commonly used for roasting and slow cooking methods. Often used for salt beef.',
    image: '/assets/images/beef/silverside.jpg',
    keywords: ['roast', 'slow cook', 'lean', 'traditional'],
    cookingMethods: ['Roasting', 'Slow cooking', 'Braising'],
    characteristics: 'Lean, requires slow cooking for tenderness',
    alternatives: ['Topside', 'Brisket'],
    fullDescription: `
      <h2>Silverside</h2>
      <p>Silverside is a lean cut from the hindquarter of the animal, named after the silver wall of connective tissue that runs along one side of the joint. It's commonly used for roasting and slow cooking methods, and is a traditional cut for making salt beef.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Lean with a layer of fat on one side</li>
        <li>Slightly tougher than topside but very flavorful</li>
        <li>Good value for money</li>
        <li>Excellent for slow cooking and curing</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Roasting:</strong> Best cooked slowly at a lower temperature (160°C) with plenty of liquid to prevent drying out. Benefits greatly from barding (covering with fat) or regular basting.</p>
      
      <p><strong>Slow Cooking:</strong> Excellent for pot roasts and casseroles where the long, slow cooking breaks down the connective tissues, resulting in tender meat.</p>
      
      <p><strong>Braising:</strong> Cut into smaller pieces and braise with aromatic vegetables, herbs and stock for a flavorful dish.</p>
    `
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
    fullDescription: `
      <h2>Sirloin</h2>
      <p>Sirloin is a premium cut from the loin region, located between the fillet and the rib. It's known for its excellent balance of tenderness and flavor, with good marbling throughout.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Well-marbled with fat, providing excellent flavor</li>
        <li>Tender texture with a slight chew</li>
        <li>Premium-priced cut</li>
        <li>Versatile for various cooking methods</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Grilling/Barbecuing:</strong> Ideal for cooking as steaks over high heat, developing a flavorful crust while maintaining a juicy interior. Best served medium-rare to medium.</p>
      
      <p><strong>Roasting:</strong> A sirloin joint makes an excellent roast, best cooked to medium-rare at 190°C for approximately 15 minutes per 500g plus 15 minutes extra.</p>
      
      <p><strong>Pan-frying:</strong> Cook steaks in a very hot cast iron pan with a small amount of oil. Finish with butter for added richness.</p>
    `
  },
  {
    id: 'ribeye',
    name: 'Ribeye',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/ribeye',
    description: 'A highly marbled, tender cut from the rib section. Known for its rich flavor and juiciness due to its fat content.',
    image: '/assets/images/beef/ribeye.jpg',
    keywords: ['premium', 'steak', 'marbling', 'juicy', 'rich'],
    cookingMethods: ['Grilling', 'Pan-frying', 'Roasting'],
    characteristics: 'Highly marbled, tender, rich flavor',
    alternatives: ['Sirloin', 'T-Bone'],
    fullDescription: `
      <h2>Ribeye</h2>
      <p>Ribeye is a premium cut from the rib section of the beef. It's highly prized for its rich flavor and tenderness, which comes from the significant marbling of fat throughout the meat.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Excellent marbling throughout the meat</li>
        <li>Rich, buttery flavor</li>
        <li>Tender texture with good bite</li>
        <li>Premium-priced cut</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Grilling:</strong> Perfect for the barbecue, cook to medium-rare or medium to allow the fat to render and baste the meat.</p>
      
      <p><strong>Pan-frying:</strong> Use a very hot pan to sear the outside, then reduce heat to finish cooking. Rest for at least 5 minutes before serving.</p>
      
      <p><strong>Roasting:</strong> A ribeye roast (also called prime rib) makes an impressive centerpiece for special occasions.</p>
    `
  },
  {
    id: 'brisket',
    name: 'Brisket',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/brisket',
    description: 'A flavorful cut from the breast area that benefits from slow cooking to break down the tough connective tissue.',
    image: '/assets/images/beef/brisket.jpg',
    keywords: ['slow cook', 'economical', 'flavorful', 'traditional'],
    cookingMethods: ['Slow cooking', 'Smoking', 'Braising'],
    characteristics: 'Tough when undercooked, tender when slow-cooked, rich flavor',
    alternatives: ['Chuck', 'Shin'],
    fullDescription: `
      <h2>Brisket</h2>
      <p>Brisket comes from the breast area of the beef and contains a significant amount of connective tissue. It requires slow cooking to break down these tissues, resulting in tender, flavorful meat.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Tough when undercooked, wonderfully tender when cooked properly</li>
        <li>Rich, deep beef flavor</li>
        <li>Usually sold with a good layer of fat</li>
        <li>Economical cut with excellent results when prepared correctly</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Slow Cooking:</strong> Cook in a slow cooker or low oven (130-150°C) for 4-6 hours until the meat is fork-tender.</p>
      
      <p><strong>Smoking:</strong> Popular in American barbecue, smoked brisket is cooked low and slow over wood smoke for up to 12 hours.</p>
      
      <p><strong>Braising:</strong> Brown the meat, then cook slowly in liquid in a covered pot until tender.</p>
    `
  },
  {
    id: 'fillet',
    name: 'Fillet',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/fillet',
    description: 'The most tender cut of beef, located along the backbone. Very lean with little fat marbling, mild in flavor.',
    image: '/assets/images/beef/fillet.jpg',
    keywords: ['premium', 'tender', 'steak', 'lean'],
    cookingMethods: ['Pan-frying', 'Roasting', 'Grilling'],
    characteristics: 'Extremely tender, lean, mild flavor',
    alternatives: ['Sirloin', 'Ribeye'],
    fullDescription: `
      <h2>Fillet</h2>
      <p>The fillet, also known as tenderloin, is the most tender cut of beef. It comes from a muscle that does very little work, resulting in exceptionally tender meat with a mild flavor.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Extremely tender texture</li>
        <li>Very lean with little fat marbling</li>
        <li>Mild beef flavor compared to other cuts</li>
        <li>The most expensive cut of beef</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Pan-frying:</strong> Quick cooking at high heat to rare or medium-rare. Often served with a sauce to enhance the mild flavor.</p>
      
      <p><strong>Roasting:</strong> Whole fillet makes an impressive roast. Best cooked rare to medium-rare.</p>
      
      <p><strong>Grilling:</strong> Quick cooking over high heat, being careful not to overcook this lean cut.</p>
    `
  },
  {
    id: 'rump',
    name: 'Rump',
    type: 'Beef',
    externalUrl: 'https://ahdb.org.uk/rump',
    description: 'A flavorful steak cut from the hindquarter with good marbling. Firmer texture than premium cuts but excellent taste.',
    image: '/assets/images/beef/rump.jpg',
    keywords: ['steak', 'economical', 'flavorful', 'versatile'],
    cookingMethods: ['Grilling', 'Pan-frying', 'Roasting'],
    characteristics: 'Good flavor, firmer texture, economical',
    alternatives: ['Sirloin', 'Ribeye'],
    fullDescription: `
      <h2>Rump</h2>
      <p>Rump steak comes from the hindquarter of the beef. It's a flavorful cut with a firmer texture than premium cuts like fillet or ribeye, but offers excellent value and taste.</p>
      
      <h3>Characteristics</h3>
      <ul>
        <li>Full, robust beef flavor</li>
        <li>Firmer texture than premium steaks</li>
        <li>Good marbling throughout</li>
        <li>More economical than fillet or ribeye</li>
      </ul>
      
      <h3>Cooking Methods</h3>
      <p><strong>Grilling:</strong> Cook to medium-rare for the best balance of tenderness and flavor.</p>
      
      <p><strong>Pan-frying:</strong> Sear in a very hot pan, then reduce heat to finish. Rest well before serving.</p>
      
      <p><strong>Roasting:</strong> A whole rump joint can be roasted for a more economical alternative to sirloin.</p>
    `
  }
];
