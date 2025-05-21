// data/index.js - Main data module that combines all meat types
import { beefCuts } from './beef.js';
import { lambCuts } from './lamb.js';
import { porkCuts } from './pork.js';

// All meat types
const meatTypes = ['Beef', 'Lamb', 'Pork'];

// All unique keywords across all cuts
const allKeywords = [
    'roast', 'lean', 'economical', 'traditional', 'premium', 'steak', 'marbling', 'tender',
    'slow cook', 'braise', 'flavorful', 'stew', 'gelatinous', 'pull apart', 'quick cook',
    'chops', 'rich', 'crackling', 'succulent', 'bbq', 'sticky', 'impressive', 'juicy',
    'sunday lunch', 'meaty', 'versatile', 'ham', 'pull'
];

/**
 * Get all meat types
 * @returns {string[]} Array of meat types
 */
function getMeatTypes() {
    return meatTypes;
}

/**
 * Get all meat cuts
 * @returns {Object[]} Array of all meat cuts across all types
 */
function getAllCuts() {
    return [...beefCuts, ...lambCuts, ...porkCuts];
}

/**
 * Get cuts by meat type
 * @param {string} type - The meat type (e.g., 'Beef', 'Lamb', 'Pork')
 * @returns {Object[]} Array of cuts for the specified type
 */
function getCutsByType(type) {
    switch(type.toLowerCase()) {
        case 'beef':
            return beefCuts;
        case 'lamb':
            return lambCuts;
        case 'pork':
            return porkCuts;
        default:
            return [];
    }
}

/**
 * Get a specific cut by ID
 * @param {string} id - The cut ID
 * @returns {Object|null} The meat cut object or null if not found
 */
function getCutById(id) {
    return getAllCuts().find(cut => cut.id === id) || null;
}

/**
 * Get all unique keywords used across cuts
 * @returns {string[]} Array of keywords
 */
function getAllKeywords() {
    return allKeywords;
}

/**
 * Filter cuts based on search criteria
 * @param {Object} criteria - Filter criteria
 * @param {string} [criteria.type] - Meat type filter
 * @param {string} [criteria.search] - Text search term
 * @param {string[]} [criteria.keywords] - Keywords to filter by
 * @returns {Object[]} Filtered array of meat cuts
 */
function filterCuts(criteria = {}) {
    let results = getAllCuts();
    
    // Filter by meat type
    if (criteria.type && criteria.type !== 'all') {
        results = results.filter(cut => cut.type.toLowerCase() === criteria.type.toLowerCase());
    }
    
    // Filter by search term
    if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        results = results.filter(cut => 
            cut.name.toLowerCase().includes(searchTerm) ||
            cut.description.toLowerCase().includes(searchTerm) ||
            cut.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
        results = results.filter(cut => 
            criteria.keywords.every(keyword => 
                cut.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
            )
        );
    }
    
    return results;
}

export {
    getMeatTypes,
    getAllCuts,
    getCutsByType,
    getCutById,
    getAllKeywords,
    filterCuts
};

// data/beef.js - Beef cuts data
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
            
            <h3>Nutritional Information</h3>
            <p>Topside is one of the leanest beef cuts available, making it a good choice for those looking to reduce fat intake while still enjoying beef.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 160 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~27g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~5g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Traditional Roast Beef with Yorkshire Puddings</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.5kg topside of beef</li>
                <li>2 tbsp olive oil</li>
                <li>1 tsp English mustard powder</li>
                <li>1 tsp dried thyme</li>
                <li>Salt and freshly ground black pepper</li>
            </ul>
            
            <h4>For the Yorkshire puddings:</h4>
            <ul>
                <li>140g plain flour</li>
                <li>4 eggs</li>
                <li>200ml milk</li>
                <li>Sunflower oil for cooking</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Remove the beef from the fridge 30 minutes before cooking</li>
                <li>Preheat the oven to 220°C/200°C fan/gas 7</li>
                <li>Mix the olive oil with the mustard powder, thyme, and seasoning</li>
                <li>Rub this mixture all over the beef</li>
                <li>Place in a roasting tin and cook for 20 minutes</li>
                <li>Reduce the oven to 170°C/150°C fan/gas 3 and cook for 20 minutes per 500g for medium-rare</li>
                <li>Rest the meat for at least 20 minutes before carving</li>
            </ol>
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
            
            <p><strong>Curing:</strong> Traditionally used for making salt beef or corned beef, where it's cured in a brine solution before cooking.</p>
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>Ask your butcher to leave a good layer of fat which will baste the meat as it cooks</li>
                <li>For roasting, tie the joint at regular intervals to help it maintain its shape</li>
                <li>The grain of silverside runs in one direction, so it's important to carve across the grain to maximize tenderness</li>
                <li>Leftovers make excellent cold cuts for sandwiches</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Silverside is a lean cut with good nutritional value.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 170 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~28g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~6g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Slow-Cooked Beef Silverside with Root Vegetables</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.5kg silverside of beef</li>
                <li>2 tbsp vegetable oil</li>
                <li>2 onions, roughly chopped</li>
                <li>2 carrots, roughly chopped</li>
                <li>2 celery sticks, roughly chopped</li>
                <li>4 garlic cloves, crushed</li>
                <li>2 bay leaves</li>
                <li>4 sprigs of thyme</li>
                <li>200ml red wine</li>
                <li>500ml beef stock</li>
                <li>2 tbsp tomato purée</li>
                <li>Salt and freshly ground black pepper</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Preheat the oven to 160°C/140°C fan/gas 3</li>
                <li>Season the beef well with salt and pepper</li>
                <li>Heat the oil in a large casserole dish and brown the beef on all sides</li>
                <li>Remove the beef and set aside, then add the vegetables to the dish and cook until softened</li>
                <li>Add the garlic, bay leaves, and thyme, and cook for another minute</li>
                <li>Pour in the wine and bring to the boil, scraping up any browned bits from the bottom</li>
                <li>Stir in the stock and tomato purée</li>
                <li>Return the beef to the dish, cover, and cook in the oven for 3-3.5 hours until tender</li>
                <li>Rest for 20 minutes before carving across the grain</li>
            </ol>
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
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>Choose sirloin with a good amount of marbling for the best flavor</li>
                <li>For steaks, look for cuts that are at least 2.5cm thick for optimal cooking</li>
                <li>The fat cap on sirloin should be crisp and golden when cooked properly</li>
                <li>Rest sirloin for at least 5 minutes after cooking to allow juices to redistribute</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Sirloin provides a good balance of protein and fat.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 210 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~26g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~12g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Perfect Sirloin Steak</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>2 sirloin steaks, at least 2.5cm thick</li>
                <li>2 tbsp vegetable oil</li>
                <li>50g butter</li>
                <li>4 garlic cloves, crushed</li>
                <li>Few sprigs of thyme</li>
                <li>Sea salt and freshly ground black pepper</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Remove the steaks from the fridge 30 minutes before cooking to bring to room temperature</li>
                <li>Pat the steaks dry with kitchen paper, then season generously with salt and pepper</li>
                <li>Heat a heavy-based frying pan until very hot, then add the oil</li>
                <li>Add the steaks to the pan and cook for 2-3 minutes on each side for medium-rare</li>
                <li>Reduce the heat slightly, then add the butter, garlic, and thyme</li>
                <li>Tilt the pan and baste the steaks with the foaming butter for 1 minute</li>
                <li>Remove from the pan and rest on a warm plate for 5 minutes before serving</li>
            </ol>
        `
    },
    // Add more beef cuts here...
];

// data/lamb.js - Lamb cuts data
export const lambCuts = [
    {
        id: 'leg',
        name: 'Leg of Lamb',
        type: 'Lamb',
        externalUrl: 'https://ahdb.org.uk/leg-of-lamb',
        description: 'A classic roasting joint, lean and versatile. Can be roasted whole or cut into steaks.',
        image: '/assets/images/lamb/leg.jpg',
        keywords: ['roast', 'lean', 'traditional', 'sunday lunch'],
        cookingMethods: ['Roasting', 'Grilling (as steaks)', 'Butterflying'],
        characteristics: 'Lean, meaty, versatile',
        alternatives: ['Shoulder', 'Rump'],
        fullDescription: `
            <h2>Leg of Lamb</h2>
            <p>The leg of lamb is one of the most popular and versatile cuts, perfect for roasting. It's taken from the hindquarter of the animal and provides lean, tender meat with excellent flavor.</p>
            
            <h3>Characteristics</h3>
            <ul>
                <li>Relatively lean with a layer of fat on the outside</li>
                <li>Tender and flavorful</li>
                <li>Versatile - can be roasted whole, butterflied, or cut into steaks</li>
                <li>Traditional choice for Sunday roasts and special occasions</li>
            </ul>
            
            <h3>Cooking Methods</h3>
            <p><strong>Roasting:</strong> The most popular method. Roast at 180°C for approximately 20-25 minutes per 500g plus 20 minutes for medium. For the best results, rest for at least 15 minutes before carving.</p>
            
            <p><strong>Butterflying:</strong> A butterflied leg has had the bone removed and the meat opened out flat, which allows for quicker, more even cooking. Excellent for barbecuing or grilling.</p>
            
            <p><strong>Steaks:</strong> Leg steaks are cut across the muscle and can be pan-fried or grilled quickly for a convenient meal.</p>
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>For roasting, choose a leg with good fat coverage for self-basting</li>
                <li>Scoring the fat helps it render during cooking</li>
                <li>Ask your butcher to butterfly the leg for barbecuing, or to cut it into steaks</li>
                <li>The shank end tends to be more flavorful, while the fillet end is more tender</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Lamb leg is a nutritious cut with good protein content.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 200 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~25g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~10g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Roast Leg of Lamb with Garlic and Rosemary</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.8kg leg of lamb</li>
                <li>4 garlic cloves, sliced</li>
                <li>4 sprigs of rosemary</li>
                <li>2 tbsp olive oil</li>
                <li>1 lemon, zested and juiced</li>
                <li>Salt and freshly ground black pepper</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Preheat the oven to 200°C/180°C fan/gas 6</li>
                <li>Using a sharp knife, make small incisions all over the lamb</li>
                <li>Insert slices of garlic and small sprigs of rosemary into the incisions</li>
                <li>Mix the olive oil with lemon zest, juice, salt, and pepper</li>
                <li>Rub this mixture all over the lamb</li>
                <li>Place the lamb on a rack in a roasting tin</li>
                <li>Roast for 1 hour 20 minutes for medium (adjust time based on weight)</li>
                <li>Cover with foil and rest for 15-20 minutes before carving</li>
            </ol>
        `
    },
    {
        id: 'shoulder',
        name: 'Shoulder of Lamb',
        type: 'Lamb',
        externalUrl: 'https://ahdb.org.uk/lamb-shoulder',
        description: 'Contains more fat than leg, ideal for slow cooking. Produces tender, pull-apart meat with rich flavor.',
        image: '/assets/images/lamb/shoulder.jpg',
        keywords: ['slow cook', 'flavorful', 'economical', 'pull apart'],
        cookingMethods: ['Slow cooking', 'Roasting', 'Braising'],
        characteristics: 'More fat than leg, great flavor, becomes very tender',
        alternatives: ['Leg', 'Neck'],
        fullDescription: `
            <h2>Shoulder of Lamb</h2>
            <p>The shoulder of lamb comes from the forequarter of the animal and is a hard-working muscle, which means it has more connective tissue than the leg. This makes it perfect for slow cooking, which transforms it into meltingly tender meat with a rich, deep flavor.</p>
            
            <h3>Characteristics</h3>
            <ul>
                <li>Higher fat content than leg, making it incredibly flavorful</li>
                <li>Contains more connective tissue, which breaks down during slow cooking</li>
                <li>Economical compared to premium cuts</li>
                <li>Perfect for pulling or shredding once cooked</li>
            </ul>
            
            <h3>Cooking Methods</h3>
            <p><strong>Slow Roasting:</strong> The most popular method. Cook at a low temperature (160°C) for a long time (3-4 hours) until the meat is falling off the bone.</p>
            
            <p><strong>Braising:</strong> Cut into pieces and cook slowly in liquid with vegetables and herbs.</p>
            
            <p><strong>Pot Roasting:</strong> Similar to braising but with the joint kept whole, cooked in a covered pot with liquid.</p>
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>Leave the fat on during cooking - it bastes the meat and adds flavor</li>
                <li>For bone-in shoulder, look for cuts with the blade bone still in for maximum flavor</li>
                <li>Boneless shoulder is easier to carve but may not be as flavorful</li>
                <li>This cut benefits greatly from seasoning with bold flavors like garlic, rosemary, and spices</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Lamb shoulder has a higher fat content than leg, which contributes to its rich flavor.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 230 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~22g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~16g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Slow-Roasted Shoulder of Lamb</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.8kg shoulder of lamb</li>
                <li>4 garlic cloves, crushed</li>
                <li>2 tbsp fresh rosemary, chopped</li>
                <li>2 tbsp olive oil</li>
                <li>1 tsp dried oregano</li>
                <li>1 lemon, zested</li>
                <li>300ml lamb or chicken stock</li>
                <li>2 onions, roughly chopped</li>
                <li>Salt and freshly ground black pepper</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Preheat the oven to 160°C/140°C fan/gas 3</li>
                <li>Mix the garlic, rosemary, olive oil, oregano, and lemon zest to make a paste</li>
                <li>Make small incisions in the lamb and rub the paste all over it</li>
                <li>Place the onions in a deep roasting tin and put the lamb on top</li>
                <li>Pour the stock around (not over) the lamb</li>
                <li>Cover tightly with foil and roast for 3 hours</li>
                <li>Remove the foil and turn up the oven to 200°C/180°C fan/gas 6</li>
                <li>Roast for another 30 minutes until browned</li>
                <li>Rest for 15 minutes, then pull apart with two forks</li>
            </ol>
        `
    },
    // Add more lamb cuts here...
];

// data/pork.js - Pork cuts data
export const porkCuts = [
    {
        id: 'loin',
        name: 'Pork Loin',
        type: 'Pork',
        externalUrl: 'https://ahdb.org.uk/pork-loin',
        description: 'A lean cut that runs along the top of the pig, suitable for roasting or for chops.',
        image: '/assets/images/pork/loin.jpg',
        keywords: ['roast', 'chops', 'lean', 'quick cook'],
        cookingMethods: ['Roasting', 'Grilling', 'Pan-frying'],
        characteristics: 'Lean, tender, versatile',
        alternatives: ['Tenderloin', 'Leg'],
        fullDescription: `
            <h2>Pork Loin</h2>
            <p>The loin is a premium cut that runs along the back of the pig, from shoulder to hip. It's one of the leanest cuts of pork, making it a popular choice for both roasting as a joint and cutting into steaks or chops.</p>
            
            <h3>Characteristics</h3>
            <ul>
                <li>Lean and tender with a mild flavor</li>
                <li>Can be cooked with or without the fat cap (crackling)</li>
                <li>Versatile - can be roasted whole or cut into steaks, chops, or medallions</li>
                <li>Premium cut with excellent texture</li>
            </ul>
            
            <h3>Cooking Methods</h3>
            <p><strong>Roasting:</strong> For joints, roast at 180°C for approximately 30 minutes per 500g plus 30 minutes, or until the internal temperature reaches 71°C. Keep the fat on for crackling.</p>
            
            <p><strong>Grilling/Barbecuing:</strong> Loin chops or steaks are excellent for grilling. Cook for 4-5 minutes each side until cooked through.</p>
            
            <p><strong>Pan-frying:</strong> Loin steaks can be quickly pan-fried for 3-4 minutes each side, depending on thickness.</p>
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>For the best crackling, ensure the skin is dry and scored before roasting</li>
                <li>A thin layer of fat beneath the skin will keep the meat moist</li>
                <li>For chops, look for cuts that are at least 2cm thick for juicier results</li>
                <li>Loin is lean, so be careful not to overcook it as it can become dry</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Pork loin is one of the leanest cuts of pork.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 170 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~26g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~7g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Roast Pork Loin with Apple and Sage</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.5kg boneless pork loin, with skin</li>
                <li>2 tbsp olive oil</li>
                <li>2 tsp sea salt flakes</li>
                <li>1 tbsp fresh sage leaves, chopped</li>
                <li>2 garlic cloves, crushed</li>
                <li>2 eating apples, cored and quartered</li>
                <li>1 onion, cut into wedges</li>
                <li>300ml chicken stock</li>
                <li>1 tbsp plain flour</li>
                <li>1 tbsp cider vinegar</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Preheat the oven to 240°C/220°C fan/gas 9</li>
                <li>Score the pork skin with a sharp knife</li>
                <li>Rub with 1 tbsp olive oil and the sea salt</li>
                <li>Mix the remaining oil with sage and garlic, then rub it over the meat (not the skin)</li>
                <li>Place the pork on a rack in a roasting tin</li>
                <li>Roast for 20 minutes, then reduce the oven to 180°C/160°C fan/gas 4</li>
                <li>Add the apples and onions to the tin</li>
                <li>Roast for another 1 hour 20 minutes until the meat is cooked through</li>
                <li>Remove the pork and rest for 15 minutes</li>
                <li>Meanwhile, make a gravy with the pan juices, flour, stock, and vinegar</li>
            </ol>
        `
    },
    {
        id: 'belly',
        name: 'Pork Belly',
        type: 'Pork',
        externalUrl: 'https://ahdb.org.uk/pork-belly',
        description: 'A fatty, flavorful cut ideal for slow cooking or strips for bacon. Creates crispy crackling when roasted.',
        image: '/assets/images/pork/belly.jpg',
        keywords: ['slow cook', 'rich', 'crackling', 'succulent'],
        cookingMethods: ['Slow cooking', 'Roasting', 'Braising'],
        characteristics: 'Fatty, flavorful, great for crackling',
        alternatives: ['Shoulder', 'Spare Ribs'],
        fullDescription: `
            <h2>Pork Belly</h2>
            <p>Pork belly is a fatty cut from the underside of the pig. Once considered a budget cut, it has become increasingly popular due to its rich flavor, versatility, and the ability to produce spectacular crackling when roasted.</p>
            
            <h3>Characteristics</h3>
            <ul>
                <li>High fat content with layers of fat and meat</li>
                <li>Rich, succulent texture when cooked properly</li>
                <li>Skin produces excellent crackling</li>
                <li>Flavorful and relatively economical</li>
            </ul>
            
            <h3>Cooking Methods</h3>
            <p><strong>Slow Roasting:</strong> The most popular method. Cook at a high temperature (220°C) initially to crisp the skin, then reduce to a lower temperature (160°C) for 2-3 hours until tender.</p>
            
            <p><strong>Braising:</strong> Cut into chunks and braise slowly with aromatic vegetables, herbs, and liquid for a rich, tender result.</p>
            
            <p><strong>Slow Cooking:</strong> Pork belly can be cooked low and slow (without the skin) for pulled pork.</p>
            
            <h3>Butcher's Tips</h3>
            <ul>
                <li>Look for belly with even layers of fat and meat</li>
                <li>Ensure the skin is intact if you want crackling</li>
                <li>The skin must be completely dry before roasting for the best crackling</li>
                <li>Score the skin in a diamond pattern or ask your butcher to do this</li>
            </ul>
            
            <h3>Nutritional Information</h3>
            <p>Pork belly is one of the fattier cuts of pork.</p>
            
            <table>
                <tr>
                    <th>Nutrient</th>
                    <th>Amount (per 100g)</th>
                </tr>
                <tr>
                    <td>Calories</td>
                    <td>Approximately 300 kcal</td>
                </tr>
                <tr>
                    <td>Protein</td>
                    <td>~16g</td>
                </tr>
                <tr>
                    <td>Fat</td>
                    <td>~25g</td>
                </tr>
            </table>
            
            <h3>Recipe Suggestion: Crispy Roast Pork Belly</h3>
            <h4>Ingredients:</h4>
            <ul>
                <li>1.5kg pork belly, skin on</li>
                <li>1 tbsp sea salt flakes</li>
                <li>1 tsp black peppercorns, crushed</li>
                <li>2 tsp fennel seeds</li>
                <li>4 garlic cloves, crushed</li>
                <li>2 tbsp olive oil</li>
                <li>1 onion, quartered</li>
                <li>2 carrots, roughly chopped</li>
                <li>2 celery sticks, roughly chopped</li>
                <li>300ml chicken stock</li>
            </ul>
            
            <h4>Method:</h4>
            <ol>
                <li>Pat the pork skin dry with kitchen paper</li>
                <li>Score the skin with a sharp knife in a diamond pattern</li>
                <li>Mix the salt, pepper, fennel seeds, garlic, and 1 tbsp oil</li>
                <li>Turn the pork over and rub the mixture into the meat (not the skin)</li>
                <li>Place in the fridge, uncovered, for 4 hours or overnight to dry the skin</li>
                <li>Preheat the oven to 240°C/220°C fan/gas 9</li>
                <li>Rub the skin with the remaining oil and more salt</li>
                <li>Place the vegetables in a roasting tin and put the pork on top, skin-side up</li>
                <li>Roast for 30 minutes, then reduce to 180°C/160°C fan/gas 4</li>
                <li>Pour in the stock (avoiding the skin) and roast for another 1.5 hours</li>
                <li>Turn up the heat to 220°C/200°C fan/gas 7 for 20-30 minutes to crisp the crackling</li>
                <li>Rest for 15 minutes before carving</li>
            </ol>
        `
    },
    // Add more pork cuts here...
];
