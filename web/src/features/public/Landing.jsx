import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getGamingHighlights } from "../publicApi/publicApiService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const BORDER = "#1a1a1a";
const MUTED = "#8a8f98";

const styles = {
  root: {
    fontFamily: "'Montserrat', sans-serif",
    background: DARK_BG,
    color: "#fff",
    minHeight: "100vh",
    overflowX: "hidden",
    position: "relative",
  },
  nav: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 60px",
    height: "70px",
    background: "rgba(0,0,0,0.92)",
    backdropFilter: "blur(16px)",
    borderBottom: `1px solid ${BORDER}`,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  logoIcon: {
    width: "38px",
    height: "38px",
    background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  navLinks: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  navLink: {
    padding: "8px 18px",
    color: MUTED,
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.25s ease",
    letterSpacing: "0.5px",
    background: "transparent",
    border: "none",
    textDecoration: "none",
  },
  navJoin: {
    padding: "8px 22px",
    background: CYAN,
    color: "#000",
    fontWeight: 700,
    fontSize: "15px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    letterSpacing: "1px",
    transition: "all 0.25s ease",
    boxShadow: "0 0 24px rgba(57,213,255,0.20)",
  },
  navLogin: {
    padding: "8px 22px",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    borderRadius: "8px",
    cursor: "pointer",
    border: `1px solid ${BORDER}`,
    letterSpacing: "1px",
    transition: "all 0.25s ease",
    boxShadow: "0 0 0 rgba(57,213,255,0)",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "120px 40px 80px",
    position: "relative",
  },
  heroGlow1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: `radial-gradient(circle, rgba(57,213,255,0.12) 0%, transparent 70%)`,
    top: "10%",
    left: "-10%",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: `radial-gradient(circle, rgba(57,213,255,0.08) 0%, transparent 70%)`,
    bottom: "5%",
    right: "-10%",
    pointerEvents: "none",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(57,213,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(57,213,255,0.04) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(57,213,255,0.1)",
    border: `1px solid rgba(57,213,255,0.3)`,
    borderRadius: "50px",
    padding: "6px 18px",
    fontSize: "13px",
    color: CYAN,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "28px",
    fontWeight: 600,
  },
  heroBadgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: CYAN,
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontSize: "clamp(44px, 7vw, 88px)",
    fontWeight: 900,
    lineHeight: 1.05,
    marginBottom: "24px",
    letterSpacing: "-1px",
    fontFamily: "'Montserrat', sans-serif",
  },
  heroTitleCyan: {
    color: CYAN,
    textShadow: `0 0 40px rgba(57,213,255,0.5)`,
  },
  heroSub: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: MUTED,
    maxWidth: "640px",
    lineHeight: 1.7,
    marginBottom: "16px",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 400,
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  heroTagline: {
    fontSize: "16px",
    color: CYAN,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "44px",
    opacity: 0.85,
  },
  heroCTA: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "16px 36px",
    background: CYAN,
    color: "#000",
    fontWeight: 800,
    fontSize: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    border: "none",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    transition: "all 0.25s",
    fontFamily: "'Montserrat', sans-serif",
    boxShadow: `0 0 30px rgba(57,213,255,0.35)`,
  },
  btnSecondary: {
    padding: "16px 36px",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
    fontSize: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    border: `1px solid ${BORDER}`,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    transition: "all 0.25s",
    fontFamily: "'Montserrat', sans-serif",
  },
  heroStats: {
    display: "flex",
    gap: "60px",
    marginTop: "70px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  statItem: {
    textAlign: "center",
  },
  statNum: {
    fontSize: "36px",
    fontWeight: 900,
    color: CYAN,
    fontFamily: "'Montserrat', sans-serif",
    textShadow: `0 0 20px rgba(57,213,255,0.4)`,
  },
  statLabel: {
    fontSize: "13px",
    color: MUTED,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "4px",
    fontFamily: "'Montserrat', sans-serif",
  },
  section: {
    padding: "100px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "60px",
  },
  sectionTitle: {
    fontSize: "clamp(36px, 5vw, 52px)",
    fontWeight: 900,
    letterSpacing: "-0.5px",
    fontFamily: "'Montserrat', sans-serif",
  },
  sectionCyan: { color: CYAN },
  sectionSub: {
    fontSize: "18px",
    color: MUTED,
    marginTop: "16px",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 400,
  },
  offerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  offerCard: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: "20px",
    padding: "40px 32px",
    transition: "all 0.3s",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  offerCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
  },
  offerIcon: {
    width: "60px",
    height: "60px",
    background: "rgba(57,213,255,0.1)",
    border: `1px solid rgba(57,213,255,0.2)`,
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "24px",
  },
  offerTitle: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "14px",
    letterSpacing: "0.5px",
  },
  offerDesc: {
    fontSize: "15px",
    color: MUTED,
    lineHeight: 1.7,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 400,
  },
  gamesBg: {
    background: "#050505",
    padding: "100px 0",
  },
  gamesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 60px",
  },
  gameCard: {
    background: CARD_BG,
    borderRadius: "16px",
    overflow: "hidden",
    border: `1px solid ${BORDER}`,
    transition: "all 0.3s",
    cursor: "pointer",
  },
  gameImgWrap: {
    width: "100%",
    paddingBottom: "62%",
    position: "relative",
    background: "#0d0d18",
    overflow: "hidden",
  },
  gameImgOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, transparent 50%, rgba(6,6,11,0.95) 100%)",
    zIndex: 1,
  },
  gameInfo: {
    padding: "16px 18px 20px",
    textAlign: "center",
  },
  gameName: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "6px",
    letterSpacing: "0.3px",
  },
  gameTag: {
    display: "inline-block",
    padding: "3px 10px",
    background: "rgba(57,213,255,0.1)",
    border: `1px solid rgba(57,213,255,0.2)`,
    borderRadius: "4px",
    fontSize: "11px",
    color: CYAN,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontFamily: "'Montserrat', sans-serif",
  },
  footer: {
    borderTop: `1px solid ${BORDER}`,
    padding: "30px 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerCopy: {
    fontSize: "14px",
    color: MUTED,
    fontFamily: "'Montserrat', sans-serif",
  },
  footerLinks: {
    display: "flex",
    gap: "28px",
  },
  footerLink: {
    fontSize: "14px",
    color: MUTED,
    cursor: "pointer",
    transition: "color 0.2s",
    fontFamily: "'Montserrat', sans-serif",
    background: "transparent",
    border: "none",
  },
};

const STATIC_GAMES = [
  {
    name: "Valorant",
    genre: "Tactical FPS",
    image:
      "https://www.riotgames.com/darkroom/1440/8d5c497da1c2eeec8cffa99b01abc64b:5329ca773963a5b739e98e715957ab39/ps-f2p-val-console-launch-16x9.jpg",
    priorityKey: "valorant",
  },
  {
    name: "CS:GO",
    genre: "Classic FPS",
    image:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg?t=1749053861",
    priorityKey: "counterstrike",
  },
  {
    name: "League of Legends",
    genre: "MOBA",
    image:
      "https://static.wikia.nocookie.net/leagueoflegends/images/7/7b/League_of_Legends_Cover.jpg/revision/latest/scale-to-width-down/1200?cb=20191018222445",
    priorityKey: "leagueoflegends",
  },
  {
    name: "Dota 2",
    genre: "MOBA",
    image:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_616x353.jpg?t=1769535998",
    priorityKey: "dota2",
  },
  {
    name: "Fortnite",
    genre: "Battle Royale",
    image:
      "https://dropinblog.net/34253310/files/featured/imagem-2024-09-26-103919931.png",
    priorityKey: "fortnite",
  },
  {
    name: "Apex Legends",
    genre: "Battle Royale",
    image:
      "https://www.nintendo.com/eu/media/images/assets/nintendo_switch_2_games/apexlegends_1/16x9_ApexLegends_image1600w.jpg",
    priorityKey: "apexlegends",
  },
  {
    name: "Overwatch 2",
    genre: "Team FPS",
    image:
      "https://xboxwire.thesourcemediaassets.com/sites/2/2022/10/OW2-be9287b234afbe7898ac.jpg",
    priorityKey: "overwatch2",
  },
  {
    name: "Genshin Impact",
    genre: "Action RPG",
    image:
      "https://image.api.playstation.com/vulcan/ap/rnd/202508/2602/30935168a0f21b6710dc2bd7bb37c23ed937fb9fa747d84c.png",
    priorityKey: "genshinimpact",
  },
];

const OFFERS = [
  {
    icon: "🖥️",
    title: "High-End Gaming PCs",
    desc: "Latest RTX 4090 graphics cards, Intel i9 processors, and 144Hz monitors for the ultimate gaming experience with zero lag.",
  },
  {
    icon: "🏆",
    title: "Competitive Tournaments",
    desc: "Regular tournaments with cash prizes across popular titles like Valorant, CS:GO, League of Legends, and Dota 2.",
  },
  {
    icon: "🎮",
    title: "Gaming Community",
    desc: "Join a thriving community of gamers, make friends, and participate in exclusive events, leagues, and gaming sessions.",
  },
];

function normalizeGameName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getGenreFromApiGame(game) {
  const firstGenre = Array.isArray(game.genres) ? game.genres[0] : null;

  if (typeof firstGenre === "string") {
    return firstGenre;
  }

  if (firstGenre?.name) {
    return firstGenre.name;
  }

  return "Popular Game";
}

function NavLink({ children, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      style={{
        ...styles.navLink,
        color: hovered ? "#fff" : MUTED,
        background: hovered ? "rgba(255,255,255,0.06)" : "transparent",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function OfferCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.offerCard,
        borderColor: hovered ? `rgba(57,213,255,0.4)` : BORDER,
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? `0 20px 60px rgba(57,213,255,0.12)` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.offerCardAccent} />
      <div style={styles.offerIcon}>{icon}</div>
      <div style={styles.offerTitle}>{title}</div>
      <div style={styles.offerDesc}>{desc}</div>
    </div>
  );
}

function GameCard({ name, genre, image, source }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.gameCard,
        borderColor: hovered ? `rgba(57,213,255,0.35)` : BORDER,
        transform: hovered ? "translateY(-4px) scale(1.02)" : "none",
        boxShadow: hovered ? `0 16px 40px rgba(57,213,255,0.1)` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.gameImgWrap}>
        <img
          src={image}
          alt={name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
        <div style={styles.gameImgOverlay} />
      </div>
      <div style={styles.gameInfo}>
        <div style={styles.gameName}>{name}</div>
        <span style={styles.gameTag}>{source ? `${genre} • API` : genre}</span>
      </div>
    </div>
  );
}

export default function ByteZoneLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [apiGames, setApiGames] = useState([]);

  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const targetSection = location.state?.scrollTo;

    if (!targetSection) {
      return;
    }

    setTimeout(() => {
      scrollToSection(targetSection);
    }, 150);
  }, [location.state]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await getGamingHighlights();

        const mappedGames = (response.data || [])
          .filter((game) => game?.name && game?.background)
          .map((game) => ({
            name: game.name,
            genre: getGenreFromApiGame(game),
            image: game.background,
            priorityKey: normalizeGameName(game.name),
            source: "RAWG API",
          }));

        setApiGames(mappedGames);
      } catch {
        setApiGames([]);
      }
    }

    loadGames();
  }, []);

  const findApiGame = (keywords) =>
    apiGames.find((game) => {
      const normalizedName = normalizeGameName(game.name);
      return keywords.some((keyword) => normalizedName.includes(keyword));
    });

  const valorantApiGame = findApiGame(["valorant"]);

  const counterStrikeApiGame = findApiGame([
    "counterstrike",
    "counterstrikeglobaloffensive",
    "counterstrike2",
    "csgo",
  ]);

  const priorityGames = [
    valorantApiGame || STATIC_GAMES[0],
    counterStrikeApiGame || STATIC_GAMES[1],
  ];

  const alreadyUsedNames = new Set(
    priorityGames.map((game) => normalizeGameName(game.name)),
  );

  const remainingApiGames = apiGames.filter(
    (game) => !alreadyUsedNames.has(normalizeGameName(game.name)),
  );

  const remainingStaticGames = STATIC_GAMES.slice(2).filter(
    (game) => !alreadyUsedNames.has(normalizeGameName(game.name)),
  );

  const landingGames =
    apiGames.length > 0
      ? [...priorityGames, ...remainingApiGames, ...remainingStaticGames].slice(
          0,
          8,
        )
      : STATIC_GAMES;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000000; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-anim > * { animation: fadeUp 0.7s ease both; }
        .hero-anim > *:nth-child(1) { animation-delay: 0.1s; }
        .hero-anim > *:nth-child(2) { animation-delay: 0.2s; }
        .hero-anim > *:nth-child(3) { animation-delay: 0.3s; }
        .hero-anim > *:nth-child(4) { animation-delay: 0.4s; }
        .hero-anim > *:nth-child(5) { animation-delay: 0.5s; }
        .hero-anim > *:nth-child(6) { animation-delay: 0.6s; }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(57,213,255,0.55) !important;
        }
        .btn-secondary:hover {
          border-color: rgba(57,213,255,0.4) !important;
          color: ${CYAN} !important;
        }
        .footer-link:hover { color: ${CYAN} !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: rgba(57,213,255,0.3); border-radius: 3px; }
      `}</style>

      <div style={styles.root}>
        <nav
          style={{
            ...styles.nav,
            boxShadow: scrolled ? `0 4px 30px rgba(0,0,0,0.5)` : "none",
          }}
        >
          <div style={styles.logo}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                flexShrink: 0,
              }}
            >
              <img
                src="/ByteZoneLogo.png"
                alt="ByteZone Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <span style={{ color: "#fff" }}>Byte</span>
            <span style={{ color: CYAN }}>Zone</span>
          </div>

          <div style={styles.navLinks}>
            <NavLink onClick={() => scrollToSection("what-we-offer")}>
              About
            </NavLink>
            <NavLink onClick={() => scrollToSection("available-games")}>
              Games
            </NavLink>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={styles.navLogin}
              onClick={() => navigate("/login")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = CYAN;
                e.currentTarget.style.color = CYAN;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 0 24px rgba(57,213,255,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 0 rgba(57,213,255,0)";
              }}
            >
              Login
            </button>

            <button
              style={styles.navJoin}
              onClick={() => navigate("/register")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#00b5f8";
                e.currentTarget.style.transform =
                  "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 0 36px rgba(57,213,255,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = CYAN;
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 24px rgba(57,213,255,0.20)";
              }}
            >
              Join Now
            </button>
          </div>
        </nav>

        <section style={styles.hero}>
          <div style={styles.heroGrid} />
          <div style={styles.heroGlow1} />
          <div style={styles.heroGlow2} />

          <div
            className="hero-anim"
            style={{ position: "relative", zIndex: 2 }}
          >
            <div style={styles.heroBadge}>
              <div style={styles.heroBadgeDot} />
              Now Open · Premium Gaming Cafe
            </div>

            <h1 style={styles.heroTitle}>
              <span>Welcome to </span>
              <span style={styles.heroTitleCyan}>ByteZone</span>
            </h1>

            <p style={styles.heroSub}>
              The ultimate gaming destination with high-performance PCs,
              competitive tournaments, and a vibrant community of gamers.
            </p>

            <p style={styles.heroTagline}>Your impact will last a lifetime</p>

            <div style={styles.heroCTA}>
              <button
                className="btn-primary"
                style={styles.btnPrimary}
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button
                className="btn-secondary"
                style={styles.btnSecondary}
                onClick={() => scrollToSection("what-we-offer")}
              >
                Learn More
              </button>
            </div>

            <div style={styles.heroStats}>
              {[
                { num: "500+", label: "Active Members" },
                { num: "50+", label: "Gaming PCs" },
                { num: "24/7", label: "Open Hours" },
                { num: "100+", label: "Tournaments" },
              ].map((s) => (
                <div key={s.label} style={styles.statItem}>
                  <div style={styles.statNum}>{s.num}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div
          id="what-we-offer"
          style={{ padding: "0 0 20px", background: DARK_BG }}
        >
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                What We <span style={styles.sectionCyan}>Offer</span>
              </h2>
              <p style={styles.sectionSub}>
                Experience gaming like never before with our premium facilities
              </p>
            </div>
            <div style={styles.offerGrid}>
              {OFFERS.map((o) => (
                <OfferCard key={o.title} {...o} />
              ))}
            </div>
          </div>
        </div>

        <div id="available-games" style={styles.gamesBg}>
          <div style={{ ...styles.sectionHeader, padding: "0 60px 50px" }}>
            <h2 style={styles.sectionTitle}>
              Available <span style={styles.sectionCyan}>Games</span>
            </h2>
            <p style={styles.sectionSub}>
              Play the most popular games on our high-performance systems
            </p>
          </div>
          <div style={styles.gamesGrid}>
            {landingGames.map((g) => (
              <GameCard key={g.name} {...g} />
            ))}
          </div>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerCopy}>
            © 2026 ByteZone. All rights reserved.
          </div>
          <div style={styles.footerLinks}>
            <button
              className="footer-link"
              style={styles.footerLink}
              onClick={() => scrollToSection("what-we-offer")}
            >
              About
            </button>
            <button
              className="footer-link"
              style={styles.footerLink}
              onClick={() => scrollToSection("available-games")}
            >
              Games
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
