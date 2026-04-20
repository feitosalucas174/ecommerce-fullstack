"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// ── Card brand detection ────────────────────────────────────────
type Brand = "visa" | "mastercard" | "elo" | "amex" | "hipercard" | null;

function detectBrand(num: string): Brand {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]))/.test(n)) return "mastercard";
  if (/^(34|37)/.test(n)) return "amex";
  if (/^(6062|6370|6363|636368)/.test(n)) return "elo";
  if (/^(6062|6370|637095|637609|637612)/.test(n)) return "hipercard";
  return null;
}

function formatCard(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
function formatExpiry(val: string) {
  return val.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");
}
function formatCep(val: string) {
  return val.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

// ── Brand logo SVGs ─────────────────────────────────────────────
function BrandLogo({ brand }: { brand: Brand }) {
  if (!brand) return null;
  const logos: Record<string, React.ReactNode> = {
    visa: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <text x="0" y="13" fontSize="14" fontWeight="900" fontFamily="Arial" fill="#1A1F71">VISA</text>
      </svg>
    ),
    mastercard: (
      <svg viewBox="0 0 38 24" className="h-5 w-auto">
        <circle cx="15" cy="12" r="10" fill="#EB001B" />
        <circle cx="23" cy="12" r="10" fill="#F79E1B" />
        <path d="M19 5.4a10 10 0 010 13.2A10 10 0 0119 5.4z" fill="#FF5F00" />
      </svg>
    ),
    amex: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <text x="0" y="13" fontSize="11" fontWeight="900" fontFamily="Arial" fill="#2E77BC">AMEX</text>
      </svg>
    ),
    elo: (
      <svg viewBox="0 0 38 16" className="h-5 w-auto" fill="none">
        <text x="0" y="13" fontSize="13" fontWeight="900" fontFamily="Arial" fill="#FFD700">ELO</text>
      </svg>
    ),
    hipercard: (
      <svg viewBox="0 0 70 16" className="h-5 w-auto" fill="none">
        <text x="0" y="13" fontSize="11" fontWeight="900" fontFamily="Arial" fill="#B22222">Hipercard</text>
      </svg>
    ),
  };
  return <>{logos[brand]}</>;
}

// ── Boleto mock ─────────────────────────────────────────────────
function mockBoleto() {
  const rand = () => Math.floor(Math.random() * 10);
  return `${rand()}${rand()}${rand()}${rand()}${rand()}.${rand()}${rand()}${rand()}${rand()}${rand()} ` +
    `${rand()}${rand()}${rand()}${rand()}${rand()}.${rand()}${rand()}${rand()}${rand()}${rand()}${rand()} ` +
    `${rand()}${rand()}${rand()}${rand()}${rand()}.${rand()}${rand()}${rand()}${rand()}${rand()}${rand()} ` +
    `${rand()} ${Date.now().toString().slice(-13)}`;
}

// ── PIX mock QR ─────────────────────────────────────────────────
function PixQR() {
  // Simple mock QR pattern SVG
  const cells: [number, number][] = [];
  const seed = 42;
  for (let r = 0; r < 21; r++)
    for (let c = 0; c < 21; c++) {
      const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
      const pseudo = ((r * 21 + c + seed) * 6364136223846793005) % 2 === 0;
      if (finder || pseudo) cells.push([r, c]);
    }
  return (
    <svg viewBox="0 0 21 21" className="h-40 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white p-1">
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#111" />)}
    </svg>
  );
}

type PayMethod = "card" | "boleto" | "pix";

export default function CheckoutPage() {
  const { items, totalPrice } = useCarrinho();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("card");

  // Address
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [addr, setAddr] = useState({
    logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  });

  // Card
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const brand = detectBrand(card.number);

  // Boleto code (generated once on mount)
  const [boletoCode] = useState(mockBoleto);
  const [copied, setCopied] = useState(false);

  const handleCep = async (raw: string) => {
    const formatted = formatCep(raw);
    setCep(formatted);
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado."); return; }
      setAddr((p) => ({
        ...p,
        logradouro: data.logradouro ?? "",
        bairro: data.bairro ?? "",
        cidade: data.localidade ?? "",
        uf: data.uf ?? "",
      }));
    } catch {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  const fullAddress = [
    addr.logradouro,
    addr.numero && `nº ${addr.numero}`,
    addr.complemento,
    addr.bairro,
    addr.cidade && addr.uf ? `${addr.cidade} - ${addr.uf}` : addr.cidade || addr.uf,
    cep,
  ].filter(Boolean).join(", ");

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const orderId = Math.floor(100000 + Math.random() * 900000);
    sessionStorage.setItem("order_confirmation", JSON.stringify({
      orderId,
      items,
      total: totalPrice,
      address: fullAddress || addr.logradouro || "Endereço não informado",
      cardLast4: card.number.replace(/\s/g, "").slice(-4) || "0000",
      cardName: card.name || "—",
      payMethod,
    }));
    router.push("/checkout/confirmacao");
  };

  const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40 transition-colors";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Endereço ─────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-gray-900 dark:text-white">📍 Endereço de Entrega</h2>

              {/* CEP */}
              <div className="mb-4">
                <label className={labelCls}>CEP</label>
                <div className="relative">
                  <input
                    className={inputCls}
                    value={cep}
                    onChange={(e) => handleCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                  {cepLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Rua + Número */}
              <div className="grid grid-cols-[1fr_100px] gap-3 mb-4">
                <div>
                  <label className={labelCls}>Rua / Avenida</label>
                  <input className={inputCls} value={addr.logradouro} onChange={(e) => setAddr((p) => ({ ...p, logradouro: e.target.value }))} placeholder="Preenchido automaticamente" required />
                </div>
                <div>
                  <label className={labelCls}>Número</label>
                  <input className={inputCls} value={addr.numero} onChange={(e) => setAddr((p) => ({ ...p, numero: e.target.value }))} placeholder="123" required />
                </div>
              </div>

              {/* Complemento + Bairro */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelCls}>Complemento</label>
                  <input className={inputCls} value={addr.complemento} onChange={(e) => setAddr((p) => ({ ...p, complemento: e.target.value }))} placeholder="Apto, bloco..." />
                </div>
                <div>
                  <label className={labelCls}>Bairro</label>
                  <input className={inputCls} value={addr.bairro} onChange={(e) => setAddr((p) => ({ ...p, bairro: e.target.value }))} placeholder="Preenchido automaticamente" required />
                </div>
              </div>

              {/* Cidade + UF */}
              <div className="grid grid-cols-[1fr_80px] gap-3">
                <div>
                  <label className={labelCls}>Cidade</label>
                  <input className={inputCls} value={addr.cidade} onChange={(e) => setAddr((p) => ({ ...p, cidade: e.target.value }))} placeholder="Preenchido automaticamente" required />
                </div>
                <div>
                  <label className={labelCls}>UF</label>
                  <input className={inputCls} value={addr.uf} onChange={(e) => setAddr((p) => ({ ...p, uf: e.target.value }))} placeholder="SP" maxLength={2} required />
                </div>
              </div>
            </div>

            {/* ── Pagamento ────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">💳 Pagamento</h2>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">MOCK</span>
              </div>

              {/* Method tabs */}
              <div className="flex gap-2 mb-5">
                {(["card", "boleto", "pix"] as PayMethod[]).map((m) => {
                  const labels = { card: "Cartão", boleto: "Boleto", pix: "PIX" };
                  const icons  = { card: "💳", boleto: "🏦", pix: "⚡" };
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-xs font-semibold transition-all ${
                        payMethod === m
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <span className="text-lg">{icons[m]}</span>
                      {labels[m]}
                    </button>
                  );
                })}
              </div>

              {/* ── Cartão ── */}
              {payMethod === "card" && (
                <div className="space-y-4">
                  {/* Card number + brand */}
                  <div>
                    <label className={labelCls}>Número do cartão</label>
                    <div className="relative">
                      <input
                        className={inputCls}
                        value={card.number}
                        onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                      />
                      {brand && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <BrandLogo brand={brand} />
                        </div>
                      )}
                    </div>
                    {/* Brand badges */}
                    <div className="mt-2 flex items-center gap-2">
                      {(["visa","mastercard","elo","amex","hipercard"] as Brand[]).map((b) => (
                        <span key={b!} className={`transition-opacity ${brand === b ? "opacity-100" : "opacity-30"}`}>
                          <BrandLogo brand={b} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Nome no cartão</label>
                    <input className={inputCls} value={card.name} onChange={(e) => setCard((p) => ({ ...p, name: e.target.value.toUpperCase() }))} placeholder="NOME SOBRENOME" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Validade</label>
                      <input className={inputCls} value={card.expiry} onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))} placeholder="MM/AA" maxLength={5} required />
                    </div>
                    <div>
                      <label className={labelCls}>CVV</label>
                      <input className={inputCls} value={card.cvv} onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g,"").slice(0,4) }))} placeholder="123" maxLength={4} required />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Boleto ── */}
              {payMethod === "boleto" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Código de barras (mock)</p>
                    <p className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all leading-relaxed">{boletoCode}</p>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(boletoCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {copied ? "✅ Copiado!" : "📋 Copiar código"}
                    </button>
                  </div>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-3 text-xs text-amber-700 dark:text-amber-400">
                    ⏰ O boleto vence em <strong>3 dias úteis</strong>. O pedido será confirmado após o pagamento.
                  </div>
                </div>
              )}

              {/* ── PIX ── */}
              {payMethod === "pix" && (
                <div className="flex flex-col items-center gap-4">
                  <PixQR />
                  <div className="w-full rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Chave PIX (mock)</p>
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">shopfull@pagamentos.com.br</p>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText("shopfull@pagamentos.com.br"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {copied ? "✅ Copiado!" : "📋 Copiar chave"}
                    </button>
                  </div>
                  <div className="w-full rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 p-3 text-xs text-green-700 dark:text-green-400 text-center">
                    ⚡ Aprovação <strong>imediata</strong> após o pagamento via PIX.
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">* Simulação — nenhuma cobrança real será efetuada.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {isLoading ? "Processando…" : `Confirmar Pedido — R$ ${totalPrice.toFixed(2).replace(".", ",")}`}
            </button>
          </form>

          {/* ── Resumo ───────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-fit sticky top-24">
            <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">Resumo do Pedido</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-200 shrink-0">
                    R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
