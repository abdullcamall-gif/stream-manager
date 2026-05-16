"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    id: "netflix",
    name: "Netflix",
    price: "450",
    description: "Filmes e séries premiados em 4K.",
    logo: "/services/netflix-logo.svg",
    banner: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1200&auto=format&fit=crop",
    accent: "#E50914",
    glow: "rgba(229, 9, 20, 0.4)"
  },
  {
    id: "spotify",
    name: "Spotify",
    price: "250",
    description: "Música e podcasts sem anúncios.",
    logo: "/services/spotify-logo.svg",
    banner: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1200&auto=format&fit=crop",
    accent: "#1DB954",
    glow: "rgba(29, 185, 84, 0.4)"
  },
  {
    id: "prime",
    name: "Prime Video",
    price: "350",
    description: "Originais Amazon e milhares de filmes.",
    logo: "/services/prime-logo.svg",
    banner: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200&auto=format&fit=crop",
    accent: "#00A8E1",
    glow: "rgba(0, 168, 225, 0.4)"
  },
  {
    id: "apple-music",
    name: "Apple Music",
    price: "300",
    description: "Áudio Espacial e milhões de músicas.",
    logo: "/services/apple-music-logo.svg",
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    accent: "#FFFFFF",
    glow: "rgba(255, 255, 255, 0.3)"
  },
  {
    id: "hbo-max",
    name: "HBO Max",
    price: "450",
    description: "Blockbusters da Warner e séries épicas.",
    logo: "/services/hbo-max-logo.svg",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop",
    accent: "#991BFA",
    glow: "rgba(153, 27, 250, 0.4)"
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    price: "300",
    description: "A maior biblioteca de animes do mundo.",
    logo: "/services/crunchyroll-logo.svg",
    banner: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1200&auto=format&fit=crop",
    accent: "#F47521",
    glow: "rgba(244, 117, 33, 0.4)"
  },
  {
    id: "iptv",
    name: "IPTV",
    price: "500",
    description: "Canais ao vivo, esportes e filmes 4K.",
    logo: "/services/iptv-logo.svg",
    banner: "https://images.unsplash.com/photo-1593784991095-a205039470b6?q=80&w=1200&auto=format&fit=crop",
    accent: "#51f3e3",
    glow: "rgba(81, 243, 227, 0.4)"
  },
  {
    id: "disney",
    name: "Disney+",
    price: "400",
    description: "Disney, Marvel, Star Wars e muito mais.",
    logo: "/services/disneyplus-logo.svg",
    banner: "https://images.unsplash.com/photo-1605153864431-a2795a1b2f95?q=80&w=1200&auto=format&fit=crop",
    accent: "#006E99",
    glow: "rgba(0, 110, 153, 0.4)"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-3xl md:text-5xl text-white mb-4 font-bold tracking-tight"
          >
            Catálogo <span className="text-primary">Oficial</span>
          </motion.h2>
          <p className="font-body text-on-surface-variant text-base md:text-lg max-w-xl mx-auto opacity-70">
            Premium streaming com ativação imediata e suporte especializado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, idx) => (
            <Link key={service.id} href={`/checkout/${service.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative h-[240px] md:h-[260px] rounded-2xl overflow-hidden liquid-glass border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                style={{
                  "--glow-color": service.glow
                } as React.CSSProperties}
              >
                {/* Brand Accent Bar */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 z-20 transition-transform duration-300 scale-x-0 group-hover:scale-x-100"
                  style={{ backgroundColor: service.accent }}
                />

                {/* Banner Background */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={service.banner} 
                    alt={service.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110"
                    loading={idx < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </div>

                {/* Brand Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 40px ${service.glow}` }}
                />

                {/* Card Content */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: service.accent, boxShadow: `0 0 15px ${service.accent}` }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-headline text-2xl text-white font-black mb-2 group-hover:text-primary transition-all duration-300 tracking-tight">
                      {service.name}
                    </h3>
                    <p className="font-body text-on-surface-variant text-sm opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="font-headline text-[12px] font-bold text-white/50 tracking-wider uppercase">
                      A partir de <span className="text-white text-base ml-1">{service.price} MZN</span>
                    </span>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Support Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 liquid-glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20 shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-headline text-lg text-white font-bold">Apoio Local</h3>
              <p className="font-body text-on-surface-variant text-xs">Suporte via WhatsApp 24/7 para qualquer dúvida.</p>
            </div>
          </div>
          <button 
            onClick={() => window.open("https://wa.me/258840000000", "_blank")}
            className="w-full md:w-auto bg-primary text-black px-6 py-2.5 rounded-xl font-headline font-bold hover:bg-white transition-all duration-300 active:scale-95 shadow-lg text-sm"
          >
            Falar com Suporte
          </button>
        </motion.div>
      </div>
    </section>
  );
}


