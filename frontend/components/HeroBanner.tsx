"use client";

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Tudo para seu pet com muito amor
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Frete Grátis acima de R$ 99
          </p>
          <a
            href="#produtos"
            className="inline-block bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Ver Produtos
          </a>
        </div>
      </div>
    </div>
  );
}

