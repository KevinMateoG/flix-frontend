import Link from 'next/link';
import {
  Play,
  Globe,
  BookmarkCheck,
  History,
  Sparkles,
  Tv,
  ArrowRight,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import type { LandingAudienceItem, LandingFeatureItem } from '../domain/home';

interface LandingViewProps {
  isAuthenticated?: boolean;
}

const EXPERIENCE_FEATURES: LandingFeatureItem[] = [
  {
    badge: 'Catálogo en tu región',
    title: 'Encuentra qué ver hoy en tu país',
    description:
      'Explora estrenos, clásicos y series tendencia disponibles en tu ubicación, con información clara de cada título, reparto y temporadas.',
  },
  {
    badge: 'Continúa viendo',
    title: 'Retoma cada historia justo donde la dejaste',
    description:
      'No pierdas el hilo de tus películas ni episodios. Flix recuerda tu avance automáticamente para que continúes con un solo clic.',
  },
  {
    badge: 'Mi Lista personalizada',
    title: 'Guarda tus favoritos y mejora tus recomendaciones',
    description:
      'Arma tu propia colección para el fin de semana y marca lo que no te gusta para mantener tu catálogo siempre a tu medida.',
  },
  {
    badge: 'Control familiar e idiomas',
    title: 'Perfiles adaptados para toda la casa',
    description:
      'Elige tu idioma preferido (Español, Inglés o Portugués), ajusta la clasificación por edad y activa el Modo Kids para los más pequeños.',
  },
];

const AUDIENCE_SEGMENTS: LandingAudienceItem[] = [
  {
    role: 'Amantes del cine y las series',
    title: 'Una experiencia pensada para disfrutar sin distracciones',
    description:
      'Sumérgete en tus películas favoritas con una interfaz oscura de alto contraste, avances integrados y fichas completas de elenco y episodios.',
    highlights: [
      'Búsqueda rápida de películas y series',
      'Avances oficiales y reproducción inmediata',
      'Recomendaciones de títulos similares en cada ficha',
    ],
  },
  {
    role: 'Para ver en familia',
    title: 'Entretenimiento seguro para todas las edades',
    description:
      'Configura fácilmente qué tipo de contenido puede verse en tu cuenta con filtros de clasificación por edad y controles parentales.',
    highlights: [
      'Filtro de clasificación desde todo público (G) hasta adultos (TV-MA)',
      'Modo Kids dedicado para contenido infantil',
      'Interfaz disponible en Español, Inglés y Portugués',
    ],
  },
  {
    role: 'Sin fronteras',
    title: 'Tu cine favorito te acompaña a donde vayas',
    description:
      'Cambia tu región de visualización en segundos desde tu perfil y consulta al instante el catálogo disponible en Estados Unidos, Latinoamérica o España.',
    highlights: [
      'Soporte para múltiples regiones (CO, MX, AR, BR, US, ES)',
      'Consulta de disponibilidad en servicios de streaming',
      'Sincronización constante de tu lista y progreso',
    ],
  },
];

export function LandingView({ isAuthenticated = false }: LandingViewProps) {
  return (
    <div className="bg-background text-on-background flex min-h-screen flex-col">
      {/* Top Navbar */}
      <header className="border-surface-bright/20 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-12">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-display-lg text-primary font-bold tracking-tighter"
            >
              FLIX
            </Link>
            <nav
              aria-label="Navegación principal"
              className="hidden items-center gap-6 md:flex"
            >
              <a
                href="#experiencia"
                className="text-body-sm text-muted hover:text-on-background transition-colors"
              >
                Experiencia
              </a>
              <a
                href="#para-ti"
                className="text-body-sm text-muted hover:text-on-background transition-colors"
              >
                Para ti
              </a>
              <a
                href="#beneficios"
                className="text-body-sm text-muted hover:text-on-background transition-colors"
              >
                Beneficios
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/home">
                <Button size="sm" className="gap-2">
                  <Play size={16} fill="currentColor" />
                  Ir a mi catálogo
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gap-1.5">
                    Comenzar gratis
                    <ArrowRight size={15} />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-16 pb-24 md:px-12 md:pt-24 md:pb-32">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="bg-primary/15 absolute -top-24 left-1/4 h-125 w-125 rounded-full blur-[140px]" />
            <div className="bg-primary/10 absolute right-10 bottom-0 h-96 w-96 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
            <span className="border-primary/30 bg-primary/10 text-label-caps text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
              <Sparkles size={14} />
              Cine y series en streaming
            </span>

            <h1 className="text-on-background mt-6 max-w-4xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
              Grandes historias para ver hoy,{' '}
              <span className="text-primary">cuando quieras y donde quieras.</span>
            </h1>

            <p className="text-body-lg text-muted mt-6 max-w-2xl">
              Descubre miles de películas y series, guarda tus títulos favoritos en Mi Lista y
              continúa cada episodio exactamente desde el minuto en que te quedaste.
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Link href={isAuthenticated ? '/home' : '/register'} className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 px-8">
                  <Play size={18} fill="currentColor" />
                  {isAuthenticated ? 'Continuar viendo' : 'Crear cuenta gratis'}
                </Button>
              </Link>
              <Link href="/home?demoMode=all" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full gap-2 px-8">
                  <Tv size={18} />
                  Explorar catálogo
                </Button>
              </Link>
            </div>

            {/* Key Highlights Strip */}
            <div className="border-surface-bright/30 bg-surface-container/60 mt-16 grid w-full grid-cols-2 gap-6 rounded-2xl border p-6 backdrop-blur-sm md:grid-cols-4 md:p-8">
              <div className="flex flex-col items-center gap-1">
                <span className="text-display-lg text-primary font-bold">HD</span>
                <span className="text-body-sm text-muted">Reproducción fluida al instante</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-display-lg text-on-background font-bold">6</span>
                <span className="text-body-sm text-muted">Regiones disponibles</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-display-lg text-on-background font-bold">3</span>
                <span className="text-body-sm text-muted">Idiomas (ES · EN · PT)</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-display-lg text-on-background font-bold">Kids</span>
                <span className="text-body-sm text-muted">Control parental integrado</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Experience Section */}
        <section
          id="experiencia"
          className="border-surface-bright/20 bg-surface-container-lowest border-y px-4 py-20 md:px-12"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <span className="text-label-caps text-primary">La experiencia Flix</span>
              <h2 className="text-display-lg-mobile md:text-display-lg text-on-background mt-2">
                Todo tu entretenimiento en un solo lugar, sin complicaciones
              </h2>
              <p className="text-body-lg text-muted mt-4">
                Olvídate de perder tiempo buscando qué ver. En{' '}
                <strong className="text-on-background">Flix</strong> encuentras estrenos, series
                aclamadas y recomendaciones personalizadas en una plataforma rápida y pensada para
                que solo te preocupes por darle a reproducir.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-surface-container border-surface-bright/25 flex flex-col gap-3 rounded-xl border p-6">
                <div className="bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-lg">
                  <Globe size={22} />
                </div>
                <h3 className="text-headline-sm text-on-background">
                  Cartelera adaptada a tu país
                </h3>
                <p className="text-body-sm text-muted">
                  Consulta los títulos disponibles en tu región y descubre todas las opciones para
                  verlos al instante.
                </p>
              </div>

              <div className="bg-surface-container border-surface-bright/25 flex flex-col gap-3 rounded-xl border p-6">
                <div className="bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-lg">
                  <History size={22} />
                </div>
                <h3 className="text-headline-sm text-on-background">
                  Sigue viendo sin perderte nada
                </h3>
                <p className="text-body-sm text-muted">
                  Tus películas y episodios quedan guardados en tu fila de Continuar viendo para que
                  retomes en cualquier momento.
                </p>
              </div>

              <div className="bg-surface-container border-surface-bright/25 flex flex-col gap-3 rounded-xl border p-6">
                <div className="bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-lg">
                  <BookmarkCheck size={22} />
                </div>
                <h3 className="text-headline-sm text-on-background">
                  Tu propia sala de cine
                </h3>
                <p className="text-body-sm text-muted">
                  Guarda películas para más tarde en Mi Lista, comparte tus títulos favoritos y
                  personaliza tus preferencias.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Audience Section */}
        <section id="para-ti" className="px-4 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <span className="text-label-caps text-primary">Hecho para ti</span>
              <h2 className="text-display-lg-mobile md:text-display-lg text-on-background mt-2">
                Se adapta a tu forma de ver cine y series
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {AUDIENCE_SEGMENTS.map((segment) => (
                <article
                  key={segment.role}
                  className="bg-surface-container border-surface-bright/25 flex flex-col justify-between rounded-xl border p-6"
                >
                  <div>
                    <span className="text-label-caps text-primary">{segment.role}</span>
                    <h3 className="text-headline-sm text-on-background mt-2">{segment.title}</h3>
                    <p className="text-body-sm text-muted mt-3">{segment.description}</p>
                  </div>

                  <ul className="border-surface-bright/20 mt-6 flex flex-col gap-2.5 border-t pt-4">
                    {segment.highlights.map((item) => (
                      <li
                        key={item}
                        className="text-body-sm text-on-background/90 flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="beneficios"
          className="border-surface-bright/20 bg-surface-container-lowest border-t px-4 py-20 md:px-12"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <span className="text-label-caps text-primary">Todo incluido</span>
                <h2 className="text-display-lg-mobile md:text-display-lg text-on-background mt-2">
                  Disfruta más de cada película y serie
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="border-surface-bright/40 bg-surface-container text-body-sm text-on-surface inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5">
                  <Shield size={16} className="text-primary" />
                  Cuenta gratuita y sin compromisos
                </span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {EXPERIENCE_FEATURES.map((feature) => (
                <div
                  key={feature.badge}
                  className="bg-surface-container border-surface-bright/25 flex flex-col gap-3 rounded-xl border p-6"
                >
                  <span className="text-label-caps text-primary">{feature.badge}</span>
                  <h3 className="text-headline-sm text-on-background">{feature.title}</h3>
                  <p className="text-body-sm text-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Call To Action */}
        <section className="px-4 py-20 md:px-12">
          <div className="bg-surface-container border-surface-bright/30 mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-2xl border p-8 text-center md:flex-row md:p-12 md:text-left">
            <div className="max-w-xl">
              <h2 className="text-headline-md text-on-background">
                ¿Listo para tu próxima película?
              </h2>
              <p className="text-body-lg text-muted mt-2">
                Crea tu cuenta gratis en segundos para armar tu lista y guardar tu progreso, o
                empieza a explorar la cartelera ahora mismo.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href={isAuthenticated ? '/home' : '/register'} className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2">
                  {isAuthenticated ? 'Ir al Inicio' : 'Crear cuenta gratis'}
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/browse?demoMode=all" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full">
                  Ver catálogo completo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-surface-bright/20 bg-surface-container-lowest border-t px-4 py-10 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-headline-sm text-primary font-bold tracking-tighter">FLIX</span>
            <span className="text-body-sm text-muted">
              © 2026 Flix. Todos los derechos reservados.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/home" className="text-body-sm text-muted hover:text-on-background">
              Inicio
            </Link>
            <Link href="/browse" className="text-body-sm text-muted hover:text-on-background">
              Explorar
            </Link>
            <Link href="/login" className="text-body-sm text-muted hover:text-on-background">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-body-sm text-muted hover:text-on-background">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
