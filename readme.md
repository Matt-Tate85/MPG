# AHDB Meat Purchasing Guide PWA

A Progressive Web App (PWA) for the Agriculture and Horticulture Development Board (AHDB) Meat Purchasing Guide, providing comprehensive information about different meat cuts, their characteristics, and cooking methods.

![AHDB Meat Guide Screenshot](public/assets/screenshots/screen1.jpg)

## Features

- **Progressive Web App**: Install on any device for offline access
- **Comprehensive Meat Cut Information**: Detailed information about beef, lamb, and pork cuts
- **Advanced Filtering**: Filter by meat type, keywords, and search terms
- **Fully Responsive**: Optimized for all screen sizes from mobile to desktop
- **WCAG 2.1 AA Compliant**: Built with accessibility as a priority
- **Offline Functionality**: Complete access to all content without an internet connection

## Getting Started

### Prerequisites

- Node.js and npm (optional, for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/meat-guide-pwa.git
   cd meat-guide-pwa
   ```

2. For development (optional):
   ```bash
   npm install
   npm start
   ```

3. For deployment:
   - The project can be deployed directly to any static web hosting service
   - Alternatively, use the included GitHub Actions workflow for Azure deployment

## Deployment to Azure

This project includes a GitHub Actions workflow for automatic deployment to Azure Web Apps. To use it:

1. Create an Azure Web App
2. Generate a publish profile from the Azure portal
3. Add the publish profile as a GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Push to the main branch or manually trigger the workflow

## Project Structure

```
/meat-guide-pwa/
├── public/                  # Static files served directly
│   ├── index.html           # Main HTML file
│   ├── manifest.json        # PWA manifest
│   ├── assets/              # Static assets (images, icons)
│   ├── css/                 # Stylesheets
│   └── js/                  # JavaScript files
│      ├── app.js            # Main application
│      ├── data/             # Data modules (meat cuts)
│      ├── routes.js         # Routing module
│      └── ui.js             # UI components
│
└── .github/                 # GitHub Actions workflows
```

## Managing Meat Cut Data

Meat cut data is organized by type in separate files:

- `js/data/beef.js` - Beef cuts data
- `js/data/lamb.js` - Lamb cuts data
- `js/data/pork.js` - Pork cuts data

To add or modify cuts, edit the appropriate file following the established data structure.

## Offline Support

The app uses a service worker to cache content for offline use. Key features include:

- Aggressive caching of core assets during installation
- Dynamic caching of meat cut images
- Graceful fallbacks for network failures
- Offline notification when connection is lost

## Accessibility Features

- Keyboard navigation throughout the application
- Screen reader compatibility with appropriate ARIA labels
- Sufficient color contrast for all text elements
- Visible focus indicators
- Skip links for keyboard users
- Properly structured headings and landmarks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Data sourced from the Agriculture and Horticulture Development Board (AHDB)
- Built as a collaboration with AHDB's Technology Transformation and Innovation team
