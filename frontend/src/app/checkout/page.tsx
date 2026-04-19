"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCarrinho();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [address, setAddress] = useState(user?.address ?? "");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Faça login para finalizar a compra.");
      router.replace("/");
    }
  }, [user, router]);

  if (items.length === 0 && !successModal) {
    router.replace("/carrinho");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1 — Create order
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        shipping_address: address,
      };
      const { data: order } = await api.post("/orders/", orderPayload);

      // 2 — Mock payment
      await api.post(`/orders/${order.id}/pay/`);

      setOrderId(order.id);
      clearCart();
      setSuccessModal(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Erro ao processar o pedido.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Endereço de Entrega</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço completo</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  placeholder="Rua, número, complemento, cidade, estado"
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Mock Payment */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Pagamento <span className="text-xs font-normal text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full ml-1">MOCK</span>
              </h2>
              <div className="space-y-4">
                <Input
                  label="Número do cartão"
                  value={cardData.number}
                  onChange={(e) => setCardData((p) => ({ ...p, number: e.target.value }))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  required
                />
                <Input
                  label="Nome no cartão"
                  value={cardData.name}
                  onChange={(e) => setCardData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="NOME SOBRENOME"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Validade"
                    value={cardData.expiry}
                    onChange={(e) => setCardData((p) => ({ ...p, expiry: e.target.value }))}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                  <Input
                    label="CVV"
                    value={cardData.cvv}
                    onChange={(e) => setCardData((p) => ({ ...p, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                * Simulação — nenhuma cobrança real será efetuada.
              </p>
            </div>

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
              Simular Pagamento — R$ {totalPrice.toFixed(2).replace(".", ",")}
            </Button>
          </form>

          {/* Order summary */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-fit">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Resumo do Pedido</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium dark:text-gray-200">
                    R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold dark:text-white">
                <span>Total</span>
                <span className="text-blue-600">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Success modal */}
      <Modal isOpen={successModal} onClose={() => router.push("/pedidos")} title="Pedido Confirmado!">
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pagamento realizado com sucesso!</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Pedido <strong>#{orderId}</strong> confirmado.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Você receberá uma confirmação em breve.</p>
          <Button
            onClick={() => router.push("/pedidos")}
            className="mt-6 w-full"
          >
            Ver meus pedidos
          </Button>
        </div>
      </Modal>
    </>
  );
}
