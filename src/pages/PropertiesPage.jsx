
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { fetchProperties } from '@/lib/supabase';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyCard from '@/components/PropertyCard';
import PropertyModal from '@/components/PropertyModal';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    zone: 'all',
    priceRange: [0, 5000000],
    propertyType: 'all'
  });

  const loadProperties = async () => {
    try {
      console.log('🏠 [PropertiesPage] Fetching all properties from Supabase...');
      setLoading(true);
      setError(null);
      
      // Fetch all properties for client-side filtering (for now, until server-side filtering is needed)
      // Using a higher limit to get more properties
      const { data } = await fetchProperties({
        limit: 500,
        columns: 'id, title, description, price, type, zone, bedrooms, bathrooms, area, latitude, longitude, address, images'
      });
      
      console.log(`🏠 [PropertiesPage] Loaded ${data.length} properties`);
      setProperties(data);
    } catch (error) {
      console.error('❌ [PropertiesPage] Error loading properties:', error);
      setError('Hubo un problema al cargar las propiedades. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      applyFilters();
    }
  }, [filters, properties, loading, error]);

  const applyFilters = () => {
    console.log('🔍 [PropertiesPage] Applying filters:', filters);
    let filtered = [...properties];

    // Filter by type (venta/alquiler)
    if (filters.type !== 'all') {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    // Filter by zone
    if (filters.zone !== 'all') {
      filtered = filtered.filter(p => p.zone === filters.zone);
    }

    // Filter by price range
    filtered = filtered.filter(p => 
      Number(p.price) >= filters.priceRange[0] && Number(p.price) <= filters.priceRange[1]
    );

    console.log(`🔍 [PropertiesPage] Filter result: ${filtered.length} of ${properties.length} properties`);
    setFilteredProperties(filtered);
  };

  return (
    <>
      <Helmet>
        <title>Propiedades en Venta y Alquiler | Punta del Este | Rinova</title>
        <meta name="description" content="Catálogo completo de propiedades en Punta del Este. Casas, apartamentos y terrenos para inversión inmobiliaria con excelente ROI." />
        <meta name="keywords" content="propiedades Punta del Este, casas en venta, apartamentos alquiler, terrenos inversión" />
        <link rel="canonical" href="https://rinova.com.ar/propiedades" />

        {/* Open Graph */}
        <meta property="og:title" content="Propiedades en Venta y Alquiler | Punta del Este | Rinova" />
        <meta property="og:description" content="Catálogo completo de propiedades en Punta del Este para inversión." />
        <meta property="og:url" content="https://rinova.com.ar/propiedades" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto w-full"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#030083] mb-4">
                Propiedades Destacadas
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre oportunidades exclusivas de inversión en Punta del Este
              </p>
            </div>

            <PropertyFilters filters={filters} setFilters={setFilters} />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#030083]"></div>
                <p className="mt-4 text-gray-600">Cargando catálogo...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-red-100">
                <p className="text-xl text-red-600 mb-4">{error}</p>
                <button 
                  onClick={loadProperties}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#030083] text-white rounded-lg hover:bg-[#0041CF] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-xl text-gray-600 mb-2">
                  No se encontraron propiedades que coincidan con los filtros seleccionados.
                </p>
                <p className="text-gray-400">
                  Intenta ampliar tu búsqueda o limpiar los filtros.
                </p>
                <button 
                  onClick={() => setFilters({ type: 'all', zone: 'all', priceRange: [0, 5000000], propertyType: 'all' })}
                  className="mt-4 text-[#030083] font-semibold hover:underline"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 w-full">
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    onSelect={setSelectedProperty}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {selectedProperty && (
          <PropertyModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </main>
    </>
  );
};

export default PropertiesPage;
