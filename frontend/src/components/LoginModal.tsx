"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginModal({ isOpen, onClose, onLogin }: Props) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(form.username, form.password);
      onClose();
      toast.success("Bem-vindo de volta!");
    } catch {
      toast.error("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Entrar na conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Usuário"
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          placeholder="admin"
          required
        />
        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="••••••"
          required
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Entrar
        </Button>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-center text-xs text-gray-600 dark:text-gray-400">
          Demo:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">admin</span>{" "}
          /{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">admin123</span>
        </div>
      </form>
    </Modal>
  );
}
