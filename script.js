/* ==================================================
   PALADINS | ROBÓTICA COLÉGIO SESI
   JAVASCRIPT — IDENTIDADE VISUAL AZUL E DOURADO
================================================== */


/* ==================================================
   1. EFEITO CAMALEÃO — MOVIMENTO DO MOUSE
================================================== */

const raiz = document.documentElement;

let posicaoX = 50;
let posicaoY = 50;

let destinoX = 50;
let destinoY = 50;

let corAtual = 215;
let corDestino = 215;

const movimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


function atualizarMouse(event) {

    destinoX = (event.clientX / window.innerWidth) * 100;
    destinoY = (event.clientY / window.innerHeight) * 100;

    const progresso = destinoX / 100;

    // Variação entre azul e dourado
    corDestino = 215 - progresso * 170;
}


function animarCamaleao() {

    if (movimentoReduzido.matches) return;

    posicaoX += (destinoX - posicaoX) * 0.045;
    posicaoY += (destinoY - posicaoY) * 0.045;

    corAtual += (corDestino - corAtual) * 0.035;

    raiz.style.setProperty("--mouse-x", `${posicaoX}%`);
    raiz.style.setProperty("--mouse-y", `${posicaoY}%`);
    raiz.style.setProperty("--cor-camaleao", `${corAtual}deg`);

    requestAnimationFrame(animarCamaleao);
}


window.addEventListener("mousemove", atualizarMouse, {
    passive: true
});


if (!movimentoReduzido.matches) {
    requestAnimationFrame(animarCamaleao);
}



/* ==================================================
   2. FUNDO EM ONDA
================================================== */

const canvas = document.getElementById("fundo-interativo");

if (canvas && canvas.getContext) {

    const ctx = canvas.getContext("2d");

    // Canvas pequeno onde a onda é calculada (depois é ampliado)
    const pequeno = document.createElement("canvas");
    const pctx = pequeno.getContext("2d");

    let largura = 0;
    let altura = 0;
    let imagem = null;

    const mouse = {
        x: 0.5,
        y: 0.5,
        alvoX: 0.5,
        alvoY: 0.5,
        presenca: 0,
        alvoPresenca: 0
    };

    let tempo = 0;
    let quadroAnterior = 0;
    let animacaoAtiva = false;

    /* ---------- AJUSTES (pode mexer à vontade) ---------- */

    // Tamanho do "pixel" da onda. Maior = mais pixelado e mais leve.
    // Use 1 a 3 para uma onda bem lisa.
    const tamanhoPixel = 7;

    // Velocidade da animação
    const velocidade = 0.00012;

    // Força das faixas de luz (0 a 1)
    const intensidade = 0.9;

    // Espessura das faixas: quanto MAIOR o número, mais FINA a faixa
    const finuraAzul = 9;
    const finuraDourado = 12;

    // Brilho da onda na primeira tela e nas demais (0 a 1)
    const brilhoPrimeiraTela = 0.65;
    const brilhoDemaisTelas = 0.15;

    // Quanto as ondas acompanham o mouse
    const forcaMouse = 0.5;   // deformação das faixas (0 = desligado)
    const raioMouse = 0.5;    // alcance do efeito (maior = mais espalhado e suave)
    const suavidadeMouse = 0.02; // menor = segue mais devagar
    const velocidadeMaxMouse = 0.008; // limite de velocidade: evita bolha ao mexer rápido

    // Cores (R, G, B)
    const corAzul = [20, 90, 235];
    const corAzulClaro = [30, 150, 255];
    const corDourado = [255, 195, 0];

    /* ---------------------------------------------------- */


    function ajustarCanvas() {

        largura = window.innerWidth;
        altura = window.innerHeight;

        canvas.width = largura;
        canvas.height = altura;

        pequeno.width = Math.ceil(largura / tamanhoPixel);
        pequeno.height = Math.ceil(altura / tamanhoPixel);

        imagem = pctx.createImageData(pequeno.width, pequeno.height);
    }


    /* Onda mais forte na primeira tela e mais apagada nas outras */

    function atualizarBrilho() {

        const cabecalho = document.querySelector("header");

        const limite = cabecalho
            ? cabecalho.offsetHeight * 0.8
            : altura;

        const progresso = Math.min(
            Math.max(window.scrollY / limite, 0),
            1
        );

        const brilho =
            brilhoPrimeiraTela -
            (brilhoPrimeiraTela - brilhoDemaisTelas) * progresso;

        canvas.style.opacity = brilho;
    }


    window.addEventListener("scroll", atualizarBrilho, {
        passive: true
    });


    function desenharOnda() {

        const w = pequeno.width;
        const h = pequeno.height;
        const dados = imagem.data;

        const t = tempo;
        const proporcao = w / h;

        const mx = mouse.x * proporcao;
        const my = mouse.y;
        const raio2 = raioMouse * raioMouse;

        let i = 0;

        for (let py = 0; py < h; py++) {

            const v = py / h;

            for (let px = 0; px < w; px++) {

                const u = (px / w) * proporcao;

                // Influência do mouse: forte perto dele, some com a distância
                const dx = u - mx;
                const dy = v - my;

                const influencia =
                    Math.exp(-(dx * dx + dy * dy) / raio2) *
                    mouse.presenca;

                // Curvas que deformam as faixas, como uma onda
                const curva =
                    0.55 * Math.sin(v * 3.2 + t * 1.1) +
                    0.35 * Math.sin(u * 2.4 - t * 0.8) +
                    0.18 * Math.sin((u + v) * 5.5 + t * 1.6);

                // Faixas diagonais que se movem
                const diagonal =
                    u * 1.1 + v * 0.8 + curva +
                    influencia * forcaMouse;

                const faixa1 = Math.pow(
                    0.5 + 0.5 * Math.sin(diagonal * 5.0 - t * 1.4),
                    finuraAzul
                );

                const faixa2 = Math.pow(
                    0.5 + 0.5 * Math.sin(diagonal * 3.1 + 1.7 - t * 0.9),
                    finuraDourado
                );

                const brilho = faixa1 * intensidade;
                const dourado = faixa2 * intensidade * 0.55;

                const total = Math.min(brilho + dourado, 1);

                // Mistura azul -> azul claro conforme o brilho, e dourado por cima
                const mistura = faixa1 > 0.65 ? (faixa1 - 0.65) / 0.35 : 0;

                const r =
                    corAzul[0] * (1 - mistura) + corAzulClaro[0] * mistura;
                const g =
                    corAzul[1] * (1 - mistura) + corAzulClaro[1] * mistura;
                const b =
                    corAzul[2] * (1 - mistura) + corAzulClaro[2] * mistura;

                // Escolhe azul OU dourado (sem misturar os dois,
                // porque a mistura vira cinza)
                const proporcaoDourado = dourado / (brilho + dourado + 0.0001);

                let pesoDourado = (proporcaoDourado - 0.4) / 0.2;
                pesoDourado = Math.min(Math.max(pesoDourado, 0), 1);

                dados[i]     = r + (corDourado[0] - r) * pesoDourado;
                dados[i + 1] = g + (corDourado[1] - g) * pesoDourado;
                dados[i + 2] = b + (corDourado[2] - b) * pesoDourado;
                dados[i + 3] = total * 255;

                i += 4;
            }
        }

        pctx.putImageData(imagem, 0, 0);

        ctx.clearRect(0, 0, largura, altura);

        // Sem suavização = visual pixelado. Troque por true para ficar liso.
        ctx.imageSmoothingEnabled = tamanhoPixel <= 2;

        ctx.drawImage(pequeno, 0, 0, largura, altura);
    }


    function animarOnda(timestamp) {

        if (!animacaoAtiva) return;

        const delta = quadroAnterior
            ? Math.min(timestamp - quadroAnterior, 50)
            : 16;

        quadroAnterior = timestamp;

        tempo += delta * velocidade * 3;

        // O mouse é seguido com suavidade
        // Cada passo é limitado, então o efeito nunca "corre" atrás do mouse
        const limitar = (valor) =>
            Math.max(-velocidadeMaxMouse, Math.min(velocidadeMaxMouse, valor));

        mouse.x += limitar((mouse.alvoX - mouse.x) * suavidadeMouse);
        mouse.y += limitar((mouse.alvoY - mouse.y) * suavidadeMouse);
        mouse.presenca +=
            (mouse.alvoPresenca - mouse.presenca) * suavidadeMouse;

        desenharOnda();

        requestAnimationFrame(animarOnda);
    }


    function iniciarAnimacao() {

        if (animacaoAtiva || movimentoReduzido.matches) return;

        animacaoAtiva = true;
        quadroAnterior = 0;

        ajustarCanvas();
        atualizarBrilho();

        requestAnimationFrame(animarOnda);
    }


    function pararAnimacao() {

        animacaoAtiva = false;
    }


    function seguirPonteiro(x, y) {

        mouse.alvoX = x / window.innerWidth;
        mouse.alvoY = y / window.innerHeight;
        mouse.alvoPresenca = 1;
    }

    window.addEventListener("mousemove", (event) => {

        seguirPonteiro(event.clientX, event.clientY);

    }, { passive: true });

    document.addEventListener("mouseleave", () => {

        mouse.alvoPresenca = 0;
    });

    window.addEventListener("touchmove", (event) => {

        if (event.touches.length > 0) {
            seguirPonteiro(
                event.touches[0].clientX,
                event.touches[0].clientY
            );
        }

    }, { passive: true });

    window.addEventListener("touchend", () => {

        mouse.alvoPresenca = 0;
    });


    window.addEventListener("resize", () => {

        if (animacaoAtiva) {
            ajustarCanvas();
        }

    });


    function atualizarMovimento() {

        if (movimentoReduzido.matches) {

            pararAnimacao();
            canvas.style.display = "none";

        } else {

            canvas.style.display = "block";
            iniciarAnimacao();

        }
    }


    movimentoReduzido.addEventListener(
        "change",
        atualizarMovimento
    );

    atualizarMovimento();

}



/* ==================================================
   3. ANIMAÇÃO AO ROLAR A PÁGINA
================================================== */

const elementosAnimados = document.querySelectorAll(
    "main section, main article"
);


if ("IntersectionObserver" in window) {

    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach((entrada) => {

            if (entrada.isIntersecting) {

                entrada.target.classList.add("visible");

                observador.unobserve(entrada.target);

            }

        });

    }, {

        threshold: 0.12

    });


    elementosAnimados.forEach((elemento) => {

        elemento.classList.add("reveal");

        observador.observe(elemento);

    });

} else {

    elementosAnimados.forEach((elemento) => {

        elemento.classList.add("visible");

    });

}



/* ==================================================
   4. MENU DE NAVEGAÇÃO ATIVO
================================================== */

const secoes = document.querySelectorAll(
    "main section[id]"
);

const linksMenu = document.querySelectorAll(
    'header nav a[href^="#"]'
);


if ("IntersectionObserver" in window) {

    const observadorMenu = new IntersectionObserver((entradas) => {

        entradas.forEach((entrada) => {

            if (!entrada.isIntersecting) return;

            const idSecao = entrada.target.id;

            linksMenu.forEach((link) => {

                const ativo =
                    link.getAttribute("href") === `#${idSecao}`;

                link.classList.toggle("link-ativo", ativo);

                if (ativo) {

                    link.setAttribute("aria-current", "location");

                } else {

                    link.removeAttribute("aria-current");

                }

            });

        });

    }, {

        threshold: 0.35,

        rootMargin: "-10% 0px -35% 0px"

    });


    secoes.forEach((secao) => {

        observadorMenu.observe(secao);

    });

}



/* ==================================================
   5. PROTEÇÃO PARA LINKS SEM DESTINO
================================================== */

document.querySelectorAll('a[href="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

        event.preventDefault();

    });

});



/* ==================================================
   6. ANO AUTOMÁTICO NO RODAPÉ
================================================== */

const rodape = document.querySelector("footer");

if (rodape) {

    const ano = new Date().getFullYear();

    const textosRodape = rodape.querySelectorAll("p");

    textosRodape.forEach((paragrafo) => {

        paragrafo.textContent =
            paragrafo.textContent.replace(/\b2026\b/g, ano);

    });

}



/* ==================================================
   7. MENSAGEM NO CONSOLE
================================================== */

console.log(
    "%c PALADINS | ROBÓTICA SESI ",
    "background: #071A52; color: #FFD21C; font-size: 20px; font-weight: bold; padding: 12px; border: 2px solid #FFB800;"
);

console.log(
    "Do Regional ao Estadual, e agora rumo ao Nacional!"
);



/* ==================================================
   8. MENU HAMBÚRGUER
================================================== */

const botaoMenu = document.getElementById("menu-toggle");
const overlayMenu = document.getElementById("menu-overlay");

function alternarMenu(abrir) {
    document.body.classList.toggle("menu-aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", abrir);
}

botaoMenu.addEventListener("click", () => {
    alternarMenu(!document.body.classList.contains("menu-aberto"));
});

overlayMenu.addEventListener("click", () => alternarMenu(false));

document.querySelectorAll("#menu-lateral a").forEach((link) => {
    link.addEventListener("click", () => alternarMenu(false));
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") alternarMenu(false);
});