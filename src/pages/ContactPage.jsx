import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ContactForm from '@/components/ContactForm';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contacto | Rinova - Inmobiliaria Punta del Este</title>
        <meta name="description" content="Contacta con Rinova para consultas sobre propiedades en Punta del Este. Asesoramiento inmobiliario profesional." />
        <meta name="keywords" content="contacto inmobiliaria, asesor inmobiliario, consulta propiedades" />
        <link rel="canonical" href="https://rinova.com/contacto" />

        {/* Open Graph */}
        <meta property="og:title" content="Contacto | Rinova - Inmobiliaria Punta del Este" />
        <meta property="og:description" content="Contacta con Rinova para consultas sobre propiedades en Punta del Este." />
        <meta property="og:url" content="https://rinova.com/contacto" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="section-padding">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[#030083] mb-4">
                Contáctanos
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Estamos aquí para ayudarte a tomar la mejor decisión de inversión
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ContactForm />
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-[#030083] mb-6">
                    Información de Contacto
                  </h2>

                  <div className="space-y-6">
                    <a
                      href="tel:+5491153413959"
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-[#030083] p-3 rounded-full">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#060805] mb-1">Teléfono</div>
                        <div className="text-gray-600">+54 9 11 5341-3959</div>
                      </div>
                    </a>

                    <a
                      href="mailto:ornella.vietagizzi@gmail.com"
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-[#030083] p-3 rounded-full">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#060805] mb-1">Email</div>
                        <div className="text-gray-600">ornella.vietagizzi@gmail.com</div>
                      </div>
                    </a>

                    <div className="flex items-start gap-4 p-4 rounded-lg">
                      <div className="bg-[#030083] p-3 rounded-full">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#060805] mb-1">Ubicación</div>
                        <div className="text-gray-600">Punta del Este, Uruguay</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-[#060805] mb-4">Síguenos</h3>
                    <div className="flex gap-4">
                      <a
                        href="https://www.instagram.com/rinova.ar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-full hover:shadow-lg transition-all"
                      >
                        <Instagram className="w-6 h-6 text-white" />
                      </a>
                      <a
                        href="https://www.facebook.com/rinova.ar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 p-3 rounded-full hover:shadow-lg transition-all"
                      >
                        <Facebook className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold text-[#030083] mb-4">
                    Horario de Atención
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes:</span>
                      <span className="font-semibold">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábados:</span>
                      <span className="font-semibold">10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingos:</span>
                      <span className="font-semibold">Cerrado</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ContactPage;