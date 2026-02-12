export const GTM_ID = 'GTM-WM7D7SPL';

export const pushEvent = (eventData) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      ...eventData,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('GTM dataLayer not initialized');
  }
};

export const pushPropertyClick = (property) => {
  pushEvent({
    event: 'property_click',
    property_id: property.id,
    property_title: property.title,
    property_price: property.price,
    property_location: property.zone || property.location
  });
};

export const pushPropertyDetailsView = (property) => {
  pushEvent({
    event: 'property_details_view',
    property_id: property.id,
    property_title: property.title,
    property_price: property.price,
    property_bedrooms: property.bedrooms,
    property_bathrooms: property.bathrooms,
    property_area: property.area,
    property_location: property.zone || property.location
  });
};

export const pushROICalculatorUse = (data) => {
  pushEvent({
    event: 'roi_calculator_use',
    initial_investment: data.initialInvestment,
    monthly_rent: data.monthlyRent,
    annual_expenses: data.annualExpenses,
    calculated_roi: data.roi,
  });
};

export const pushContactFormSubmit = (data) => {
  pushEvent({
    event: 'contact_form_submit',
    form_type: data.tipo,
    user_name: data.nombre,
    user_email: data.email,
    user_phone: data.telefono,
    message: data.mensaje ? data.mensaje.substring(0, 100) + '...' : ''
  });
};

export const pushWhatsAppClick = (source, propertyId = null) => {
  pushEvent({
    event: 'whatsapp_click',
    source_page: source,
    property_id: propertyId
  });
};

export const pushPageView = (path, title) => {
  pushEvent({
    event: 'page_view',
    page_path: path,
    page_title: title
  });
};