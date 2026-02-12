import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Upload, Image as ImageIcon, Trash2, MapPin, Search } from 'lucide-react';
import { saveProperty, updateProperty } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { uploadPropertyImage } from '@/lib/storage';

const PropertyForm = ({ property, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Google Maps & Geocoding
  const { isLoaded, geocodeAddress, loadError } = useGoogleMaps();
  const [geocoding, setGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const mapRef = useRef(null);

  const [formData, setFormData] = useState(property || {
    title: '',
    description: '',
    price: '',
    type: 'venta',
    zone: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    images: [],
    latitude: -34.9011, // Default to Montevideo/Punta del Este area approximately
    longitude: -56.1645,
    address: ''
  });

  // Initialize Map when script loads
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance) {
      const initialLocation = { 
        lat: parseFloat(formData.latitude) || -34.9011, 
        lng: parseFloat(formData.longitude) || -56.1645 
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const marker = new window.google.maps.Marker({
        position: initialLocation,
        map: map,
        title: "Ubicación de la propiedad"
      });

      setMapInstance(map);
      setMarkerInstance(marker);
    }
  }, [isLoaded, mapRef, mapInstance, formData.latitude, formData.longitude]);

  // Update map marker when coordinates change
  useEffect(() => {
    if (mapInstance && markerInstance && formData.latitude && formData.longitude) {
      const location = { 
        lat: parseFloat(formData.latitude), 
        lng: parseFloat(formData.longitude) 
      };
      markerInstance.setPosition(location);
      mapInstance.panTo(location);
    }
  }, [formData.latitude, formData.longitude, mapInstance, markerInstance]);

  const handleGeocode = async () => {
    const address = formData.address;
    if (!address || address.length < 5) return;

    setGeocoding(true);
    try {
      const result = await geocodeAddress(address);
      setFormData(prev => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.formattedAddress // Update with the formatted address from Google
      }));
      
      toast({ 
        title: "Ubicación encontrada", 
        description: "Coordenadas actualizadas correctamente.",
        variant: "success"
      });

    } catch (error) {
      console.error("Geocoding failed", error);
      toast({
        title: "Error de ubicación",
        description: "No se pudo encontrar la dirección. Intenta ser más específico.",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (uploadingCount > 0) {
        toast({
          title: "Subiendo imágenes",
          description: "Esperá a que terminen de subirse las imágenes antes de guardar.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (formData.images.length === 0) {
        toast({
          title: "Imagen requerida",
          description: "Debes agregar al menos una imagen a la propiedad",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!formData.title || !formData.price || !formData.zone) {
        toast({
          title: "Campos faltantes",
          description: "Por favor completa todos los campos obligatorios.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const dataToSave = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        zone: formData.zone,
        images: formData.images,
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        address: formData.address || ''
      };

      if (property && property.id) {
        await updateProperty(property.id, dataToSave);
        toast({
          title: "¡Propiedad Actualizada!",
          description: `La propiedad "${dataToSave.title}" se ha guardado correctamente.`,
          variant: "success"
        });
      } else {
        await saveProperty(dataToSave);
        toast({
          title: "¡Propiedad Creada!",
          description: `"${dataToSave.title}" ha sido agregada al catálogo exitosamente.`,
          variant: "success"
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error al guardar",
        description: `No se pudo guardar la propiedad: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      const candidate = newImageUrl.trim();
      if (candidate.startsWith('data:image/')) {
        toast({
          title: "URL no válida",
          description: "Pegaste una imagen en base64. Usá el upload o una URL pública.",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, candidate]
      }));
      setNewImageUrl('');
    }
  };

  const processFile = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; 
    
    if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato no válido",
          description: `El archivo ${file.name} no es una imagen válida.`,
          variant: "destructive"
        });
        return;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: `La imagen ${file.name} supera el límite de 5MB.`,
        variant: "destructive"
      });
      return;
    }

    setUploadingCount((n) => n + 1);
    uploadPropertyImage(file)
      .then(({ publicUrl }) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, publicUrl]
        }));
      })
      .catch((error) => {
        toast({
          title: "Error al subir imagen",
          description: error?.message || "No se pudo subir la imagen a Storage",
          variant: "destructive"
        });
      })
      .finally(() => {
        setUploadingCount((n) => Math.max(0, n - 1));
      });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(processFile);
    e.target.value = null;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.forEach(processFile);
    }
  };

  const handleImageRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#030083]">
              {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  placeholder="Ej: Apartamento frente al mar"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all resize-none text-gray-900"
                  required
                  placeholder="Detalles importantes de la propiedad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona / Barrio *
                </label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  placeholder="Ej: Península, La Barra"
                />
              </div>
            </div>

            {/* Address & Map Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#030083]" />
                Ubicación y Mapa
              </h3>

              {loadError && (
                 <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                   Error: No se pudo cargar Google Maps. Verifique la API Key.
                 </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      onBlur={handleGeocode}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                      placeholder="Ej: 32GX+8JM, Av. Franklin Delano Roosevelt, 20000 Punta del Este"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding || !isLoaded}
                    className="px-4 py-2 bg-[#030083] text-white rounded-lg hover:bg-[#0041CF] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {geocoding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa la dirección y haz clic en Buscar (o presiona fuera) para obtener coordenadas.
                </p>
              </div>

              {/* Map Preview */}
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden relative border border-gray-300">
                <div ref={mapRef} className="w-full h-full" />
                {!isLoaded && !loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#030083] mb-2" />
                      <p className="text-sm text-gray-600">Cargando Google Maps...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500">
                <div>Lat: {formData.latitude}</div>
                <div>Lng: {formData.longitude}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dormitorios *
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baños *
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (m²) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes de la propiedad *
              </label>
              
              <div className="space-y-4">
                <div 
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center cursor-pointer",
                    isDragging 
                      ? "border-[#030083] bg-blue-50 scale-[1.01]" 
                      : "border-gray-300 hover:border-[#030083] hover:bg-gray-50"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                  />
                  
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <div className={cn(
                      "p-4 rounded-full mb-3 transition-colors",
                      isDragging ? "bg-[#030083]/10 text-[#030083]" : "bg-gray-100 text-gray-500"
                    )}>
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {isDragging ? '¡Suelta las imágenes aquí!' : 'Haz clic o arrastra imágenes aquí'}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WebP hasta 5MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="O pega una URL de imagen..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] text-gray-900 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/64?text=Error'}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 transform hover:scale-105"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading || uploadingCount > 0}
                className="flex-1 bg-[#030083] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0041CF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : uploadingCount > 0 ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Subiendo imágenes...
                  </>
                ) : (
                  property ? 'Actualizar Propiedad' : 'Crear Propiedad'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyForm;
