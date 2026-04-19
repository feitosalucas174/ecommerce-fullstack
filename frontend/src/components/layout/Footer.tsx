import Link from "next/link";

const links = {
  loja: [
    { href: "/produtos", label: "Todos os Produtos" },
    { href: "/produtos?categoria=electronics", label: "Eletrônicos" },
    { href: "/produtos?categoria=clothing", label: "Vestuário" },
    { href: "/produtos?categoria=sports", label: "Esportes" },
  ],
  conta: [
    { href: "/pedidos", label: "Meus Pedidos" },
    { href: "/carrinho", label: "Carrinho" },
    { href: "/checkout", label: "Checkout" },
  ],
  info: [
    { href: "#", label: "Sobre nós" },
    { href: "#", label: "Política de Privacidade" },
    { href: "#", label: "Termos de Uso" },
    { href: "#", label: "FAQ" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                S
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                Shop<span className="text-blue-400">Full</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              E-commerce completo com painel administrativo, gestão de estoque e
              relatórios em tempo real.
            </p>
            <div className="mt-6 flex gap-3">
              {["github", "twitter", "instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                  aria-label={s}
                >
                  <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Loja */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Loja
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.loja.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Minha Conta */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Minha Conta
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.conta.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Informações
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.info.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-gray-800 pt-8">
          {[
            { icon: "🚚", text: "Entrega rápida" },
            { icon: "🔒", text: "Pagamento seguro" },
            { icon: "↩️", text: "Devolução fácil" },
            { icon: "🎧", text: "Suporte 24/7" },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 text-sm">
              <span>{badge.icon}</span>
              <span className="text-gray-400">{badge.text}</span>
            </div>
          ))}
          <p className="ml-auto text-xs text-gray-600">
            © {new Date().getFullYear()} ShopFull · Next.js 14 · Django REST · PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
