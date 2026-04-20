"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  quickReplies?: string[];
  time: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ─── Knowledge base ───────────────────────────────────────────────────────────

interface Intent {
  patterns: string[];
  response: string;
  quickReplies?: string[];
}

const INTENTS: Intent[] = [
  {
    patterns: ["rastrear", "rastreio", "onde esta", "meu pedido", "prazo", "demora", "chegou", "entrega"],
    response:
      "📦 Para rastrear seu pedido acesse **Meus Pedidos** no menu do perfil (é preciso estar logado).\n\nPrazos médios de entrega:\n• Sul/Sudeste: 3–5 dias úteis\n• Demais regiões: 5–10 dias úteis\n\nO código de rastreio é enviado por e-mail após o envio.",
    quickReplies: ["Meu pedido atrasou", "Como rastrear pelos Correios?", "Outro assunto"],
  },
  {
    patterns: ["atrasou", "atrasado", "nao chegou", "nao recebo", "sumiu"],
    response:
      "😕 Que chateação! Para resolver:\n1. Confira o código de rastreio em **Meus Pedidos**\n2. Se o status não atualizar há mais de **3 dias úteis**, entre em contato:\n📧 suporte@shopfull.com.br\n📲 WhatsApp (11) 99999-9999\n\nNosso time responde em até 4h úteis.",
    quickReplies: ["Cancelar pedido", "Falar com atendente", "Outro assunto"],
  },
  {
    patterns: ["troca", "trocar", "devolu", "devolver", "reembolso", "reembolsar", "produto errado", "nao gostei"],
    response:
      "🔄 **Política de Trocas e Devoluções**\n\n• Prazo: 7 dias corridos após receber o produto\n• Produto sem uso e na embalagem original\n• Frete de devolução por nossa conta\n\nPara iniciar: acesse **Meus Pedidos** → Solicitar Troca/Devolução.",
    quickReplies: ["Prazo do reembolso", "Como embalar?", "Falar com atendente"],
  },
  {
    patterns: ["prazo reembolso", "quando recebo", "dinheiro de volta", "estorno", "reembolso prazo"],
    response:
      "💰 **Prazos de reembolso após aprovação:**\n\n• Cartão de crédito: 1 a 2 faturas (30–60 dias)\n• PIX ou Boleto: até 5 dias úteis na conta\n\nVocê recebe um e-mail assim que a devolução for aprovada.",
    quickReplies: ["Iniciar devolução", "Falar com atendente", "Voltar ao início"],
  },
  {
    patterns: ["pagamento", "pagar", "boleto", "pix", "cartao", "parcela", "bandeira", "visa", "mastercard"],
    response:
      "💳 **Formas de pagamento aceitas:**\n\n• Cartão de crédito — Visa, Mastercard, Elo, Amex, Hipercard (até 12×)\n• PIX — 5% de desconto automático\n• Boleto bancário — vence em 3 dias úteis\n\nO pagamento é processado na finalização do pedido.",
    quickReplies: ["Parcelamento sem juros?", "PIX tem desconto?", "Outro assunto"],
  },
  {
    patterns: ["parcelamento", "parcela", "minimo", "quantas vezes", "sem juros"],
    response:
      "📊 **Parcelamento no cartão:**\n\n• Acima de R$ 50 → até **6× sem juros**\n• Acima de R$ 200 → até **12× sem juros**\n• Valor mínimo por parcela: R$ 10,00",
    quickReplies: ["Formas de pagamento", "Outro assunto"],
  },
  {
    patterns: ["cancelar", "cancelamento", "cancela", "desistir", "nao quero mais"],
    response:
      "❌ **Como cancelar um pedido:**\n\n• Pedidos **não enviados**: acesse Meus Pedidos → Cancelar\n• Pedidos **já enviados**: aguarde a entrega e solicite devolução\n\nApós o cancelamento, o reembolso segue os prazos normais.",
    quickReplies: ["Política de devolução", "Prazo do reembolso", "Não, mudei de ideia"],
  },
  {
    patterns: ["cupom", "desconto", "promocao", "codigo promocional", "voucher"],
    response:
      "🏷️ **Como usar cupom de desconto:**\n1. Adicione produtos ao carrinho\n2. No checkout, insira o código no campo **\"Cupom de desconto\"**\n3. Clique em Aplicar\n\n💡 Dica: cadastre-se na nossa newsletter para receber cupons exclusivos toda semana!",
    quickReplies: ["Meu cupom não funcionou", "Como me cadastrar?", "Outro assunto"],
  },
  {
    patterns: ["defeito", "quebrado", "danificado", "nao funciona", "com defeito", "problema com produto"],
    response:
      "😟 **Produto com defeito?**\n\n• Até **90 dias**: garantia legal — troca ou reparo gratuito\n• Tire fotos do defeito\n• Envie para 📧 suporte@shopfull.com.br com o número do pedido\n\nRetornaremos em até **24h úteis**. Pedimos desculpas pelo transtorno! 🙏",
    quickReplies: ["Política de troca", "Falar com atendente", "Outro assunto"],
  },
  {
    patterns: ["frete", "frete gratis", "envio", "transportadora", "correios"],
    response:
      "🚚 **Sobre o frete:**\n\n• Frete **GRÁTIS** em compras acima de R$ 199 🎉\n• Calculado pelo CEP no checkout\n• Transportadoras: Correios, Total Express, Jadlog\n\nO prazo começa a contar após a confirmação do pagamento.",
    quickReplies: ["Rastrear pedido", "Prazo de entrega", "Outro assunto"],
  },
  {
    patterns: ["cadastro", "criar conta", "registrar", "login", "senha", "esqueci senha", "conta"],
    response:
      "🔐 **Problemas com sua conta?**\n\n• **Criar conta**: clique em \"Entrar\" no menu → \"Criar conta\"\n• **Esqueci a senha**: na tela de login → \"Esqueci minha senha\" para receber o link por e-mail\n• **Não recebeu o e-mail?** Verifique a pasta de spam ou entre em contato.",
    quickReplies: ["Alterar dados cadastrais", "Falar com atendente", "Outro assunto"],
  },
  {
    patterns: ["humano", "atendente", "pessoa", "falar com alguem", "suporte humano", "quero falar"],
    response:
      "👨‍💼 **Canais de atendimento humano:**\n\n• 💬 Chat ao vivo: seg–sex, 9h–18h\n• 📧 E-mail: suporte@shopfull.com.br\n• 📲 WhatsApp: (11) 99999-9999\n\nNosso time tem SLA de resposta de até 4h úteis.",
    quickReplies: ["Enviar e-mail agora", "Abrir WhatsApp", "Continuar aqui"],
  },
];

const FALLBACK_RESPONSES = [
  "Hmm, não entendi muito bem. Pode reformular? 😅\n\nOu escolha um dos tópicos abaixo que eu te ajudo rapidinho!",
  "Não encontrei uma resposta para isso. Tente descrever o problema de outro jeito, ou fale com um de nossos atendentes.",
  "Essa eu não sei responder bem... 🤔 Mas nosso time humano pode te ajudar! Clique em \"Falar com atendente\".",
];

const FALLBACK_QUICK_REPLIES = [
  "Rastrear pedido",
  "Trocas e devoluções",
  "Formas de pagamento",
  "Falar com atendente",
];

function detectIntent(text: string): Intent | null {
  const n = normalize(text);
  let best: { intent: Intent; score: number } | null = null;

  for (const intent of INTENTS) {
    let score = 0;
    for (const pattern of intent.patterns) {
      if (n.includes(normalize(pattern))) score++;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }

  return best ? best.intent : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  from: "bot",
  text: "Olá! 👋 Sou a **Sofia**, assistente virtual da ShopFull.\n\nComo posso te ajudar hoje?",
  quickReplies: [
    "Rastrear meu pedido",
    "Trocas e devoluções",
    "Formas de pagamento",
    "Cancelar pedido",
    "Falar com atendente",
  ],
  time: now(),
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to last message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const pushBotMessage = useCallback(
    (text: string, quickReplies?: string[], delay = 1200) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const msg: Message = { id: uid(), from: "bot", text, quickReplies, time: now() };
        setMessages((prev) => [...prev, msg]);
        if (!open) setUnread((u) => u + 1);
      }, delay);
    },
    [open]
  );

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: uid(), from: "user", text: trimmed, time: now() },
      ]);
      setInput("");

      // Special quick-reply shortcuts
      const n = normalize(trimmed);

      if (n.includes("voltar ao inicio") || n.includes("nao obrigado") || n.includes("nao, obrigado")) {
        pushBotMessage(
          "Claro! 😊 Sobre o que mais posso te ajudar?",
          FALLBACK_QUICK_REPLIES
        );
        return;
      }

      if (n.includes("nao mudei de ideia") || n.includes("nao, mudei")) {
        pushBotMessage("Ótimo! Fico feliz em ajudar. Há algo mais? 😊", FALLBACK_QUICK_REPLIES);
        return;
      }

      if (n.includes("falar com atendente") || n.includes("iniciar chat com atendente")) {
        pushBotMessage(
          "👨‍💼 **Conectando ao atendimento humano...**\n\nNossos atendentes estão disponíveis seg–sex, 9h–18h.\n\n📧 suporte@shopfull.com.br\n📲 WhatsApp: (11) 99999-9999\n\nAguarde — um atendente entrará em contato em breve!",
          ["Enquanto isso, tenho mais dúvidas"]
        );
        return;
      }

      // Intent detection
      const intent = detectIntent(trimmed);
      if (intent) {
        pushBotMessage(intent.response, intent.quickReplies);
      } else {
        const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
        pushBotMessage(fallback, FALLBACK_QUICK_REPLIES);
      }
    },
    [pushBotMessage]
  );

  // Render markdown-lite: **bold**, \n → <br>
  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  }

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar chat" : "Abrir chat de suporte"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 transition-all duration-300 hover:bg-indigo-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        {open ? (
          /* X icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right
          bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ width: 360, height: 520 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-2xl bg-indigo-600 px-4 py-3 text-white">
          {/* Avatar */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            🤖
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight">Sofia</p>
            <p className="text-xs text-indigo-200">Assistente de Suporte • Online</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.from === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                }`}
              >
                {renderText(msg.text)}
              </div>
              <span suppressHydrationWarning className="text-[10px] text-gray-400 px-1">{msg.time}</span>

              {/* Quick reply buttons */}
              {msg.from === "bot" && msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1 max-w-[90%]">
                  {msg.quickReplies.map((qr) => (
                    <button
                      key={qr}
                      onClick={() => handleSend(qr)}
                      className="rounded-full border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Enviar mensagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
          <p className="mt-1 text-center text-[10px] text-gray-400">
            Assistente virtual • Respostas automáticas
          </p>
        </div>
      </div>
    </>
  );
}
