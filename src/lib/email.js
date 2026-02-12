import { init, send } from '@emailjs/browser';
import { generateEmailTemplate } from './email-templates';

// EmailJS Credentials
// NOTE: The SMTP Key provided (xsmtpsib-...) is for the backend configuration in the EmailJS dashboard.
// It should NOT be exposed in the frontend code for security.
// We use the Public Key for client-side sending.
const SERVICE_ID = 'service_pvr0r2b';
const TEMPLATE_ID = 'template_y6b4cif';
const PUBLIC_KEY = 'lRQFpKokh0hc4f6BL';

// Initialize EmailJS
init(PUBLIC_KEY);

// Brevo requires sending FROM a verified email address.
// We cannot send AS the user (e.g., user@gmail.com).
// We must send AS the verified sender, and use Reply-To for the user's email.
const VERIFIED_SENDER = 'ventas@concretarmas.com.ar';

export const sendInquiryEmail = async (data) => {
  console.log('📧 [Email Service] Initiating email sequence...', data);

  const { name, email, phone, message } = data;

  // robust validation
  if (!name || !name.trim()) throw new Error('El nombre es requerido.');
  if (!email || !email.trim()) throw new Error('El email es requerido.');
  if (!message || !message.trim()) throw new Error('El mensaje es requerido.');
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('El formato del email no es válido.');

  // Generate HTML Content
  const adminHtml = generateEmailTemplate(data, false);
  const userHtml = generateEmailTemplate(data, true);

  // Emails to notify
  const adminEmails = 'ornella.vietagizzi@gmail.com, info@rinova.com.ar';

  try {
    // 1. Send Email to Admin
    const adminParams = {
      to_name: 'Equipo Rinova',
      to_email: adminEmails,
      from_name: name,
      from_email: VERIFIED_SENDER, // Must be the verified Brevo sender to avoid 535 error
      reply_to: email,             // Admin replies to the user
      phone_number: phone,
      message: message,
      html_content: adminHtml,
    };

    console.log('📤 [Email Service] Sending admin notification...');
    const adminResponse = await send(
      SERVICE_ID,
      TEMPLATE_ID,
      adminParams
    );

    if (adminResponse.status !== 200) {
      throw new Error(`EmailJS Error: ${adminResponse.text}`);
    }
    
    console.log('✅ [Email Service] Admin notification sent successfully.');

    // 2. Send Confirmation to User
    const userParams = {
      to_name: name,
      to_email: email,
      from_name: 'Rinova Real Estate',
      from_email: VERIFIED_SENDER, // Must be the verified Brevo sender
      reply_to: 'info@rinova.com.ar', // User replies to Rinova
      message: 'Gracias por su consulta.',
      html_content: userHtml,
    };

    console.log('📤 [Email Service] Sending user confirmation...');
    // We do this asynchronously without blocking the return to the user if it fails
    send(SERVICE_ID, TEMPLATE_ID, userParams)
      .then(() => console.log('✅ [Email Service] User confirmation sent.'))
      .catch((err) => console.warn('⚠️ [Email Service] Could not send user confirmation:', err));

    return adminResponse;

  } catch (error) {
    console.error('❌ [Email Service] Failed to send email:', error);
    
    // Transform error for UI
    let userMessage = 'No se pudo enviar el correo. Por favor intente nuevamente.';
    
    if (error.text?.includes('user_id') || error.message?.includes('Public Key')) {
      userMessage = 'Error de configuración del servicio de correo. Contacte al administrador.';
    } else if (error.message?.includes('network') || error.message?.includes('Network')) {
      userMessage = 'Error de conexión. Verifique su internet e intente nuevamente.';
    } else if (error.text?.includes('Authentication failed') || error.text?.includes('535')) {
       // This handles the Brevo specific auth error gracefully for the user
       userMessage = 'Error de autenticación del servicio de correo. Verificando credenciales...';
       console.error('🔑 [Email Service] SMTP Auth Error (535). Ensure the FROM address is verified in Brevo.');
    }

    // Attach user friendly message to error object
    error.userMessage = userMessage;
    throw error;
  }
};