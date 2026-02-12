import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { saveContact } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { pushContactFormSubmit } from '@/lib/gtm';
import { supabase } from '@/lib/customSupabaseClient';

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Selecciona una opción';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 [ContactForm] Attempting to submit form:', formData);

    if (!validateForm()) {
      console.warn('⚠️ [ContactForm] Validation failed:', errors);
      toast({
        title: "Error en el formulario",
        description: "Por favor completa todos los campos requeridos marcados en rojo.",
        variant: "error"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Supabase Database (existing logic)
      await saveContact(formData);

      // 2. GTM tracking
      pushContactFormSubmit(formData);

      // 3. Send Emails via Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          message: formData.mensaje
        }
      });

      if (emailError) {
        console.error('Email sending failed but contact saved:', emailError);
        // We might choose to warn the user or just log it, but "success" usually means DB save worked.
        // However, user specifically expects email confirmation. 
        // Let's assume critical failure if email fails for this task.
        throw new Error('Could not send confirmation email');
      }

      toast({
        title: "¡Mensaje enviado exitosamente!",
        description: "Hemos recibido tu consulta. Nos pondremos en contacto contigo a la brevedad.",
        variant: "success",
        duration: 6000
      });

      console.log('✅ [ContactForm] Form submitted and emails sent successfully');

      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipo: '',
        mensaje: ''
      });
      setErrors({});

    } catch (error) {
      console.error('❌ [ContactForm] Error submitting form:', error);
      toast({
        title: "Error al enviar mensaje",
        description: "Hubo un problema de conexión. Por favor intenta nuevamente más tarde.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8"
    >
      <h2 className="text-2xl font-bold text-[#030083] mb-6">
        Envíanos un Mensaje
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900 ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Juan Pérez"
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="juan@ejemplo.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+54 9 11 1234-5678"
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
            ¿En qué te podemos ayudar? *
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all text-gray-900 ${
              errors.tipo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una opción</option>
            <option value="alquilar">Quiero alquilar</option>
            <option value="vender">Quiero vender</option>
            <option value="invertir">Quiero invertir</option>
          </select>
          {errors.tipo && (
            <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>
          )}
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all resize-none text-gray-900 ${
              errors.mensaje ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Cuéntanos sobre tu proyecto o consulta..."
          />
          {errors.mensaje && (
            <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#030083] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Enviar Mensaje
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ContactForm;