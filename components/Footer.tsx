import Link from "next/link";
import { Share2, MessageSquare, Video, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] pt-20 pb-10 border-t border-white/5 overflow-hidden">
      {/* Radial Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Social Media Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-12 border-b border-white/5 gap-6">
          <div className="font-headline text-3xl text-primary font-bold tracking-tighter">
            ElberStreaming
          </div>
          <div className="flex gap-4">
            {[Share2, MessageSquare, Video].map((Icon, idx) => (
              <Link 
                key={idx}
                href="#" 
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all group"
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16">
          <div>
            <h4 className="font-headline text-xs font-bold tracking-widest text-white uppercase mb-6">Empresa</h4>
            <ul className="flex flex-col gap-4 text-on-surface-variant font-body text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Carreiras</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-xs font-bold tracking-widest text-white uppercase mb-6">Suporte</h4>
            <ul className="flex flex-col gap-4 text-on-surface-variant font-body text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Chat ao Vivo</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Status do Sistema</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contato</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-xs font-bold tracking-widest text-white uppercase mb-6">Comunidade</h4>
            <ul className="flex flex-col gap-4 text-on-surface-variant font-body text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Discord</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Fórum</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Afiliados</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-xs font-bold tracking-widest text-white uppercase mb-6">Newsletter</h4>
            <p className="text-on-surface-variant font-body text-sm mb-4">Receba novidades e promoções exclusivas.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 w-full text-sm"
              />
              <button className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant font-body text-xs">
            © 2026 ElberStreaming. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-on-surface-variant font-body text-xs">
            <span>CNPJ: 00.000.000/0001-00</span>
            <div className="flex gap-2 opacity-50">
              <div className="w-8 h-5 bg-white/20 rounded"></div>
              <div className="w-8 h-5 bg-white/20 rounded"></div>
              <div className="w-8 h-5 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
