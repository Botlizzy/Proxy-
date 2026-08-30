// Editorial Signal reminder: use asymmetry, annotated metadata, restrained surfaces, and motion that feels physical.
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Code2,
  Github,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  MoveRight,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

// These values are intentionally not stored as readable literals in the JSX source.
// This protects against casual source scraping only; browser-visible data is never secret.
const decodeContact = (codes: number[]) => String.fromCharCode(...codes);
const contact = {
  email: decodeContact([101,108,105,106,97,104,99,104,105,110,101,99,104,101,114,101,109,111,110,97,104,64,103,109,97,105,108,46,99,111,109]),
  phone: decodeContact([43,50,51,52,57,48,51,57,55,50,55,52,57,48]),
  whatsapp: decodeContact([50,51,52,57,48,51,57,55,50,55,52,57,48]),
};

const projects = [
  {
    number: "01",
    type: "Backend systems / Node.js",
    title: "Black Proxy",
    description:
      "A practical Free Fire proxy service with key and IP access controls, shaped around a simple operator experience and dependable server-side behavior.",
    tags: ["Node.js", "Express", "Access control"],
    link: "https://github.com/Botlizzy/Proxy-",
    image: "/manus-storage/elijah-workbench-detail_0f570eb6.png",
    featured: true,
  },
  {
    number: "02",
    type: "Frontend / Product interface",
    title: "Interface studies",
    description:
      "A growing collection of thoughtful interface experiments: clear hierarchy, responsive layouts, and small moments of delight that make products easier to use.",
    tags: ["React", "Responsive UI", "Motion"],
    link: "https://github.com/Botlizzy",
    image: "/manus-storage/elijah-signal-pattern_e7f8fb25.png",
    featured: false,
  },
  {
    number: "03",
    type: "Independent builds",
    title: "The next useful thing",
    description:
      "New work is in motion. This space is reserved for the next project that earns its place here through clarity, craft, and a real reason to exist.",
    tags: ["In progress", "Open to ideas"],
    link: `mailto:${contact.email}?subject=Let's%20build%20something`,
    image: "/manus-storage/elijah-hero-editorial_42c31fbc.png",
    featured: false,
  },
];

const navItems = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["home", "work", "about", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.4, 0.8] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="site-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ONAH ELIJAH home">
          <span className="brand-mark"><img src="/manus-storage/elijah-monogram_f9e44237.png" alt="" /></span>
          <span className="brand-wordmark">ONAH ELIJAH</span>
        </a>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} className={activeSection === item.href.slice(1) ? "active" : ""} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>0{navItems.indexOf(item) + 1}</span>{item.label}
            </a>
          ))}
          <a className="nav-contact" href={`mailto:${contact.email}`}>Let's talk <ArrowUpRight size={15} /></a>
        </nav>
        <button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section id="home" className="hero section-wrap">
          <div className="section-index">01 <span>/</span> 04</div>
          <div className="hero-copy reveal-up">
            <p className="eyebrow"><span className="status-dot" /> Available for meaningful work</p>
            <h1>I build the<br /><em>part people</em><br />remember.</h1>
            <p className="hero-intro">I’m <strong>Onah Elijah</strong>, a 19-year-old developer from Nigeria. I turn ideas into clear, useful digital experiences — from dependable backend systems to interfaces that feel good to use.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">Explore my work <ArrowDownRight size={17} /></a>
              <a className="text-link" href={`mailto:${contact.email}`}>Start a conversation <MoveRight size={16} /></a>
            </div>
          </div>
          <div className="hero-visual reveal-up delay-2">
            <div className="hero-image-wrap"><img src="/manus-storage/elijah-hero-editorial_42c31fbc.png" alt="A developer working at a design desk" /></div>
            <div className="hero-note note-top">Lagos / NG<br /><span>06° 27′ N, 03° 23′ E</span></div>
            <div className="hero-note note-bottom"><span className="mono">SCROLL TO EXPLORE</span><ArrowDownRight size={17} /></div>
          </div>
          <div className="hero-side-copy">DESIGNING<br />WITH INTENT<br /><span>&amp;</span><br />BUILDING<br />WITH CARE.</div>
        </section>

        <section id="work" className="work section-wrap">
          <div className="section-heading reveal-up"><div className="section-index">02 <span>/</span> 04</div><div><p className="eyebrow">Selected work</p><h2>A few things<br /><em>I've made.</em></h2></div><p className="heading-aside">Every project is a chance to make something more understandable, more useful, or simply more human.</p></div>
          <div className="project-list">
            {projects.map((project) => (
              <article className={`project ${project.featured ? "featured" : ""} reveal-up`} key={project.number}>
                <div className="project-media"><img src={project.image} alt="" /><span className="project-number">{project.number}</span><a href={project.link} target="_blank" rel="noreferrer" className="project-arrow" aria-label={`Open ${project.title}`}><ArrowUpRight size={21} /></a></div>
                <div className="project-details"><p className="eyebrow">{project.type}</p><h3>{project.title}</h3><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a className="text-link" href={project.link} target={project.link.startsWith("http") ? "_blank" : undefined} rel="noreferrer">View project <ArrowUpRight size={15} /></a></div>
              </article>
            ))}
          </div>
          <div className="github-callout reveal-up"><Github size={21} /><p>More experiments, notes, and in-progress builds live on GitHub.</p><a className="text-link" href="https://github.com/Botlizzy" target="_blank" rel="noreferrer">Visit GitHub <ArrowUpRight size={15} /></a></div>
        </section>

        <section id="about" className="about section-wrap">
          <div className="section-index">03 <span>/</span> 04</div>
          <div className="about-layout"><div className="about-statement reveal-up"><p className="eyebrow">A little about me</p><h2>Curious by nature.<br /><em>Precise by choice.</em></h2></div><div className="about-copy reveal-up delay-1"><p>I’m early in my journey, but serious about the way I build. I care about the why behind a feature, the feeling of a well-placed interaction, and the quiet details that make software feel considered.</p><p>My best work sits at the intersection of logic and expression: systems that hold up, interfaces that communicate, and a process that stays open to better questions.</p><div className="quick-facts"><div><span>Based in</span><strong>Nigeria</strong></div><div><span>Experience</span><strong>Building in public</strong></div><div><span>Currently</span><strong>Open to collaboration</strong></div></div></div></div>
          <div className="principles reveal-up"><div><span>01</span><strong>Keep it clear</strong><p>Good work should explain itself.</p></div><div><span>02</span><strong>Care about the edges</strong><p>The small details carry the feeling.</p></div><div><span>03</span><strong>Stay in motion</strong><p>There is always a better version.</p></div></div>
        </section>

        <section id="contact" className="contact section-wrap">
          <div className="section-index">04 <span>/</span> 04</div>
          <div className="contact-layout reveal-up"><div><p className="eyebrow">Have a good idea?</p><h2>Let's make<br /><em>it real.</em></h2></div><div className="contact-card"><p>I’m open to freelance projects, collaborations, and conversations with people building something worth caring about.</p><a className="email-link" href={`mailto:${contact.email}`}>{contact.email} <ArrowUpRight size={18} /></a><div className="contact-links"><a href={`tel:${contact.phone}`}><Phone size={16} /> {contact.phone}</a><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a><a href="https://github.com/Botlizzy" target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a></div></div></div>
          <div className="contact-footer"><span>© {new Date().getFullYear()} ONAH ELIJAH</span><span>Built with intention <Sparkles size={15} /></span><a href="#home">Back to top <ArrowUpRight size={15} /></a></div>
        </section>
      </main>
    </div>
  );
}
