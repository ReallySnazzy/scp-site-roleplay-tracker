import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
    title: "SCP Site Roleplay Tracker",
    description: "SCP Site Roleplay Tracker",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-slate-950 text-slate-200">
                <Header />
                {children}
            </body>
        </html>
    );
}
