// Imagem principal do perfil: nome à esquerda, baleia carregando contêineres de infraestrutura
// no centro e um pequeno data center à direita. Não usa a API; o conteúdo é fixo e mantido aqui.

import { esc, moldura } from "./tema.mjs";

// Pilha de contêineres, da fila de baixo para a de cima.
const CONTEINERES = [
  ["m365", "entra id", "intune", "ad", "linux"],
  ["vlans", "dns", "dhcp", "wi-fi"],
  ["firewall", "vpn", "backup"],
  ["docker", "aws"],
];
// Um tom por fila, todos da mesma família, para a pilha não virar um arco-íris.
const TONS = ["#0f766e", "#0d9488", "#14a394", "#22b8a8"];
const COR_FIXA = { aws: "#ff9900" };
const FOCO = ["infraestrutura", "redes", "cloud", "java"];

const CENARIO = {
  escuro: { ceu: ["#0b1020", "#13254d"], aguaFundo: "#13305c", aguaFrente: "#1b4a8a", ilha: "#1c2640", nuvem: "#22305a", bordaNuvem: "#33467a" },
  claro: { ceu: ["#eaf5ff", "#ffffff"], aguaFundo: "#a9d5ff", aguaFrente: "#5aaef2", ilha: "#e3d3ae", nuvem: "#ffffff", bordaNuvem: "#d6e6f7" },
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
      const cor = COR_FIXA[rotulo] || TONS[f];
      caixas += `<g class="cai" style="animation-delay:${(0.3 + i * 0.15).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="40" height="30" rx="4" fill="${cor}"/>
  <text x="${x + 20}" y="${y + 18.5}" text-anchor="middle" class="mono" font-size="8" font-weight="700" fill="#fff">${esc(rotulo)}</text>
</g>`;
      i++;
    });
  });
  return `<g class="cauda"><path d="M 26 46 C 0 46 -16 26 -30 -2 C -19 3 -9 1 -1 -10 C 2 12 12 30 32 32 Z" fill="#1f7fd6"/></g>
<path d="M 20 0 H 222 Q 262 2 262 40 Q 258 98 170 112 Q 90 122 45 98 Q 22 86 12 62 Q 8 20 20 0 Z" fill="#2b8cf0"/>
<path d="M 60 100 Q 140 116 236 78 Q 206 106 154 112 Q 96 120 60 100 Z" fill="#cfe9ff"/>
<g class="olho"><circle cx="226" cy="42" r="7" fill="#fff"/><circle cx="228" cy="42" r="3.6" fill="#0b1020"/></g>
<path d="M 236 72 Q 247 74 252 63" stroke="#0b1020" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<g fill="#cfe9ff">
  <circle cx="246" cy="-2" r="3.5" class="jato"/>
  <circle cx="242" cy="-2" r="2.5" class="jato" style="animation-delay:.4s"/>
  <circle cx="250" cy="-2" r="2.5" class="jato" style="animation-delay:.8s"/>
</g>
${caixas}`;
}

function dataCenter(c) {
  // Dois racks com oito servidores cada; LEDs e barras de atividade em ritmos diferentes.
  let racks = "";
  [782, 838].forEach((x, r) => {
    racks += `<rect x="${x}" y="150" width="50" height="104" rx="4" fill="#161c2e" stroke="#3b4f86" stroke-width="1.5"/>`;
    for (let u = 0; u < 8; u++) {
      const y = 158 + u * 11.5, n = r * 8 + u;
      racks += `<rect x="${x + 5}" y="${y}" width="40" height="9" rx="1.5" fill="#26304a"/>
<rect x="${x + 9}" y="${y + 3}" width="18" height="3" rx="1.5" fill="#3ddc97" fill-opacity=".85" class="atividade" style="animation-duration:${(0.9 + (n * 7 % 10) / 8).toFixed(2)}s;animation-delay:${(n * 0.13).toFixed(2)}s"/>
<circle cx="${x + 37}" cy="${y + 4.5}" r="1.7" fill="#3ddc97" class="led" style="animation-delay:${(n * 0.17).toFixed(2)}s"/>`;
    }
  });
  return `<path d="M 700 270 Q 810 214 912 270 Z" fill="${c.ilha}"/>
${racks}
<g class="mono">
  <rect x="783" y="118" width="104" height="22" rx="11" fill="#0b1020" fill-opacity=".85" stroke="#3ddc97" stroke-opacity=".6"/>
  <circle cx="797" cy="129" r="3.5" fill="#3ddc97"/><circle cx="797" cy="129" r="3.5" fill="#3ddc97" class="vivo"/>
  <text x="807" y="133" font-size="11" font-weight="700" fill="#e6edf3">servidores</text>
</g>`;
}

export function cartaoPrincipal(t, nomeDoTema) {
  const L = 900, A = 300;
  const c = CENARIO[nomeDoTema];
  const rnd = sorteio(7);
  let estrelas = "";
  if (nomeDoTema === "escuro") {
    for (let i = 0; i < 18; i++) {
      estrelas += `<circle cx="${(400 + rnd() * (L - 400)).toFixed(1)}" cy="${(rnd() * 120).toFixed(1)}" r="${(0.6 + rnd()).toFixed(1)}" fill="#fff" fill-opacity=".8" class="brilha" style="animation-delay:${(rnd() * 4).toFixed(2)}s"/>`;
    }
  }
  // As palavras do foco aparecem uma de cada vez.
  const foco = FOCO.map((p, i) => `<tspan class="surge" style="animation-delay:${(0.5 + i * 0.35).toFixed(2)}s">${i ? " · " : "> "}${esc(p)}</tspan>`).join("");

  const estilo = `
  .brilha { animation: brilha 3.2s ease-in-out infinite; }
  @keyframes brilha { 50% { opacity: .2; } }
  .surge { animation: surge .5s ease-out both; }
  @keyframes surge { from { opacity: 0; } to { opacity: 1; } }
  .nuvem { animation: nuvem 10s ease-in-out infinite; }
  @keyframes nuvem { 50% { transform: translateX(-16px); } }
  .onda-fundo { animation: corre 16s linear infinite; }
  .onda-frente { animation: volta 10s linear infinite; }
  @keyframes corre { from { transform: translateX(0); } to { transform: translateX(-900px); } }
  @keyframes volta { from { transform: translateX(-900px); } to { transform: translateX(0); } }
  .boia { animation: boia 7s ease-in-out infinite; }
  @keyframes boia { 25% { transform: translate(8px, 4px) rotate(-1deg); } 50% { transform: translate(0, 7px); } 75% { transform: translate(-8px, 3px) rotate(1deg); } }
  .cauda { transform-box: fill-box; transform-origin: 100% 100%; animation: abana 1.8s ease-in-out infinite; }
  @keyframes abana { 50% { transform: rotate(-12deg); } }
  .olho { transform-box: fill-box; transform-origin: center; animation: pisca 5s infinite; }
  @keyframes pisca { 0%, 94%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
  .jato { opacity: 0; animation: jato 2.4s ease-out infinite; }
  @keyframes jato { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .9; } 100% { transform: translateY(-34px); opacity: 0; } }
  .cai { animation: cai .7s cubic-bezier(.3,1.35,.5,1) both; }
  @keyframes cai { from { transform: translateY(-240px); opacity: 0; } 50% { opacity: 1; } to { transform: none; } }
  .led { animation: led 1.1s step-end infinite; }
  @keyframes led { 50% { opacity: .15; } }
  .atividade { transform-box: fill-box; transform-origin: left; animation: atividade 1.3s ease-in-out infinite alternate; }
  @keyframes atividade { from { transform: scaleX(.2); } to { transform: scaleX(1); } }
  .vivo { transform-box: fill-box; transform-origin: center; animation: vivo 2.2s ease-out infinite; }
  @keyframes vivo { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(2.8); opacity: 0; } }`;

  const conteudo = `
<defs><linearGradient id="ceu-${nomeDoTema}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.ceu[0]}"/><stop offset="1" stop-color="${c.ceu[1]}"/></linearGradient></defs>
<rect width="${L}" height="${A}" fill="url(#ceu-${nomeDoTema})"/>
${estrelas}
<text x="40" y="84" class="sans" font-size="38" font-weight="700" fill="${t.texto}">Guilherme Viana</text>
<text x="42" y="114" class="sans" font-size="15" fill="${t.mudo}">Análise e Desenvolvimento de Sistemas · Senac</text>
<text x="42" y="136" class="sans" font-size="15" fill="${t.mudo}">Assistente de Tecnologia | Infraestrutura</text>
<text x="42" y="170" class="mono" font-size="14" fill="${t.destaque}">${foco}</text>
<g class="nuvem">
  <path d="M 676 62 Q 660 62 660 48 Q 660 32 678 34 Q 682 14 706 16 Q 726 8 738 28 Q 760 26 760 46 Q 760 62 742 62 Z" fill="${c.nuvem}" stroke="${c.bordaNuvem}"/>
  <text x="710" y="50" text-anchor="middle" class="mono" font-size="12" font-weight="700" fill="#ff9900">aws</text>
</g>
<path d="${onda(244, 6, 180, 1800, A)}" fill="${c.aguaFundo}" class="onda-fundo"/>
${dataCenter(c)}
<g transform="translate(430 172)"><g class="boia">${baleia()}</g></g>
<path d="${onda(262, 5, 150, 1800, A)}" fill="${c.aguaFrente}" fill-opacity=".93" class="onda-frente"/>`;
  return moldura(t, L, A, "Guilherme Viana: infraestrutura, redes, cloud e Java", conteudo, estilo);
}
