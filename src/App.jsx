import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import './App.css'

/* ══════════════════════════════════════════════
   THEME CONTEXT
   ══════════════════════════════════════════════ */
const ThemeContext = createContext()

function useTheme() {
  return useContext(ThemeContext)
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('flowstate-theme')
    if (saved) return saved
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('flowstate-theme', theme)
  }, [theme])

  // Listen for OS-level theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('flowstate-theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

/* ══════════════════════════════════════════════
   CHAT CONTEXT  (shared open state)
   ══════════════════════════════════════════════ */
const ChatContext = createContext()

function useChatOpen() {
  return useContext(ChatContext)
}

/* ── Intersection Observer hook for reveal animations ── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════
   CHAT API SERVICE  (modular, ready for n8n)
   ══════════════════════════════════════════════ */
const API_ENDPOINT = 'https://n8nchat.agencianous.online/webhook/5c3c4872-da7e-426a-8052-bc427076e475'
// const API_ENDPOINT = 'https://n8nchat.agencianous.online/webhook-test/5c3c4872-da7e-426a-8052-bc427076e475'

function generateSessionId() {
  return 'sess_' + crypto.randomUUID()
}

async function sendChatMessage(message, sessionId) {
  const payload = { message, sessionId };

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const data = await res.json()

    // soporta distintos formatos de respuesta de n8n
    return (
      data.reply ||
      data.message ||
      data.output ||
      data.text ||
      "Recibí tu mensaje. Contame un poco más sobre lo que querés automatizar."
    )

  } catch (error) {
    console.error("Chat API error:", error)

    return "Hubo un problema conectando con el asistente. Probá nuevamente en unos segundos."
  }
}

/* ══════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const { openChat } = useChatOpen()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            Nous IA
          </a>

          <div className="navbar-links">
            <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions') }}>Soluciones</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>Cómo Funciona</a>
            <a href="#results" onClick={(e) => { e.preventDefault(); scrollTo('results') }}>Resultados</a>
          </div>

          <div className="navbar-cta">
            <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              )}
            </button>
            <button className="btn btn-primary" onClick={openChat}>Empezar</button>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
        <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions') }}>Soluciones</a>
        <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>Cómo Funciona</a>
        <a href="#results" onClick={(e) => { e.preventDefault(); scrollTo('results') }}>Resultados</a>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" style={{ margin: '0 auto' }}>
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          )}
        </button>
        <button className="btn btn-primary" onClick={() => { setMobileOpen(false); openChat() }}>Empezar</button>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════ */
function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const { openChat } = useChatOpen()

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            Automatización Inteligente para Empresas Modernas
          </div>
          <h1 className="hero-title">
            Convertí el Trabajo Repetitivo en{' '}
            <span className="highlight">Sistemas Automatizados</span>
          </h1>
          <p className="hero-subtitle">
            Diseñamos e implementamos software inteligente que automatiza operaciones,
            conecta tus herramientas y trabaja para tu empresa las 24 horas.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={openChat}>
              Empezar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button className="btn btn-secondary" onClick={() => scrollTo('how-it-works')}>
              Ver Cómo Funciona
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-graphic">
            {/* Glow rings */}
            <div className="glow-ring" />
            <div className="glow-ring" />
            <div className="glow-ring" />

            {/* Center node */}
            <div className="network-center">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
            </div>

            {/* Surrounding nodes */}
            <div className="network-container">
              <div className="network-node">
                <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              </div>
              <div className="network-node">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <div className="network-node">
                <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              </div>
              <div className="network-node">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <div className="network-node">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 2v10l7-4" /></svg>
              </div>
              <div className="network-node">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>

            {/* SVG Lines connecting nodes */}
            <svg className="network-lines" viewBox="0 0 520 520">
              <line x1="260" y1="260" x2="260" y2="80" />
              <line x1="260" y1="260" x2="100" y2="210" />
              <line x1="260" y1="260" x2="420" y2="210" />
              <line x1="260" y1="260" x2="176" y2="340" />
              <line x1="260" y1="260" x2="344" y2="340" />
              <line x1="260" y1="260" x2="260" y2="440" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   PROBLEM
   ══════════════════════════════════════════════ */
const problems = [
  { icon: '⏱', text: 'Equipos perdiendo horas en tareas repetitivas' },
  { icon: '🔗', text: 'Herramientas que no se comunican entre sí' },
  { icon: '📉', text: 'Leads y oportunidades que se pierden' },
  { icon: '📊', text: 'Procesos que no escalan' },
]

function Problem() {
  return (
    <section className="problem" id="problem">
      <div className="container">
        <Reveal>
          <span className="section-label">El Desafío</span>
          <h2 className="section-title">La Mayoría de las Empresas Siguen Operando<br />con Trabajo Manual</h2>
        </Reveal>

        <div className="problem-grid">
          {problems.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="problem-card">
                <div className="problem-icon">{p.icon}</div>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="problem-closing">La automatización cambia eso.</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   SOLUTIONS
   ══════════════════════════════════════════════ */
const solutions = [
  {
    title: 'Asistentes Impulsados por IA',
    desc: 'Sistemas inteligentes que responden, califican solicitudes y asisten a los usuarios automáticamente.',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.07A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.93-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /><circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" /></svg>
    ),
  },
  {
    title: 'Automatización de Flujos',
    desc: 'Automatizá procesos de negocio repetitivos y eliminá los pasos manuales.',
    icon: (
      <svg viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
    ),
  },
  {
    title: 'Integraciones de Sistemas',
    desc: 'Conectá tus herramientas, plataformas y datos en un flujo de trabajo unificado.',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="1" y="1" width="9" height="9" rx="2" /><rect x="14" y="1" width="9" height="9" rx="2" /><rect x="1" y="14" width="9" height="9" rx="2" /><rect x="14" y="14" width="9" height="9" rx="2" /><path d="M10 5.5h4M5.5 10v4M18.5 10v4M10 18.5h4" /></svg>
    ),
  },
  {
    title: 'Soluciones de Software a Medida',
    desc: 'Plataformas personalizadas diseñadas para soportar tus operaciones mientras crecés.',
    icon: (
      <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" /></svg>
    ),
  },
]

function Solutions() {
  return (
    <section className="solutions" id="solutions">
      <div className="container">
        <Reveal>
          <span className="section-label">Lo Que Hacemos</span>
          <h2 className="section-title">Automatización que Realmente Funciona</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Soluciones de automatización de punta a punta diseñadas para transformar el funcionamiento de tu negocio.
          </p>
        </Reveal>

        <div className="solutions-grid">
          {solutions.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="solution-card">
                <div className="solution-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   HOW IT WORKS
   ══════════════════════════════════════════════ */
const steps = [
  { num: '01', title: 'Analizamos', desc: 'Mapeamos tus flujos de trabajo actuales e identificamos oportunidades de automatización.' },
  { num: '02', title: 'Diseñamos', desc: 'Diseñamos un sistema que se adapte perfectamente a tus operaciones.' },
  { num: '03', title: 'Construimos', desc: 'Desarrollamos e integramos la automatización en tus procesos.' },
  { num: '04', title: 'Implementamos', desc: 'Tu sistema automatizado corre continuamente en segundo plano.' },
]

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <Reveal>
          <span className="section-label">Nuestro Proceso</span>
          <h2 className="section-title">Cómo Funciona</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Un proceso probado de cuatro pasos para transformar tus operaciones.
          </p>
        </Reveal>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="step">
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   RESULTS
   ══════════════════════════════════════════════ */
const results = [
  { metric: '80%', label: 'Reducción de trabajo manual' },
  { metric: '3×', label: 'Tiempos de respuesta más rápidos' },
  { metric: '90%', label: 'Menos errores operativos' },
  { metric: '∞', label: 'Escalá sin sumar más personal' },
]

function Results() {
  return (
    <section className="results" id="results">
      <div className="container">
        <Reveal>
          <span className="section-label">Impacto</span>
          <h2 className="section-title">Lo Que Ofrece la Automatización</h2>
        </Reveal>

        <div className="results-grid">
          {results.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="result-card">
                <div className="result-metric">{r.metric}</div>
                <div className="result-label">{r.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   CTA
   ══════════════════════════════════════════════ */
function CTA() {
  const { openChat } = useChatOpen()

  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <Reveal>
          <div className="cta-box">
            <h2 className="section-title">Dejá que tus Sistemas Trabajen por Vos</h2>
            <p className="section-subtitle">
              Empezá a transformar tus procesos manuales en automatización inteligente.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={openChat}>
                Iniciá tu Automatización
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <button className="btn btn-secondary" onClick={openChat}>Agendar Consulta</button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   CHAT WIDGET
   ══════════════════════════════════════════════ */
const GREETING = "¡Hola, soy el asistente de automatización. Contame un poco sobre qué proceso te gustaría automatizar. "

function ChatWidget({ isOpen, setIsOpen }) {
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETING },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const sessionId = useRef(generateSessionId())
  const bodyRef = useRef(null)

  // Auto-scroll on new message
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setSending(true)
    const reply = await sendChatMessage(text, sessionId.current)
    setMessages((m) => [...m, { role: 'assistant', text: reply }])
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chat-fab${isOpen ? ' open' : ''}`}
        onClick={() => { setIsOpen(!isOpen); setMinimized(false) }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chat-window${isOpen ? ' open' : ''}${minimized ? ' minimized' : ''}`}>
        <div className="chat-header">
          <div className="chat-avatar">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
          </div>
          <div className="chat-header-info">
            <h4>Asistente Nous</h4>
            <span>En línea • Listo para ayudar</span>
          </div>
          <div className="chat-header-actions">
            <button onClick={() => setMinimized(!minimized)} aria-label={minimized ? 'Expand' : 'Minimize'}>
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'assistant' ? (
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                )}
              </div>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-message assistant">
              <div className="chat-msg-avatar">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" /></svg>
              </div>
              <div className="chat-bubble">Escribiendo…</div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Escribí un mensaje…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || sending} aria-label="Send">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <a href="#" className="navbar-logo">
            <span className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            Nous IA
          </a>
          <span className="footer-tagline">Automatización Inteligente para Empresas Modernas</span>
        </div>

        <div className="footer-links">
          <a href="#solutions">Soluciones</a>
          <a href="#how-it-works">Proceso</a>
          <a href="#results">Resultados</a>
          <a href="mailto:hello@nousia.com">Contacto</a>
        </div>

        <div className="footer-social">
          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
          {/* Email */}
          <a href="mailto:hello@nousia.com" aria-label="Email">
            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          </a>
        </div>
      </div>

      <div className="container">
        <div className="footer-bottom">
          © {new Date().getFullYear()} Nous IA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════ */
export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const openChat = useCallback(() => setChatOpen(true), [])

  return (
    <ThemeProvider>
      <ChatContext.Provider value={{ chatOpen, openChat }}>
        <Navbar />
        <Hero />
        <Problem />
        <Solutions />
        <HowItWorks />
        <Results />
        <CTA />
        <Footer />
        <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
      </ChatContext.Provider>
    </ThemeProvider>
  )
}
