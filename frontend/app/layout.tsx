"use client";

import "./globals.css";
import { ApolloProvider } from "@apollo/client";
import { client } from "../lib/apollo-client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import Link from "next/link";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);
export const useTheme = () => useContext(ThemeContext)!;

export default function RootLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next);
    }
  }

  return (
    <html lang="en">
      <body
        className={
          theme === "light"
            ? "bg-[#f5f6f8] text-gray-900"
            : "bg-black text-white"
        }
      >
        <ApolloProvider client={client}>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className="flex">
              <aside
                className={
                  theme === "light"
                    ? "w-64 h-screen sticky top-0 bg-white border-r border-gray-200 p-6"
                    : "w-64 h-screen sticky top-0 bg-[#0b1628] border-r border-slate-800 p-6"
                }
              >

                <h1
                  className={
                    theme === "light"
                      ? "text-2xl font-bold text-black"
                      : "text-2xl font-bold text-white"
                  }
                >
                  TaskBoard
                </h1>

                <p
                  className={
                    theme === "light"
                      ? "text-sm text-gray-700 mt-1"
                      : "text-sm text-slate-300 mt-1"
                  }
                >
                  Hasura GraphQL • Demo
                </p>

                <nav className="mt-10 space-y-3">
                  <NavItem href="/" label="Dashboard" />
                  <NavItem href="/analytics" label="Analytics" />
                </nav>

                <div className="absolute bottom-6 left-6">
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-black dark:text-white"
                  >
                    {theme === "light" ? "Dark" : "Light"}
                  </button>
                </div>
              </aside>

              <main
                className={
                  theme === "light"
                    ? "flex-1 min-h-screen p-12 bg-[#f5f6f8]"
                    : "flex-1 min-h-screen p-12 bg-black"
                }
              >
                {children}
              </main>
            </div>
          </ThemeContext.Provider>
        </ApolloProvider>
      </body>
    </html>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  const { theme } = useTheme();
  return (
    <Link
      href={href}
      className={
        theme === "light"
          ? "block px-3 py-2 rounded-xl text-sm font-medium text-black hover:bg-blue-500 hover:text-white transition"
          : "block px-3 py-2 rounded-xl text-sm font-medium text-white hover:bg-blue-500 hover:text-white transition"
      }
    >
      {label}
    </Link>
  );
}
