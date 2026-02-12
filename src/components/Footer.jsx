import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Facebook, MapPin, MessageCircle } from 'lucide-react';
import { pushWhatsAppClick } from '@/lib/gtm';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // Using the provided Rinova white logo URL
  const logoUrl = "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/cbc9549870028028604ab7b6f5c00aed.png";
  const whatsAppNumber = "5491153413959";

  const handleWhatsAppClick = () => {
    pushWhatsAppClick('footer_link');
  };

  return (
    <footer className="bg-[#030083] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div>
            <div className="mb-6">
              <img 
                src={logoUrl} 
                alt="Rinova" 
                className="h-10 md:h-12 w-auto" 
              />
            </div>
            <p className="text-gray-200 mb-4">
              Asesoramiento especializado en inversiones inmobiliarias en Punta del Este.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/rinova.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/rinova.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-lg font-semibold mb-4 block">Enlaces Rápidos</span>
            <nav className="space-y-2">
              <Link
                to="/"
                className="block text-gray-200 hover:text-white transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/propiedades"
                className="block text-gray-200 hover:text-white transition-colors"
              >
                Propiedades
              </Link>
              <Link
                to="/calculadora"
                className="block text-gray-200 hover:text-white transition-colors"
              >
                Calculadora ROI
              </Link>
              <Link
                to="/contacto"
                className="block text-gray-200 hover:text-white transition-colors"
              >
                Contacto
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <span className="text-lg font-semibold mb-4 block">Contacto</span>
            <div className="space-y-3">
              <a
                href={`tel:+${whatsAppNumber}`}
                className="flex items-center text-gray-200 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                <span>+54 9 11 5341-3959</span>
              </a>
              <a
                href={`https://wa.me/${whatsAppNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-200 hover:text-white transition-colors"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>WhatsApp Directo</span>
              </a>
              <a
                href="mailto:ornella.vietagizzi@gmail.com"
                className="flex items-center text-gray-200 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                <span>ornella.vietagizzi@gmail.com</span>
              </a>
              <div className="flex items-start text-gray-200">
                <MapPin className="w-5 h-5 mr-2 mt-1" />
                <span>Punta del Este, Uruguay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-300">
          <p>
            &copy; {currentYear} Rinova. Todos los derechos reservados. Desarrollado por{' '}
            <a
              href="https://vektra.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-200 hover:text-white transition-colors"
            >
              Vektra
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
