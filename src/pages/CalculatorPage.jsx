import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ROICalculator from '@/components/ROICalculator';

const CalculatorPage = () => {
  return (
    <>
      <Helmet>
        <title>Calculadora ROI Inmobiliario | Punta del Este | Rinova</title>
        <meta name="description" content="Calcula el retorno de inversión (ROI) de propiedades en Punta del Este. Herramienta gratuita para análisis de inversión inmobiliaria." />
        <meta name="keywords" content="calculadora ROI, ROI inmobiliario, retorno inversión, análisis propiedades" />
        <link rel="canonical" href="https://rinova.com/calculadora" />

        {/* Open Graph */}
        <meta property="og:title" content="Calculadora ROI Inmobiliario | Punta del Este | Rinova" />
        <meta property="og:description" content="Calcula el retorno de inversión (ROI) de propiedades en Punta del Este." />
        <meta property="og:url" content="https://rinova.com/calculadora" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#030083] mb-4">
                Calculadora de ROI
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Analiza el potencial de rentabilidad de tu inversión inmobiliaria en Punta del Este
              </p>
            </div>

            <ROICalculator />
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default CalculatorPage;