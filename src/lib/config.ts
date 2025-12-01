/**
 * Configuración del negocio - datos centralizados
 * Actualizar aquí cuando cambien los datos de contacto
 */

export const BUSINESS_CONFIG = {
  name: "Kinesiología a Domicilio Neuquén",
  shortName: "Kinesiología Neuquén",
  phone: "+54 9 299 521 7189",
  phoneClean: "5492995217189", // Para enlaces de WhatsApp/tel
  location: {
    city: "Neuquén Capital",
    region: "Neuquén",
    country: "Argentina",
    countryCode: "AR",
    coordinates: {
      latitude: -38.9516,
      longitude: -68.0591,
    },
  },
  url: "https://kinesiologiaadomicilio.vercel.app",
} as const;

/**
 * Genera una URL de WhatsApp con mensaje pre-cargado
 */
export function getWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_CONFIG.phoneClean}?text=${encodedMessage}`;
}
