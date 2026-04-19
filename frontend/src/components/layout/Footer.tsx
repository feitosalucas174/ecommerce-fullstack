export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-6 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} ShopFull — E-commerce Full-Stack Demo</p>
      <p className="mt-1 text-xs text-gray-400">
        Next.js 14 · Django REST Framework · PostgreSQL · JWT
      </p>
    </footer>
  );
}
