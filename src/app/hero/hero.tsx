import Image from "next/image";

export default function HeroSection() {
  return (
    <main>
      <h1 className="font-bold">Kinesiologia A Domicilio</h1>
      <h2>Neuquen Capital</h2>
      <Image
        src="/hero-image.png"
        alt="Imagen principal de Kinesiología a Domicilio"
        width={200}
        height={150}
        className="mx-auto my-4 rounded-lg shadow"
      />
      <p>Ofrecemos servicios de kinesiología a domicilio en Neuquén Capital.</p>
      <p>Consulta por nuestros tratamientos personalizados.</p>
      <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
        <a
          href="https://wa.me/5492995217189"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contáctanos
        </a>
      </button>
    </main>
  );
}
