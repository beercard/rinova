import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, MessageCircle, Eye } from 'lucide-react';
import { pushPropertyClick, pushWhatsAppClick } from '@/lib/gtm';

const PropertyCard = ({ property, index, onSelect }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const message = `Hola! Estoy interesado en la propiedad: ${property.title} - ${formatPrice(property.price)}`;
    const url = `https://wa.me/5491153413959?text=${encodeURIComponent(message)}`;
    
    // Track WhatsApp Click
    pushWhatsAppClick('property_card', property.id);
    
    window.open(url, '_blank');
  };

  const handleCardClick = () => {
    pushPropertyClick(property);
    onSelect(property);
  };

  const handleViewMore = (e) => {
    e.stopPropagation();
    pushPropertyClick(property);
    onSelect(property);
  };

  // Safe image handling
  const displayImage = Array.isArray(property.images)
    ? (property.images.find((img) => typeof img === 'string' && img.length > 0 && !img.startsWith('data:image/')) ||
      'https://via.placeholder.com/400x300?text=No+Image')
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card overflow-hidden cursor-pointer card-hover w-full flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Image - Responsive height for different grid sizes */}
      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden shrink-0 bg-gray-100">
        <img
          src={displayImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image'}
        />
        <div className="absolute top-2 right-2 md:top-4 md:right-4">
          <span className={`px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
            property.type === 'venta' 
              ? 'bg-[#030083] text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {property.type === 'venta' ? 'Venta' : 'Alquiler'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-lg md:text-xl font-bold text-[#060805] mb-2 line-clamp-2 min-h-[2.5em] sm:min-h-[3.5em]">
          {property.title}
        </h3>
        
        {/* Address & Zone */}
        <div className="flex flex-col mb-2 md:mb-4">
           {property.address && (
              <p className="text-xs text-gray-500 truncate mb-1">{property.address}</p>
           )}
           <div className="flex items-center text-gray-600">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
            <span className="text-xs md:text-sm truncate">{property.zone}</span>
          </div>
        </div>

        <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#030083] mb-2 md:mb-4">
          {formatPrice(property.price)}
          {property.type === 'alquiler' && <span className="text-xs md:text-sm text-gray-600"> /mes</span>}
        </div>

        <div className="flex items-center justify-between text-gray-600 mb-3 pb-3 md:mb-4 md:pb-4 border-b border-gray-200 mt-auto">
          <div className="flex items-center">
            <Bed className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="text-xs md:text-sm">{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="text-xs md:text-sm">{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Maximize className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="text-xs md:text-sm">{property.area}m²</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center text-xs md:text-sm"
          >
            <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            WhatsApp
          </button>
          <button
            onClick={handleViewMore}
            className="w-full bg-[#030083] text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center justify-center text-xs md:text-sm"
          >
            <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Ver más
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
