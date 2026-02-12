import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Página No Encontrada - Rinova</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4 max-w-2xl"
        >
          <div className="text-9xl font-bold text-[#030083] mb-4">404</div>
          <h1 className="text-4xl font-bold text-[#060805] mb-4">
            Página No Encontrada
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary inline-flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver Atrás
            </button>
          </div>
        </motion.div>
      </main>
    </>
  );
};

export default NotFoundPage;