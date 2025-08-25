import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function HeroWhatsAppButton() {
  return (
    <Link
      href="https://wa.me/5492995217189?text=Hola%20quisiera%20consultar%20por%20una%20sesion%20de%20kinesiologia%20a%20domicilio"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hacé tu consulta por WhatsApp (se abre en una nueva pestaña)"
      className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:bg-green-600 dark:hover:bg-green-500"
    >
      <WhatsAppIcon className="mr-2 h-6 w-6" />
      <span>Hacé tu consulta</span>
    </Link>
  );
}
