import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Calculator, Loader2 } from 'lucide-react';
import { pushROICalculatorUse } from '@/lib/gtm';
import { useROISettings } from '@/hooks/useROISettings';

const ROICalculator = () => {
  const { settings, loading } = useROISettings();
  const [inputs, setInputs] = useState({
    inversionInicial: 50000,
    precioCompra: 500000,
    alquilerMensual: 3500,
    gastosAnuales: 10000,
    anosProyeccion: 10,
    apreciacionAnual: 5
  });

  const [results, setResults] = useState({
    roiAnual: 0,
    roiTotal: 0,
    flujoCajaMensual: 0,
    valorFuturo: 0,
    ingresosTotales: 0,
    gananciaTotal: 0
  });

  const timerRef = useRef(null);

  // Update inputs when settings are loaded
  useEffect(() => {
    if (!loading) {
      setInputs(prev => ({
        ...prev,
        apreciacionAnual: settings.annual_return_percentage,
        // We can optionally use other settings to pre-fill or calculate defaults
        // For example, if we wanted to auto-calculate expenses based on rent:
        // gastosAnuales: (prev.alquilerMensual * 12 * settings.operational_expenses_percentage) / 100
      }));
    }
  }, [loading, settings]);

  useEffect(() => {
    calculateROI();
  }, [inputs, settings]); // Re-calculate if settings change

  const calculateROI = () => {
    const {
      inversionInicial,
      precioCompra,
      alquilerMensual,
      gastosAnuales,
      anosProyeccion,
      apreciacionAnual
    } = inputs;

    // Ingresos anuales por alquiler
    const ingresosAnuales = alquilerMensual * 12;
    
    // Ganancia neta anual
    const gananciaNeta = ingresosAnuales - gastosAnuales;
    
    // ROI anual
    const roiAnual = (gananciaNeta / inversionInicial) * 100;
    
    // Valor futuro de la propiedad
    const valorFuturo = precioCompra * Math.pow(1 + apreciacionAnual / 100, anosProyeccion);
    
    // Ingresos totales por alquiler
    const ingresosTotales = ingresosAnuales * anosProyeccion;
    
    // Apreciación del capital
    const apreciacionCapital = valorFuturo - precioCompra;
    
    // Ganancia total
    const gananciaTotal = ingresosTotales - (gastosAnuales * anosProyeccion) + apreciacionCapital;
    
    // ROI total
    const roiTotal = (gananciaTotal / inversionInicial) * 100;
    
    // Flujo de caja mensual
    const flujoCajaMensual = alquilerMensual - (gastosAnuales / 12);

    setResults({
      roiAnual: roiAnual.toFixed(2),
      roiTotal: roiTotal.toFixed(2),
      flujoCajaMensual: flujoCajaMensual.toFixed(2),
      valorFuturo: valorFuturo.toFixed(0),
      ingresosTotales: ingresosTotales.toFixed(0),
      gananciaTotal: gananciaTotal.toFixed(0)
    });

    // Debounce GTM event tracking
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      pushROICalculatorUse({
        initialInvestment: inversionInicial,
        monthlyRent: alquilerMensual,
        annualExpenses: gastosAnuales,
        roi: roiAnual.toFixed(2)
      });
    }, 2000); // Wait for 2 seconds of inactivity before sending event
  };

  const handleInputChange = (field, value) => {
    setInputs({
      ...inputs,
      [field]: parseFloat(value) || 0
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#030083]" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-[#030083]" />
          <h2 className="text-2xl font-bold text-[#030083]">Datos de Inversión</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inversión Inicial (USD)
            </label>
            <input
              type="number"
              value={inputs.inversionInicial}
              onChange={(e) => handleInputChange('inversionInicial', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Capital inicial disponible para la inversión
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Compra (USD)
            </label>
            <input
              type="number"
              value={inputs.precioCompra}
              onChange={(e) => handleInputChange('precioCompra', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alquiler Mensual (USD)
            </label>
            <input
              type="number"
              value={inputs.alquilerMensual}
              onChange={(e) => handleInputChange('alquilerMensual', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gastos Anuales (USD)
            </label>
            <input
              type="number"
              value={inputs.gastosAnuales}
              onChange={(e) => handleInputChange('gastosAnuales', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluye mantenimiento, impuestos, seguros (Ref: {settings.operational_expenses_percentage}% sugerido)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años de Proyección
            </label>
            <input
              type="number"
              value={inputs.anosProyeccion}
              onChange={(e) => handleInputChange('anosProyeccion', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
              min="1"
              max="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apreciación Anual (%)
            </label>
            <input
              type="number"
              value={inputs.apreciacionAnual}
              onChange={(e) => handleInputChange('apreciacionAnual', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900"
              step="0.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimación de crecimiento anual del valor de la propiedad
            </p>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-[#030083]" />
            <h2 className="text-2xl font-bold text-[#030083]">Resultados</h2>
          </div>

          <div className="grid gap-6">
            {/* ROI Anual */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ROI Anual</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600">
                {results.roiAnual}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Retorno anual sobre inversión inicial
              </p>
            </div>

            {/* ROI Total */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ROI Total ({inputs.anosProyeccion} años)</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {results.roiTotal}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Retorno total incluyendo apreciación
              </p>
            </div>

            {/* Flujo de Caja */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Flujo de Caja Mensual</span>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {formatCurrency(results.flujoCajaMensual)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Ingreso neto mensual después de gastos
              </p>
            </div>

            {/* Valor Futuro */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Valor Futuro</span>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(results.valorFuturo)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Valor proyectado de la propiedad
              </p>
            </div>

            {/* Ganancia Total */}
            <div className="bg-gradient-to-br from-[#030083] to-[#0041CF] p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ganancia Total</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(results.gananciaTotal)}
              </div>
              <p className="text-xs text-white/80 mt-2">
                Ganancia neta total en {inputs.anosProyeccion} años
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-[#030083] mb-3">💡 Información Importante</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Las proyecciones son estimaciones basadas en los datos ingresados</li>
            <li>• El mercado inmobiliario puede variar según condiciones económicas</li>
            <li>• Consulta con nuestros expertos para un análisis personalizado</li>
            <li>• Considera factores adicionales como vacancia y mantenimiento extraordinario</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ROICalculator;