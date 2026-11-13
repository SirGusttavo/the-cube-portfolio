import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { I18nProvider } from "@/i18n/I18nProvider";
import { WindowManagerProvider } from "@/contexts/WindowManager";
import { translate } from "@/i18n";

// Metadados estáticos no idioma padrão; o cliente atualiza <title> e <html lang> ao trocar de idioma.
export const metadata: Metadata = {
  title: translate("pt-BR", "meta.title"),
  description: translate("pt-BR", "meta.description"),
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <I18nProvider>
          <WindowManagerProvider>{children}</WindowManagerProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
