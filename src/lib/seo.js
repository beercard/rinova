export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Rinova",
    "image": "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/cbc9549870028028604ab7b6f5c00aed.png",
    "telephone": "+54 9 11 5341-3959",
    "email": "ornella.vietagizzi@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Punta del Este",
      "addressCountry": "UY"
    },
    "url": "https://rinova.com",
    "priceRange": "$$$"
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rinova Inversiones",
    "url": "https://rinova.com",
    "logo": "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/cbc9549870028028604ab7b6f5c00aed.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54 9 11 5341-3959",
      "contactType": "sales",
      "areaServed": ["UY", "AR"],
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://facebook.com",
      "https://instagram.com"
    ]
  };
};

export const generateRealEstateAgentSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Rinova",
    "description": "Asesoramiento especializado en inversiones inmobiliarias en Punta del Este.",
    "telephone": "+54 9 11 5341-3959",
    "image": "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/cbc9549870028028604ab7b6f5c00aed.png",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Punta del Este",
        "addressCountry": "UY"
    }
  };
};

export const generatePropertySchema = (property) => {
  if (!property) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product", 
    "name": property.title,
    "description": property.description,
    "image": property.images && property.images.length > 0 ? property.images : [],
    "sku": `${property.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Rinova Properties"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": property.price,
      "url": window.location.href,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Rinova"
      }
    }
  };
};