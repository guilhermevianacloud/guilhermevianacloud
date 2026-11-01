// Caça ao Bug: um bug se esconde num tabuleiro 5×5 e cada visitante investiga uma casa abrindo uma issue.
// Uso:
//   node scripts/jogo.mjs desenhar                          → redesenha tabuleiro, cartão e README
//   TITULO=... AUTOR=... SEMENTE=... node scripts/jogo.mjs jogada
//     → aplica a jogada, grava a resposta em $RESPOSTA (padrão: resposta.md) e redesenha
// A posição do bug vem de HMAC(SEMENTE, rodada). A SEMENTE fica só no segredo do repositório,
// então o código e o estado podem ser públicos sem entregar a resposta.

import { createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { TEMAS, esc, moldura, cabecalhoDeCartao } from "./tema.mjs";

const REPO = process.env.REPO || "guilhermevianacloud/guilhermevianacloud";
const PERFIL = `https://github.com/${REPO.split("/")[0]}`;
const COLUNAS = ["A", "B", "C", "D", "E"];
const LINHAS = [1, 2, 3, 4, 5];
const ARQ_ESTADO = "jogo/estado.json";

const PISTAS = {
  queimando: { cor: "#e5303f", nome: "queimando", distancia: "1 casa" },
  quente: { cor: "#ef6c2c", nome: "quente", distancia: "2 casas" },
  morno: { cor: "#d9a21b", nome: "morno", distancia: "3 casas" },
  frio: { cor: "#3b6fd8", nome: "frio", distancia: "4 ou mais" },
};

const ESTADO_INICIAL = { rodada: 1, tentativas: 0, jogadas: {}, placar: {}, ultimaRodada: null, totalJogadas: 0 };

// ---------- regras ----------

function posicaoDoBug(semente, rodada) {
  const hash = createHmac("sha256", semente).update(`rodada-${rodada}`).digest("hex");
  const p = parseInt(hash.slice(0, 8), 16) % 25;
  return { col: p % 5, lin: Math.floor(p / 5) };
}

const nomeDaCasa = ({ col, lin }) => `${COLUNAS[col]}${LINHAS[lin]}`;

function lerCasa(titulo) {
  const m = /caca-bug\s*:\s*([A-E])\s*([1-5])\b/i.exec(titulo || "");
  return m ? { col: COLUNAS.indexOf(m[1].toUpperCase()), lin: Number(m[2]) - 1 } : null;
}

function pistaPorDistancia(d) {
  if (d === 1) return "queimando";
  if (d === 2) return "quente";
  if (d === 3) return "morno";
  return "frio";
}

function jogar(estado, titulo, autor, semente) {
  const rodape = `\n\n---\n[Voltar ao perfil e ver o tabuleiro](${PERFIL})`;
  const casa = lerCasa(titulo);
  if (!casa) {
    return `Não entendi a jogada. O título precisa ser assim: \`caca-bug: C3\` (coluna de A a E, linha de 1 a 5).${rodape}`;
  }
  const nome = nomeDaCasa(casa);
  const anterior = estado.jogadas[nome];
  if (anterior) {
    const p = PISTAS[anterior.pista];
    return `A casa **${nome}** já foi investigada por @${anterior.por} nesta rodada: **${p.nome}** (${p.distancia} do bug). Escolha outra casa no tabuleiro.${rodape}`;
  }

  const bug = posicaoDoBug(semente, estado.rodada);
  const distancia = Math.abs(bug.col - casa.col) + Math.abs(bug.lin - casa.lin);
  estado.tentativas += 1;
  estado.totalJogadas += 1;

  if (distancia === 0) {
    estado.placar[autor] = (estado.placar[autor] || 0) + 1;
    estado.ultimaRodada = {
      rodada: estado.rodada, vencedor: autor, casa: nome, tentativas: estado.tentativas,
      data: new Date().toISOString().slice(0, 10),
    };
    const vitorias = estado.placar[autor];
    estado.rodada += 1;
    estado.tentativas = 0;
    estado.jogadas = {};
    return `🐛 **Achou!** O bug estava em **${nome}**. A rodada ${estado.ultimaRodada.rodada} terminou em ${estado.ultimaRodada.tentativas} ${estado.ultimaRodada.tentativas === 1 ? "tentativa" : "tentativas"}.\n\nVocê tem **${vitorias} ${vitorias === 1 ? "vitória" : "vitórias"}** no placar. Um novo bug já se escondeu: a rodada ${estado.rodada} começou.${rodape}`;
  }

  const pista = pistaPorDistancia(distancia);
  estado.jogadas[nome] = { pista, por: autor };
  const p = PISTAS[pista];
  return `**${p.nome[0].toUpperCase() + p.nome.slice(1)}.** O bug está a **${p.distancia}** de ${nome}, contando na horizontal e na vertical, sem diagonal.\n\nA casa foi marcada no tabuleiro. Use a pista e tente de novo.${rodape}`;
}

// ---------- desenho ----------

function casaSvg(tipo) {
  const L = 56;
  if (tipo === "oculta") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}">
<style>
  .p { animation: brilho 2.6s ease-in-out infinite; }
  @keyframes brilho { 50% { opacity: .45; } }
  @media (prefers-reduced-motion: reduce) { .p { animation: none; } }
</style>
<rect x="1" y="1" width="54" height="54" rx="10" fill="#18213a" stroke="#2c3a5e" stroke-width="2"/>
<text x="28" y="36" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="22" font-weight="700" fill="#7aa2ff" class="p">?</text>
</svg>
`;
  }
  const p = PISTAS[tipo];
  // Ondas de calor: mais ondas quanto mais perto do bug.
  const ondas = { frio: 0, morno: 1, quente: 2, queimando: 3 }[tipo];
  let arcos = "";
  for (let i = 0; i < ondas; i++) {
    arcos += `<path d="M ${27 - (ondas - 1) * 4.5 + i * 9} 22 q 3 -5 0 -10" stroke="#fff" stroke-opacity=".75" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  const floco = tipo === "frio"
    ? `<g stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"><path d="M28 9v14M21 12l14 8M35 12l-14 8"/></g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}">
<rect x="1" y="1" width="54" height="54" rx="10" fill="${p.cor}"/>
${floco}${arcos}
<text x="28" y="44" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="10" font-weight="700" fill="#fff">${p.nome}</text>
</svg>
`;
}

function bugSvg(cor) {
  return `<g stroke="${cor}" stroke-width="1.6" stroke-linecap="round">
    <path d="M-4 -6 l-3 -5 M2 -6 l2 -5 M-4 6 l-3 5 M2 6 l2 5 M-1 -6 v-6 M-1 6 v6" class="pernas"/>
    <path d="M12 -2 l5 -5 M12 2 l5 5"/>
  </g>
  <ellipse cx="0" cy="0" rx="10" ry="7" fill="${cor}"/>
  <circle cx="11" cy="0" r="4.5" fill="${cor}"/>
  <path d="M-9 0 H8" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>`;
}

function cartaoJogo(t, estado) {
  const L = 900, A = 178;
  const estilo = `
  .anda { transform: translateX(820px); animation: anda 16s linear infinite; }
  @keyframes anda { from { transform: translateX(-30px); } to { transform: translateX(930px); } }
  .pernas { animation: passo .25s steps(2) infinite; }
  @keyframes passo { 50% { transform: scaleX(-1); } }`;
  const legenda = Object.values(PISTAS).reverse().map((p, i) => {
    const x = 28 + i * 140;
    return `<rect x="${x}" y="98" width="14" height="14" rx="4" fill="${p.cor}"/>
<text x="${x + 22}" y="110" class="mono" font-size="12" fill="${t.texto}">${p.nome}</text>
<text x="${x + 22}" y="126" class="mono" font-size="11" fill="${t.mudo}">${p.distancia}</text>`;
  }).join("\n");

  const ranking = Object.entries(estado.placar).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3);
  const medalhas = ["#f2c14e", "#b8c2d6", "#d08b5b"];
  let placar = `<text x="640" y="72" class="mono" font-size="12" fill="${t.mudo}">placar de caçadores</text>`;
  if (ranking.length === 0) {
    placar += `<text x="640" y="98" class="sans" font-size="14" fill="${t.texto}">ninguém achou ainda.</text>
<text x="640" y="118" class="sans" font-size="14" fill="${t.passou}">o primeiro lugar está livre.</text>`;
  } else {
    ranking.forEach(([login, v], i) => {
      const y = 98 + i * 22;
      placar += `<circle cx="646" cy="${y - 5}" r="6" fill="${medalhas[i]}"/>
<text x="660" y="${y}" class="sans" font-size="14" fill="${t.texto}">@${esc(login)}</text>
<text x="872" y="${y}" text-anchor="end" class="mono" font-size="13" font-weight="700" fill="${t.texto}">${v}</text>`;
    });
  }

  const u = estado.ultimaRodada;
  const historico = u
    ? `última rodada: @${u.vencedor} achou em ${u.casa}, com ${u.tentativas} ${u.tentativas === 1 ? "tentativa" : "tentativas"}`
    : "primeira rodada em andamento";
  const conteudo = `
${cabecalhoDeCartao(t, 28, "caça ao bug", `rodada ${estado.rodada} · ${estado.tentativas} ${estado.tentativas === 1 ? "tentativa" : "tentativas"} · ${estado.totalJogadas} jogadas no total`)}
<text x="28" y="72" class="sans" font-size="15" fill="${t.texto}">Um bug se escondeu no tabuleiro abaixo. Clique numa casa para investigar.</text>
${legenda}
<text x="28" y="150" class="mono" font-size="12" fill="${t.mudo}">${esc(historico)}</text>
<line x1="610" y1="56" x2="610" y2="132" stroke="${t.borda}"/>
${placar}
<g transform="translate(0 166)"><g class="anda">${bugSvg("#e5303f")}</g></g>`;
  return moldura(t, L, A, "Caça ao Bug: placar e regras", conteudo, estilo);
}

function linkDaJogada(nome) {
  const titulo = `caca-bug: ${nome}`;
  const corpo = `Investigando a casa **${nome}**.\n\nÉ só clicar em **Create** / **Submit new issue**. Em alguns segundos o robô responde aqui com a pista e o tabuleiro do perfil é atualizado.`;
  return `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(titulo)}&body=${encodeURIComponent(corpo)}`;
}

function tabuleiroMarkdown(estado) {
  let html = `<table>\n<tr><td></td>${COLUNAS.map((c) => `<td align="center"><b>${c}</b></td>`).join("")}</tr>\n`;
  LINHAS.forEach((lin, l) => {
    html += `<tr><td align="center"><b>${lin}</b></td>`;
    COLUNAS.forEach((c, col) => {
      const nome = nomeDaCasa({ col, lin: l });
      const jogada = estado.jogadas[nome];
      html += jogada
        ? `<td><img src="jogo/casas/${jogada.pista}.svg" width="52" alt="${nome}: ${jogada.pista}" title="${nome}: ${jogada.pista}, por @${esc(jogada.por)}"></td>`
        : `<td><a href="${linkDaJogada(nome)}"><img src="jogo/casas/oculta.svg" width="52" alt="${nome}: investigar" title="investigar ${nome}"></a></td>`;
    });
    html += "</tr>\n";
  });
  return html + "</table>";
}

async function desenhar(estado) {
  await mkdir("jogo/casas", { recursive: true });
  await mkdir("cartoes", { recursive: true });
  for (const tipo of ["oculta", ...Object.keys(PISTAS)]) {
    await writeFile(`jogo/casas/${tipo}.svg`, casaSvg(tipo));
  }
  for (const [nome, t] of Object.entries(TEMAS)) {
    await writeFile(`cartoes/jogo-${nome}.svg`, cartaoJogo(t, estado));
  }
  const readme = await readFile("README.md", "utf8");
  const inicio = "<!-- JOGO:INICIO -->", fim = "<!-- JOGO:FIM -->";
  const a = readme.indexOf(inicio), b = readme.indexOf(fim);
  if (a < 0 || b < a) throw new Error("Marcadores do jogo não encontrados no README.md");
  const bloco = `${inicio}\n${tabuleiroMarkdown(estado)}\n`;
  await writeFile("README.md", readme.slice(0, a) + bloco + readme.slice(b));
}

// ---------- execução ----------

const modo = process.argv[2];
let estado;
try {
  estado = JSON.parse(await readFile(ARQ_ESTADO, "utf8"));
} catch {
  estado = structuredClone(ESTADO_INICIAL);
}

if (modo === "jogada") {
  const { TITULO, AUTOR, SEMENTE } = process.env;
  if (!SEMENTE) throw new Error("Segredo JOGO_SEMENTE ausente.");
  if (!AUTOR) throw new Error("AUTOR ausente.");
  const resposta = jogar(estado, TITULO, AUTOR, SEMENTE);
  await writeFile(process.env.RESPOSTA || "resposta.md", resposta);
  console.log(resposta.split("\n")[0]);
} else if (modo !== "desenhar") {
  console.error("Uso: node scripts/jogo.mjs desenhar | jogada");
  process.exit(1);
}

await mkdir("jogo", { recursive: true });
await writeFile(ARQ_ESTADO, JSON.stringify(estado, null, 2) + "\n");
await desenhar(estado);
