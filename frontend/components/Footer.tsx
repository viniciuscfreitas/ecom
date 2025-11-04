"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Pet Shop</h3>
            <p className="text-sm">
              Tudo que seu pet precisa com qualidade e carinho.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Dúvidas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Formas de Pagamento</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                PIX
              </div>
              <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                Cartão
              </div>
              <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                Boleto
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Ambiente Seguro</p>
              <div className="flex items-center gap-2">
                <span className="text-xs">🔒 SSL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Pet Shop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

