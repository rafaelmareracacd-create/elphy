import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Elphy - Seu Assistente de Estudos Inteligente",
        template: "%s | Elphy"
    },
    description: "Domine seus estudos com o Elphy. Inteligência artificial para prever tendências de exames, organizar materiais e otimizar seu cronograma. Nunca esqueça o que aprendeu. 🐘",
    keywords: ["estudos", "IA", "educação", "organizacão", "concursos", "vestibular", "aprendizado", "repetição espaçada", "anki"],
    authors: [{ name: "Elphy EdTech" }],
    creator: "Elphy EdTech",
    publisher: "Elphy EdTech",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://elphy.com.br'), // Placeholder URL
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Elphy - Smart Study Assistant",
        description: "Remember Everything with AI-powered study tools. 🐘",
        url: 'https://elphy.com.br',
        siteName: 'Elphy',
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Elphy - Smart Study Assistant",
        description: "Remember Everything with AI-powered study tools. 🐘",
        creator: '@elphy_edu',
    },
    icons: {
        icon: "/mascot.png",
        apple: "/mascot.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>{children}</body>
        </html>
    );
}
