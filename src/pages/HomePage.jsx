
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, LineChart, HeartHandshake as Handshake, Target, Award, Users, ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Eye, RefreshCw } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import PropertyModal from '@/components/PropertyModal';
import { generateLocalBusinessSchema, generateOrganizationSchema, generateRealEstateAgentSchema } from '@/lib/seo';
import { fetchProperties } from '@/lib/supabase';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 [HomePage] Fetching featured properties...');
      
      // Optimized fetch: only get first 5, and specific columns needed for display
      const { data } = await fetchProperties({ 
        page: 1, 
        limit: 5,
        columns: 'id, title, price, type, zone, description, images'
      });
      
      if (data && data.length > 0) {
         console.log(`🏠 [HomePage] Loaded ${data.length} featured properties.`);
         setFeaturedProperties(data);
      } else {
         console.warn('⚠️ [HomePage] No properties returned from database.');
         setFeaturedProperties([]);
      }

    } catch (error) {
      console.error('❌ [HomePage] Failed to load featured properties:', error);
      setError('No se pudieron cargar las propiedades destacadas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  const nextSlide = () => {
    if (featuredProperties.length === 0) return;
    setCurrentSlide(prev => prev === featuredProperties.length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    if (featuredProperties.length === 0) return;
    setCurrentSlide(prev => prev === 0 ? featuredProperties.length - 1 : prev - 1);
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = property => {
    const message = `Hola! Estoy interesado en la propiedad: ${property.title} - ${formatPrice(property.price)}`;
    const url = `https://wa.me/5491153413959?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const services = [{
    icon: <LineChart className="w-12 h-12" />,
    title: "Análisis de Mercado",
    description: "Evaluación detallada del mercado inmobiliario local con datos actualizados y proyecciones de crecimiento."
  }, {
    icon: <MapPin className="w-12 h-12" />,
    title: "Evaluación de Zonas",
    description: "Análisis exhaustivo de ubicaciones estratégicas, infraestructura y potencial de cada zona."
  }, {
    icon: <TrendingUp className="w-12 h-12" />,
    title: "Lectura de Plusvalía",
    description: "Proyecciones profesionales de valorización a corto, mediano y largo plazo."
  }, {
    icon: <Handshake className="w-12 h-12" />,
    title: "Acompañamiento en Negociación",
    description: "Soporte estratégico durante todo el proceso de compra y negociación."
  }];

  const differentiators = [{
    icon: <Target className="w-10 h-10" />,
    title: "Enfoque Personalizado",
    description: "Cada cliente recibe un análisis único adaptado a sus objetivos de inversión."
  }, {
    icon: <Award className="w-10 h-10" />,
    title: "Expertise Profesional",
    description: "Años de experiencia en el mercado inmobiliario de Punta del Este."
  }, {
    icon: <Users className="w-10 h-10" />,
    title: "Alianza Estratégica",
    description: "No somos intermediarios, somos tu socio en cada decisión de inversión."
  }];

  const heroImageDesktop = "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/2f0bf53f6460a2fe496ec5fe8b3bbc3c.jpg";
  const heroImageMobile = "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/76d26ba3cddc302462e727b493a1b406.jpg";

  return (
    <>
      <Helmet>
        <title>Propiedades en Punta del Este | Inversión Inmobiliaria | Rinova</title>
        <meta name="description" content="Descubre propiedades premium en Punta del Este. Inversión inmobiliaria con ROI garantizado. Alquiler y venta de propiedades de lujo." />
        <meta name="keywords" content="propiedades Punta del Este, inmobiliaria Punta del Este, inversión inmobiliaria, alquiler Punta del Este, venta de propiedades, ROI inmobiliario" />
        <link rel="canonical" href="https://rinova.com/" />
        
        <meta property="og:title" content="Propiedades en Punta del Este | Inversión Inmobiliaria | Rinova" />
        <meta property="og:description" content="Descubre propiedades premium en Punta del Este. Inversión inmobiliaria con ROI garantizado." />
        <meta property="og:image" content={heroImageDesktop} />
        <meta property="og:url" content="https://rinova.com/" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify(generateLocalBusinessSchema())}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateOrganizationSchema())}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateRealEstateAgentSchema())}
        </script>
      </Helmet>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-105">
            <div 
              className="w-full h-full object-cover bg-cover bg-center hidden md:block" 
              style={{ backgroundImage: `url(${heroImageDesktop})` }}
              aria-label="Punta del Este aerial view with port and yachts"
            ></div>
            <div 
              className="w-full h-full object-cover bg-cover bg-center md:hidden" 
              style={{ backgroundImage: `url(${heroImageMobile})` }}
              aria-label="Punta del Este aerial view with buildings and beach"
            ></div>
            <div className="gradient-overlay transition-colors duration-500 group-hover:bg-blue-900/20"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }} 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            >
              Inversiones Inteligentes en Punta del Este
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md"
            >
              Transformamos tu visión de inversión en realidad con análisis profesional y acompañamiento estratégico
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }} 
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/propiedades" className="btn-primary inline-flex items-center justify-center hover:bg-[#0041CF] hover:scale-105 transition-all">
                Ver Propiedades
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/contacto" className="btn-secondary inline-flex items-center justify-center">
                Consultar Ahora
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Properties Carousel */}
        <section className="section-padding bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-[#030083] mb-4">Propiedades Destacadas</h2>
                <p className="text-xl text-gray-600">Oportunidades exclusivas seleccionadas para ti</p>
              </motion.div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#030083] mb-4"></div>
                   <p className="text-gray-500">Cargando propiedades destacadas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-red-100">
                  <p className="text-red-500 text-lg mb-4">{error}</p>
                  <button 
                    onClick={loadFeatured}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#030083] text-white rounded-lg hover:bg-[#0041CF] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                  </button>
                </div>
              ) : featuredProperties.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl shadow-xl bg-white relative">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out" 
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {featuredProperties.map(property => (
                        <div key={property.id} className="min-w-full md:flex">
                          <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-100">
                            <img 
                              src={property.images && property.images.length ? property.images[0] : 'https://via.placeholder.com/800x600?text=No+Image'} 
                              alt={property.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => e.target.src = 'https://via.placeholder.com/800x600?text=Error+Loading+Image'}
                            />
                            <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${property.type === 'venta' ? 'bg-[#030083] text-white' : 'bg-green-600 text-white'}`}>
                              {property.type === 'venta' ? 'Venta' : 'Alquiler'}
                            </span>
                          </div>
                          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                            <h3 className="text-3xl font-bold text-[#060805] mb-4">{property.title}</h3>
                            <div className="flex items-center text-gray-600 mb-6">
                              <MapPin className="w-5 h-5 mr-2" />
                              <span className="text-xl">{property.zone}</span>
                            </div>
                            <p className="text-gray-600 mb-8 line-clamp-3">{property.description}</p>
                            <div className="text-4xl font-bold text-[#030083] mb-8">
                              {formatPrice(property.price)}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <button onClick={() => setSelectedProperty(property)} className="btn-primary flex items-center justify-center gap-2">
                                <Eye className="w-5 h-5" />
                                Ver Propiedad
                              </button>
                              <button onClick={() => handleWhatsApp(property)} className="btn-secondary flex items-center justify-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Consultar Ahora
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {featuredProperties.length > 1 && (
                      <>
                        <button 
                          onClick={prevSlide} 
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:bg-white shadow-lg transition-all z-10"
                          aria-label="Previous property"
                        >
                          <ChevronLeft className="w-6 h-6 text-[#030083]" />
                        </button>
                        <button 
                          onClick={nextSlide} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:bg-white shadow-lg transition-all z-10"
                          aria-label="Next property"
                        >
                          <ChevronRight className="w-6 h-6 text-[#030083]" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {featuredProperties.length > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      {featuredProperties.map((_, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setCurrentSlide(idx)} 
                          className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-[#030083] w-8' : 'bg-gray-300'}`} 
                          aria-label={`Go to property ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                   <p className="text-gray-500 text-lg">Próximamente agregaremos propiedades destacadas.</p>
                </div>
              )}
            </div>
        </section>

        {/* Services Section */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }} 
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#030083] mb-4">
                Nuestro Diferencial
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Servicios especializados que marcan la diferencia en tu inversión
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: index * 0.1 }} 
                  className="glass-card p-6 card-hover text-center"
                >
                  <div className="text-[#030083] mb-4 flex justify-center">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#060805] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process vs Product Section */}
        <section className="section-padding bg-gradient-to-br from-[#030083] to-[#0041CF] text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }} 
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Proceso vs Producto
              </h2>
              <p className="text-xl max-w-4xl mx-auto leading-relaxed">
                No vendemos propiedades, te acompañamos en un proceso de inversión inteligente. 
                A diferencia de las inmobiliarias tradicionales que buscan cerrar ventas rápidas, 
                Rinova actúa como tu consultor boutique, priorizando tu rentabilidad a largo plazo.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6 }} 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8"
              >
                <h3 className="text-2xl font-bold mb-4">Inmobiliaria Tradicional</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Enfoque en cerrar ventas rápido</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Cartera limitada de propiedades</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Información superficial del mercado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Comisiones como único objetivo</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6 }} 
                className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border-2 border-white/30"
              >
                <h3 className="text-2xl font-bold mb-4">Rinova</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Análisis profundo de tu perfil inversor</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Acceso a todo el mercado disponible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Proyecciones basadas en datos reales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Tu rentabilidad como prioridad</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Rinova Section */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }} 
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#030083] mb-4">
                Por qué Rinova
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tu socio estratégico en inversiones inmobiliarias
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {differentiators.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: index * 0.1 }} 
                  className="glass-card p-8 card-hover"
                >
                  <div className="text-[#030083] mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#060805] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-50/50"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#030083] mb-6">
                Contáctanos Hoy
              </h2>
              <p className="text-xl text-gray-600">
                Déjanos tu consulta y un asesor se pondrá en contacto contigo a la brevedad.
              </p>
            </motion.div>
            
            <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      {/* Property Modal */}
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  );
};

export default HomePage;
