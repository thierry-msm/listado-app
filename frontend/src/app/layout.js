// frontend/src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Importa o AuthProvider
import Navbar from "@/components/Navbar"; // Importa o componente Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Listado - Listas de Compras Compartilhadas",
  description: "Crie e gerencie listas de compras compartilhadas em tempo real.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolve toda a aplicação com o AuthProvider para disponibilizar o contexto de autenticação */}
        <AuthProvider>
          {/* A Navbar será visível em todas as páginas */}
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children} {/* Aqui as páginas específicas serão renderizadas */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}