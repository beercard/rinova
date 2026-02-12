import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const PropertyFilters = ({ filters, setFilters }) => {
  const zones = ['all', 'Playa Brava', 'Playa Mansa', 'La Barra', 'José Ignacio', 'Península'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 mb-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-[#030083]" />
        <h2 className="text-xl font-bold text-[#030083]">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Operación
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all"
          >
            <option value="all">Todas</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zona
          </label>
          <select
            value={filters.zone}
            onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all"
          >
            {zones.map(zone => (
              <option key={zone} value={zone}>
                {zone === 'all' ? 'Todas las zonas' : zone}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Mínimo (USD)
          </label>
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) => setFilters({
              ...filters,
              priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Máximo (USD)
          </label>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) => setFilters({
              ...filters,
              priceRange: [filters.priceRange[0], parseInt(e.target.value) || 2000000]
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all"
            placeholder="2000000"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyFilters;