import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Maximize, MessageCircle, ChevronLeft, ChevronRight, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { pushPropertyDetailsView, pushWhatsAppClick } from '@/lib/gtm';
import { generatePropertySchema } from '@/lib/seo';
import { supabase } from '@/lib/customSupabaseClient';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { fetchPropertyById } from '@/lib/supabase';

const PropertyModal = ({ property, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [propertyData, setPropertyData] = useState(property);
  const [loadingProperty, setLoadingProperty] = useState(false);
  
  // Maps
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef(null);
  
  // State for custom confirmation dialog
  const [showFallbackConfirm, setShowFallbackConfirm] = useState(false);
  const [fallbackMailtoLink, setFallbackMailtoLink] = useState('');

  const { toast } = useToast();
  
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: `Hola, estoy interesado en la propiedad: ${property.title}`
  });

  const p = propertyData || property;

  useEffect(() => {
    // Track Property Details View
    pushPropertyDetailsView(property);
  }, [property]);

  useEffect(() => {
    setPropertyData(property);
  }, [property]);

  useEffect(() => {
    const loadFullProperty = async () => {
      if (!property?.id) return;
      if (property?.images && property.images.length > 0) return;

      setLoadingProperty(true);
      try {
        const full = await fetchPropertyById(property.id);
        setPropertyData(full);
      } catch (error) {
        console.error('Failed to load full property:', error);
      } finally {
        setLoadingProperty(false);
      }
    };

    loadFullProperty();
  }, [property?.id]);

  // Initialize Map
  useEffect(() => {
    if (isLoaded && mapRef.current && p.latitude && p.longitude) {
      const location = { 
        lat: parseFloat(p.latitude), 
        lng: parseFloat(p.longitude) 
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
      });

      new window.google.maps.Marker({
        position: location,
        map: map,
        title: p.title
      });
    }
  }, [isLoaded, p.latitude, p.longitude, p.title]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = () => {
    const message = `Hola! Estoy interesado en la propiedad: ${p.title} - ${formatPrice(p.price)}`;
    const url = `https://wa.me/5491153413959?text=${encodeURIComponent(message)}`;
    
    // Track WhatsApp Click
    pushWhatsAppClick('property_modal', p.id);
    
    window.open(url, '_blank');
  };

  useEffect(() => {
    setContactForm(prev => ({
      ...prev,
      mensaje: prev.mensaje?.trim()
        ? prev.mensaje
        : `Hola, estoy interesado en la propiedad: ${p.title}`
    }));
  }, [p.title]);

  const handleEmailContact = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-inquiry-email', {
        body: {
          name: contactForm.nombre,
          email: contactForm.email,
          phone: contactForm.telefono,
          message: contactForm.mensaje,
          propertyTitle: p.title,
          propertyId: p.id
        }
      });

      if (error) throw error;

      toast({
        title: "¡Consulta enviada con éxito!",
        description: "Hemos recibido tu mensaje. Te contactaremos a la brevedad.",
        variant: "success",
        duration: 5000,
      });

      // Reset form
      setContactForm({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: `Hola, estoy interesado en la propiedad: ${p.title}`
      });

    } catch (error) {
      console.error('Failed to send email:', error);
      
      const errorMessage = "Hubo un problema al enviar tu consulta. Por favor intenta nuevamente.";
      
      toast({
        title: "Error al enviar",
        description: errorMessage,
        variant: "error",
        duration: 5000,
      });

      // Fallback to mailto
      const mailtoLink = `mailto:ornella.vietagizzi@gmail.com,info@rinova.com.ar?subject=Consulta por ${encodeURIComponent(p.title)}&body=${encodeURIComponent(
        `Nombre: ${contactForm.nombre}\nEmail: ${contactForm.email}\nTeléfono: ${contactForm.telefono}\n\nMensaje:\n${contactForm.mensaje}`
      )}`;
      
      setFallbackMailtoLink(mailtoLink);
      setShowFallbackConfirm(true);
      
    } finally {
      setIsSendingEmail(false);
    }
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    if (!p.images || p.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === p.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (!p.images || p.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? p.images.length - 1 : prev - 1
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const displayImage = p.images && p.images.length > 0 
    ? p.images[currentImageIndex] 
    : 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(generatePropertySchema(p))}
          </script>
        </Helmet>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-20 p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-2xl font-bold text-[#030083] truncate pr-4">{p.title}</h2>
              {loadingProperty && <Loader2 className="w-5 h-5 animate-spin text-[#030083]" />}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Column: Images & Details */}
            <div className="lg:w-2/3 p-0">
              {/* Image Gallery */}
              <div className="relative h-80 lg:h-[500px] bg-black group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                <img
                  src={displayImage}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/800x600?text=Error+Loading+Image'}
                />
                
                {p.images && p.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/90 p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/90 p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {p.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-8' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute top-4 right-4 z-10">
                   <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                     <Maximize className="w-4 h-4 inline mr-1" />
                     Ver Pantalla Completa
                   </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-lg">{p.zone}</span>
                    </div>
                    {p.address && (
                      <div className="text-sm text-gray-500 mb-2 pl-7">
                        {p.address}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-[#030083]">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    p.type === 'venta' 
                      ? 'bg-[#030083] text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {p.type === 'venta' ? 'Venta' : 'Alquiler'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-[#030083]" />
                    <div className="font-bold">{p.bedrooms}</div>
                    <div className="text-xs text-gray-500">Dorm.</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-[#030083]" />
                    <div className="font-bold">{p.bathrooms}</div>
                    <div className="text-xs text-gray-500">Baños</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Maximize className="w-6 h-6 mx-auto mb-2 text-[#030083]" />
                    <div className="font-bold">{p.area}m²</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xl font-bold text-[#030083] mb-3">Descripción</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {p.description}
                  </p>
                </div>

                {/* Map Section */}
                {p.latitude && p.longitude && (
                  <div className="mb-8">
                     <h4 className="text-xl font-bold text-[#030083] mb-3">Ubicación</h4>
                     <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 relative">
                        <div ref={mapRef} className="w-full h-full" />
                        {!isLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                             <div className="text-center text-gray-500">
                               {loadError ? (
                                 <span className="text-red-500">Error cargando mapa</span>
                               ) : (
                                 <>
                                   <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                   Cargando Mapa...
                                 </>
                               )}
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
              <h3 className="text-xl font-bold text-[#030083] mb-6">Consultar por esta propiedad</h3>
              
              <form onSubmit={handleEmailContact} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent text-gray-900 bg-white"
                    required
                    placeholder="Su nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent text-gray-900 bg-white"
                    required
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={contactForm.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent text-gray-900 bg-white"
                    required
                    placeholder="+54 9 11 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    name="mensaje"
                    value={contactForm.mensaje}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent resize-none text-gray-900 bg-white"
                    required
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full bg-[#030083] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Consultar vía Email
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Consultar por WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={displayImage}
            alt={p.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          {p.images && p.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Fallback Confirmation Dialog */}
      {showFallbackConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowFallbackConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-bold text-gray-900">Problema de envío</h3>
            </div>
            <p className="text-gray-600 mb-6">
              El servicio de correo automático tuvo un problema. ¿Deseas abrir tu gestor de correo para enviar el mensaje manualmente?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFallbackConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  window.open(fallbackMailtoLink, '_blank');
                  setShowFallbackConfirm(false);
                }}
                className="px-4 py-2 bg-[#030083] text-white rounded-lg hover:bg-[#0041CF] transition-colors"
              >
                Abrir Correo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PropertyModal;
