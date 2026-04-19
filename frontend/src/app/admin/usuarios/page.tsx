"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { Table } from "@/components/ui/Table";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = (role = "") => {
    setIsLoading(true);
    const params = role ? `?role=${role}` : "";
    api.get(`/users/${params}`)
      .then((r) => setUsers(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar usuários"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      toast.success(`Usuário ${user.is_active ? "desativado" : "ativado"}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch {
      toast.error("Erro ao atualizar usuário.");
    }
  };

  const columns = [
    {
      key: "username",
      header: "Usuário",
      render: (u: User) => (
        <div>
          <p className="font-medium text-gray-900">{u.username}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: "name",
      header: "Nome",
      render: (u: User) => (
        <span className="text-gray-700">
          {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Perfil",
      render: (u: User) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
          {u.role === "admin" ? "Admin" : "Cliente"}
        </span>
      ),
    },
    {
      key: "date_joined",
      header: "Cadastro",
      render: (u: User) => (
        <span className="text-sm text-gray-500">
          {new Date(u.date_joined).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (u: User) => (
        <button
          onClick={() => toggleActive(u)}
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${u.is_active ? "bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800" : "bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800"}`}
          title={u.is_active ? "Clique para desativar" : "Clique para ativar"}
        >
          {u.is_active ? "Ativo" : "Inativo"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Usuários</h1>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {[["", "Todos"], ["customer", "Clientes"], ["admin", "Admins"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setFilter(val); load(val); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={users}
        isLoading={isLoading}
        keyExtractor={(u) => u.id}
        emptyMessage="Nenhum usuário encontrado."
      />
    </div>
  );
}
