// Cartões de infraestrutura: a cena da baleia carregando contêineres e o painel de infraestrutura.
// Não usam a API; o conteúdo é fixo e mantido aqui.

import { esc, moldura, cabecalhoDeCartao } from "./tema.mjs";

// Pilha de contêineres, da fila de baixo para a de cima.
const CONTEINERES = [
  ["m365", "entra id", "intune", "ad", "linux"],
  ["vlans", "dns", "dhcp", "wi-fi"],
  ["firewall", "vpn", "backup"],
  ["docker", "aws"],
];
const CORES = ["#ef6c2c", "#3ddc97", "#7aa2ff", "#f2c14e", "#e5303f", "#a77bf3", "#22b8cf", "#ff8fab", "#8ce99a", "#5c7cfa"];
const COR_FIXA = { aws: "#ff9900" };
const SERVICOS_AWS = "ec2 · s3 · vpc · iam";

const CENARIO = {
  escuro: {
    ceu: ["#0b1020", "#14295a"], aguaFundo: "#13305c", aguaFrente: "#1b4a8a", ilha: "#1c2640",
  },
  claro: {
    ceu: ["#dff0ff", "#ffffff"], aguaFundo: "#9fd0ff", aguaFrente: "#4aa3f0", ilha: "#d9c7a0",
  },
};

// Gerador pseudoaleatório fixo, para as estrelas não mudarem de lugar a cada execução.
function sorteio(semente) {
  let s = semente;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function onda(yBase, amplitude, periodo, largura, altura) {
  let d = `M 0 ${yBase}`;
  for (let x = 0; x < largura; x += periodo) {
    d += ` Q ${x + periodo / 4} ${yBase - amplitude} ${x + periodo / 2} ${yBase} T ${x + periodo} ${yBase}`;
  }
  return `${d} L ${largura} ${altura} L 0 ${altura} Z`;
}

function baleia() {
  // Coordenadas locais: o convés (onde ficam os contêineres) está em y = 0.
  let caixas = "", i = 0;
  CONTEINERES.forEach((fila, f) => {
    fila.forEach((rotulo, c) => {
      const x = 16 + f * 21 + c * 42;
      const y = -32 - f * 32;
      const cor = COR_FIXA[rotulo] || CORES[i % CORES.length];
      let ripas = "";
      for (let k = 1; k < 5; k++) ripas += `<line x1="${x + k * 8}" y1="${y + 4}" x2="${x + k * 8}" y2="${y + 26}" stroke="#fff" stroke-opacity=".22"/>`;
      caixas += `<g class="cai" style="animation-delay:${(0.3 + i * 0.22).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="40" height="30" rx="3" fill="${cor}"/>${ripas}
  <rect x="${x + 2}" y="${y + 9}" width="36" height="13" rx="2" fill="#000" fill-opacity=".3"/>
  <text x="${x + 20}" y="${y + 18.5}" text-anchor="middle" class="mono" font-size="7.6" font-weight="700" fill="#fff">${esc(rotulo)}</text>
</g>`;
      i++;
    });
  });
  return `<g class="cauda"><path d="M 26 46 C 0 46 -16 26 -30 -2 C -19 3 -9 1 -1 -10 C 2 12 12 30 32 32 Z" fill="#1f7fd6"/></g>
<path d="M 20 0 H 222 Q 262 2 262 40 Q 258 98 170 112 Q 90 122 45 98 Q 22 86 12 62 Q 8 20 20 0 Z" fill="#2b8cf0"/>
<path d="M 60 100 Q 140 116 236 78 Q 206 106 154 112 Q 96 120 60 100 Z" fill="#cfe9ff"/>
<g class="olho"><circle cx="226" cy="42" r="7" fill="#fff"/><circle cx="228" cy="42" r="3.6" fill="#0b1020"/></g>
<path d="M 236 72 Q 247 74 252 63" stroke="#0b1020" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<circle cx="214" cy="60" r="5" fill="#ff8fab" fill-opacity=".55"/>
<g fill="#cfe9ff">
  <circle cx="246" cy="-2" r="3.5" class="jato" style="animation-delay:0s"/>
  <circle cx="242" cy="-2" r="2.5" class="jato" style="animation-delay:.4s"/>
  <circle cx="250" cy="-2" r="2.5" class="jato" style="animation-delay:.8s"/>
</g>
${caixas}`;
}

export function cartaoBaleia(t, nomeDoTema) {
  const L = 900, A = 320;
  const c = CENARIO[nomeDoTema];
  const escuro = nomeDoTema === "escuro";
  const rnd = sorteio(7);
  let estrelas = "";
  if (escuro) {
    for (let i = 0; i < 34; i++) {
      estrelas += `<circle cx="${(rnd() * L).toFixed(1)}" cy="${(rnd() * 150).toFixed(1)}" r="${(0.6 + rnd() * 1.2).toFixed(1)}" fill="#fff" class="brilha" style="animation-delay:${(rnd() * 4).toFixed(2)}s"/>`;
    }
  }
  const astro = escuro
    ? `<circle cx="560" cy="58" r="20" fill="#f3f4ff"/><circle cx="553" cy="52" r="4" fill="#d6daf0"/><circle cx="566" cy="64" r="3" fill="#d6daf0"/>`
    : `<g class="gira"><g stroke="#ffb627" stroke-width="3" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((g) => `<line x1="560" y1="26" x2="560" y2="18" transform="rotate(${g} 560 58)"/>`).join("")}</g></g><circle cx="560" cy="58" r="22" fill="#ffcf4d"/>`;
  const pacotes = [0, 1, 2].map((k) => `<rect x="-4" y="-4" width="8" height="8" rx="2" fill="${t.passou}" class="pacote" style="animation-delay:${k * 0.9}s"/>`).join("");
  const peixe = (cor) => `<path d="M 0 0 Q 10 -7 20 0 Q 10 7 0 0 Z M 0 0 L -7 -5 L -7 5 Z" fill="${cor}"/>`;
  // Rack: quatro servidores, cada um com dois LEDs piscando fora de sincronia.
  const rack = [0, 1, 2, 3].map((k) => `<rect x="839" y="${215 + k * 9}" width="20" height="6" rx="1" fill="#2c3550"/><circle cx="854" cy="${218 + k * 9}" r="1.6" fill="${k % 2 ? "#3ddc97" : "#7ef0c1"}" class="led" style="animation-delay:${k * 0.27}s"/><circle cx="849" cy="${218 + k * 9}" r="1.3" fill="#f2c14e" class="led" style="animation-delay:${0.5 + k * 0.19}s"/>`).join("");
  const bolhas = [0, 1, 2, 3].map((k) => `<circle cx="${400 + k * 38}" cy="300" r="${2 + (k % 2)}" fill="#fff" fill-opacity=".5" class="bolha" style="animation-delay:${k * 1.1}s"/>`).join("");

  const estilo = `
  .brilha { animation: brilha 3.2s ease-in-out infinite; }
  @keyframes brilha { 50% { opacity: .2; } }
  .gira { transform-box: view-box; transform-origin: 560px 58px; animation: gira 18s linear infinite; }
  @keyframes gira { to { transform: rotate(360deg); } }
  .nuvem { animation: nuvem 9s ease-in-out infinite; }
  @keyframes nuvem { 50% { transform: translateX(18px); } }
  .pacote { opacity: 0; animation: pacote 2.7s linear infinite; }
  @keyframes pacote { 0% { transform: translate(196px, 60px); opacity: 0; } 10%, 85% { opacity: 1; } 100% { transform: translate(392px, 52px); opacity: 0; } }
  .onda-fundo { animation: corre 16s linear infinite; }
  .onda-frente { animation: volta 10s linear infinite; }
  @keyframes corre { from { transform: translateX(0); } to { transform: translateX(-900px); } }
  @keyframes volta { from { transform: translateX(-900px); } to { transform: translateX(0); } }
  .boia { animation: boia 7s ease-in-out infinite; }
  @keyframes boia { 25% { transform: translate(10px, 5px) rotate(-1.2deg); } 50% { transform: translate(0, 8px); } 75% { transform: translate(-10px, 4px) rotate(1.2deg); } }
  .cauda { transform-box: fill-box; transform-origin: 100% 100%; animation: abana 1.8s ease-in-out infinite; }
  @keyframes abana { 50% { transform: rotate(-12deg); } }
  .olho { transform-box: fill-box; transform-origin: center; animation: pisca 5s infinite; }
  @keyframes pisca { 0%, 94%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
  .jato { opacity: 0; animation: jato 2.4s ease-out infinite; }
  @keyframes jato { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .9; } 100% { transform: translateY(-34px); opacity: 0; } }
  .cai { animation: cai .7s cubic-bezier(.3,1.35,.5,1) both; }
  @keyframes cai { from { transform: translateY(-240px); opacity: 0; } 50% { opacity: 1; } to { transform: none; } }
  .facho { transform-box: view-box; transform-origin: 800px 168px; animation: facho 5s ease-in-out infinite; }
  @keyframes facho { 50% { transform: scaleX(-1); } }
  .peixe { transform: translate(640px, 292px); animation: nada 22s linear infinite; }
  @keyframes nada { from { transform: translate(940px, 292px); } to { transform: translate(-60px, 292px); } }
  .bolha { opacity: 0; animation: bolha 4.4s ease-in infinite; }
  @keyframes bolha { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }
  .fibra { opacity: 0; animation: fibra 3.6s linear infinite; }
  @keyframes fibra { 0% { transform: translateX(340px); opacity: 0; } 8%, 90% { opacity: 1; } 100% { transform: translateX(880px); opacity: 0; } }
  .satelite { animation: orbita 12s ease-in-out infinite; }
  @keyframes orbita { 50% { transform: translate(-10px, 4px) rotate(-6deg); } }
  .link { animation: flui 1.2s linear infinite; }
  @keyframes flui { to { stroke-dashoffset: -18; } }
  .led { animation: led 1.1s step-end infinite; }
  @keyframes led { 50% { opacity: .15; } }
  .boia-ap { animation: balanca 3.4s ease-in-out infinite; }
  @keyframes balanca { 50% { transform: translateY(4px) rotate(4deg); } }
  .sinal { transform-box: fill-box; transform-origin: 50% 100%; opacity: 0; animation: sinal 2.4s ease-out infinite; }
  @keyframes sinal { 0% { transform: scale(.4); opacity: 0; } 25% { opacity: .9; } 100% { transform: scale(1.3); opacity: 0; } }
  .depois { animation: aparece .5s ease-out 2.6s both; }
  @keyframes aparece { from { opacity: 0; } to { opacity: 1; } }`;

  const conteudo = `
<defs><linearGradient id="ceu-${nomeDoTema}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.ceu[0]}"/><stop offset="1" stop-color="${c.ceu[1]}"/></linearGradient><linearGradient id="luz-${nomeDoTema}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffe08a" stop-opacity=".75"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></linearGradient></defs>
<rect width="${L}" height="${A}" fill="url(#ceu-${nomeDoTema})"/>
${estrelas}
${astro}
<g class="nuvem">
  <path d="M 112 76 Q 96 76 96 62 Q 96 46 114 48 Q 118 28 142 30 Q 162 22 174 42 Q 196 40 196 60 Q 196 76 178 76 Z" fill="${escuro ? "#2a3a66" : "#ffffff"}" stroke="${escuro ? "#3b4f86" : "#cfe0f5"}"/>
  <text x="146" y="64" text-anchor="middle" class="mono" font-size="11" font-weight="700" fill="#ff9900">aws</text>
  <text x="146" y="94" text-anchor="middle" class="mono" font-size="10" fill="${t.mudo}">${SERVICOS_AWS}</text>
</g>
<line x1="196" y1="60" x2="392" y2="52" stroke="${t.passou}" stroke-opacity=".45" stroke-dasharray="3 6"/>
<text x="282" y="48" class="mono" font-size="11" fill="${t.mudo}">sync</text>
${pacotes}
<path d="${onda(238, 7, 180, 1800, A)}" fill="${c.aguaFundo}" class="onda-fundo"/>
<g class="facho"><path d="M 800 168 L 600 146 L 600 190 Z" fill="url(#luz-${nomeDoTema})"/></g>
<path d="M 690 264 Q 790 222 890 264 Z" fill="${c.ilha}"/>
<path d="M 786 248 L 790 176 L 810 176 L 814 248 Z" fill="#f4f4f4"/>
<path d="M 788 222 H 812 L 813 234 H 787 Z M 789 196 H 811 L 811.5 208 H 788.5 Z" fill="#e5303f"/>
<rect x="788" y="160" width="24" height="16" rx="3" fill="#ffd166"/>
<path d="M 784 160 L 800 148 L 816 160 Z" fill="#e5303f"/>
<text x="800" y="138" text-anchor="middle" class="mono" font-size="10" fill="${t.mudo}">monitoramento</text>
<line x1="866" y1="64" x2="866" y2="190" stroke="${t.passou}" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="4 5" class="link"/>
<text x="858" y="100" text-anchor="end" class="mono" font-size="10" fill="${t.mudo}">link wan</text>
<g transform="translate(862 50)"><g class="satelite">
  <rect x="-24" y="-5" width="16" height="10" rx="1" fill="#3d63dd" stroke="#9fb4ff" stroke-width=".8"/>
  <rect x="8" y="-5" width="16" height="10" rx="1" fill="#3d63dd" stroke="#9fb4ff" stroke-width=".8"/>
  <rect x="-8" y="-7" width="16" height="14" rx="3" fill="#d6daf0"/>
  <path d="M 0 7 v 6" stroke="#d6daf0" stroke-width="1.5"/><circle cx="0" cy="14" r="2" fill="#f2c14e"/>
</g></g>
<rect x="835" y="210" width="28" height="42" rx="3" fill="#1b2236" stroke="#3b4f86"/>
${rack}
<text x="849" y="203" text-anchor="middle" class="mono" font-size="10" fill="${t.mudo}">servidores</text>
<g transform="translate(644 244)"><g class="boia-ap">
  <path d="M -9 6 Q 0 14 9 6 L 6 -6 H -6 Z" fill="#e5303f"/><rect x="-6" y="-2" width="12" height="4" fill="#fff"/>
  <path d="M 0 -6 V -22" stroke="#d6daf0" stroke-width="2"/><circle cx="0" cy="-23" r="2.5" fill="#3ddc97"/>
  ${[0, 1, 2].map((k) => `<path d="M -10 -28 Q 0 -38 10 -28" stroke="${t.passou}" stroke-width="2" fill="none" stroke-linecap="round" class="sinal" style="animation-delay:${k * 0.8}s"/>`).join("")}
</g></g>
<text x="644" y="206" text-anchor="middle" class="mono" font-size="10" fill="${t.mudo}">access point</text>
<g transform="translate(320 168)"><g class="boia">${baleia()}</g></g>
<path d="${onda(256, 6, 150, 1800, A)}" fill="${c.aguaFrente}" fill-opacity=".93" class="onda-frente"/>
${bolhas}
<line x1="336" y1="303" x2="888" y2="303" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="10 5"/>
${[0, 1, 2, 3].map((k) => `<circle cx="0" cy="303" r="3" fill="#7ef0c1" class="fibra" style="animation-delay:${k * 0.9}s"/>`).join("")}
<text x="886" y="316" text-anchor="end" class="mono" font-size="10" fill="#fff" fill-opacity=".8">fibra · tcp/ip · switches</text>
<g class="peixe">${peixe("#f2c14e")}</g>
<g class="mono" font-size="12">
  <rect x="20" y="276" width="300" height="30" rx="8" fill="#0b1020" fill-opacity=".78"/>
  <text x="34" y="295" fill="#e6edf3">$ docker compose up -d</text>
  <text x="208" y="295" fill="#3ddc97" class="depois">✔ ${CONTEINERES.flat().length} no ar</text>
</g>`;
  return moldura(t, L, A, "Baleia carregando contêineres de infraestrutura", conteudo, estilo);
}

const SITUACOES = {
  trabalho: { rotulo: "no dia a dia", cor: (t) => t.passou },
  estudo: { rotulo: "estudando", cor: (t) => t.destaque },
  projeto: { rotulo: "em projeto", cor: () => "#f2a93b" },
};

const SERVICOS = [
  ["Microsoft 365", "trabalho"], ["Entra ID e AD", "trabalho"], ["Intune", "trabalho"],
  ["Redes e Wi-Fi", "trabalho"], ["Audiovisual", "trabalho"], ["Docker", "estudo"],
  ["Linux", "estudo"], ["CI/CD e SonarCloud", "projeto"],
];

const EM_ANDAMENTO = [
  "manutenção preventiva de notebooks pelo Intune: conformidade e atualizações",
  "pipeline de CI com testes e SonarCloud no projeto organizacao-recursos",
];

export function cartaoInfra(t) {
  const L = 900, A = 248;
  const colunas = 4, w = 202, h = 46, gap = 11, x0 = 28, y0 = 54;
  const estilo = `
  .vivo { transform-box: fill-box; transform-origin: center; animation: vivo 2.2s ease-out infinite; }
  @keyframes vivo { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(2.8); opacity: 0; } }
  .liga { animation: liga .45s ease-out both; }
  @keyframes liga { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`;
  let blocos = "";
  SERVICOS.forEach(([nome, sit], i) => {
    const x = x0 + (i % colunas) * (w + gap);
    const y = y0 + Math.floor(i / colunas) * (h + gap);
    const s = SITUACOES[sit];
    const cor = s.cor(t);
    blocos += `<g class="liga" style="animation-delay:${(0.15 + i * 0.12).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${t.trilha}" stroke="${t.borda}"/>
  <circle cx="${x + 16}" cy="${y + 17}" r="4.5" fill="${cor}"/>
  <circle cx="${x + 16}" cy="${y + 17}" r="4.5" fill="${cor}" class="vivo" style="animation-delay:${(i * 0.21).toFixed(2)}s"/>
  <text x="${x + 28}" y="${y + 21}" class="sans" font-size="13" font-weight="600" fill="${t.texto}">${esc(nome)}</text>
  <text x="${x + 28}" y="${y + 37}" class="mono" font-size="10.5" fill="${cor}">${s.rotulo}</text>
</g>`;
  });
  const yLista = y0 + 2 * (h + gap) + 26;
  let lista = `<text x="${x0}" y="${yLista}" class="mono" font-size="12" fill="${t.mudo}">em andamento</text>`;
  EM_ANDAMENTO.forEach((item, i) => {
    lista += `<g class="liga" style="animation-delay:${(1.5 + i * 0.3).toFixed(2)}s"><text x="${x0}" y="${yLista + 24 + i * 22}" class="mono" font-size="12.5" fill="${t.texto}"><tspan fill="${t.passou}">▸ </tspan>${esc(item)}</text></g>`;
  });
  const conteudo = `
${cabecalhoDeCartao(t, 28, "infra", "o que eu opero e o que estou estudando")}
<g class="mono" font-size="11">${Object.values(SITUACOES).map((s, i) => `<circle cx="${L - 300 + i * 100}" cy="28" r="4" fill="${s.cor(t)}"/><text x="${L - 290 + i * 100}" y="32" fill="${t.mudo}">${s.rotulo}</text>`).join("")}</g>
${blocos}
${lista}`;
  return moldura(t, L, A, "Infraestrutura: o que eu opero e estudo", conteudo, estilo);
}
