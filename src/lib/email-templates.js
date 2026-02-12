export const generateEmailTemplate = (data, isConfirmation = false) => {
  const { name, email, phone, contactType, message, propertyTitle } = data;
  
  // Brand Colors
  const colors = {
    primary: '#1a472a', // Deep Green
    secondary: '#c5a059', // Gold
    text: '#333333',
    background: '#f4f4f4',
    white: '#ffffff'
  };

  const logoUrl = "https://horizons-cdn.hostinger.com/3ec76b7e-a188-4498-8653-8b6320d59340/5d99a7885e6e4f94cbc42664a5976b39.jpg"; // Using a property image as fallback/logo representation if actual logo isn't available

  const headerContent = isConfirmation 
    ? "Gracias por contactarnos"
    : "Nueva Consulta de Propiedad";

  const bodyContent = isConfirmation
    ? `
      <p>Estimado/a <strong>${name}</strong>,</p>
      <p>Hemos recibido su consulta correctamente. Nuestro equipo de Rinova Real Estate revisará su mensaje y se pondrá en contacto con usted a la brevedad posible.</p>
      <p>A continuación, una copia de los detalles enviados:</p>
    `
    : `
      <p>Se ha recibido una nueva consulta a través del sitio web.</p>
      <p><strong>Detalles del contacto:</strong></p>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerContent}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.background};">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <!-- Main Container -->
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: ${colors.primary}; padding: 30px;">
                  <h1 style="color: ${colors.secondary}; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">RINOVA</h1>
                  <p style="color: ${colors.white}; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">REAL ESTATE & INVESTMENTS</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: ${colors.primary}; margin-top: 0; margin-bottom: 20px; font-size: 22px; border-bottom: 2px solid ${colors.secondary}; padding-bottom: 10px;">
                    ${headerContent}
                  </h2>
                  
                  <div style="color: ${colors.text}; font-size: 16px; line-height: 1.6;">
                    ${bodyContent}
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #f9f9f9; border-radius: 4px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 5px 0;"><strong>Propiedad:</strong> ${propertyTitle || 'Consulta General'}</p>
                          <p style="margin: 5px 0;"><strong>Tipo:</strong> ${contactType}</p>
                          <p style="margin: 5px 0;"><strong>Nombre:</strong> ${name}</p>
                          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                          <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${phone}</p>
                          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 15px 0;">
                          <p style="margin: 5px 0;"><strong>Mensaje:</strong></p>
                          <p style="margin: 5px 0; font-style: italic;">"${message}"</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: ${colors.primary}; padding: 30px; text-align: center;">
                  <p style="color: ${colors.white}; margin: 0 0 10px; font-size: 14px;">
                    <strong>Rinova Real Estate</strong>
                  </p>
                  <p style="color: #cccccc; margin: 0 0 20px; font-size: 12px;">
                    Punta del Este, Uruguay
                  </p>
                  
                  <div style="margin-bottom: 20px;">
                    <a href="mailto:info@rinova.com.ar" style="color: ${colors.secondary}; text-decoration: none; margin: 0 10px; font-size: 14px;">info@rinova.com.ar</a>
                    <span style="color: ${colors.secondary};">|</span>
                    <a href="mailto:ornella.vietagizzi@gmail.com" style="color: ${colors.secondary}; text-decoration: none; margin: 0 10px; font-size: 14px;">ornella.vietagizzi@gmail.com</a>
                  </div>

                  <p style="color: #888888; margin: 0; font-size: 11px;">
                    © ${new Date().getFullYear()} Rinova Real Estate. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Social Links (Outside main container) -->
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
              <tr>
                <td align="center">
                  <a href="https://instagram.com" style="color: ${colors.primary}; text-decoration: none; margin: 0 10px; font-weight: bold;">Instagram</a>
                  <a href="https://facebook.com" style="color: ${colors.primary}; text-decoration: none; margin: 0 10px; font-weight: bold;">Facebook</a>
                  <a href="https://wa.me/5491153413959" style="color: ${colors.primary}; text-decoration: none; margin: 0 10px; font-weight: bold;">WhatsApp</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};