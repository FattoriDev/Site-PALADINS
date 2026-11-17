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
   2. MALHA DIGITAL INTERATIVA
================================================== */

const canvas = document.getElementById("fundo-interativo");

if (canvas && canvas.getContext) {

    const ctx = canvas.getContext("2d");

    let largura = 0;
    let altura = 0;

    let pontos = [];
    let tempo = 0;
    let quadroAnterior = 0;
    let animacaoAtiva = false;

    const espacamento = 95;
    const distanciaConexao = 145;

    const velocidadeGeral = 0.35;
    const intensidadeMovimento = 0.65;

    const mouse = {
        x: -1000,
        y: -1000,
        raio: 220
    };

    const forcaMouse = 15;


    // Nova paleta oficial PALADINS
    const cores = {

        azul: "18, 60, 186",
        azulClaro: "22, 139, 255",
        dourado: "255, 184, 0",
        amarelo: "255, 210, 28",
        branco: "245, 247, 255"

    };


    /* ------------------------------------------
       AJUSTAR CANVAS
    ------------------------------------------ */

    function ajustarCanvas() {

        const proporcao = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        largura = window.innerWidth;
        altura = window.innerHeight;

        canvas.width = largura * proporcao;
        canvas.height = altura * proporcao;

        canvas.style.width = `${largura}px`;
        canvas.style.height = `${altura}px`;

        ctx.setTransform(
            proporcao,
            0,
            0,
            proporcao,
            0,
            0
        );

        criarMalha();
    }


    /* ------------------------------------------
       CRIAR PONTOS DA MALHA
    ------------------------------------------ */

    function criarMalha() {

        pontos = [];

        const colunas = Math.ceil(largura / espacamento) + 2;
        const linhas = Math.ceil(altura / espacamento) + 2;

        for (let y = -1; y < linhas; y++) {

            for (let x = -1; x < colunas; x++) {

                const origemX = x * espacamento;
                const origemY = y * espacamento;

                const sorteio = Math.random();

                let cor;

                if (sorteio > 0.94) {

                    cor = cores.branco;

                } else if (sorteio > 0.78) {

                    cor = cores.amarelo;

                } else if (sorteio > 0.55) {

                    cor = cores.dourado;

                } else if (sorteio > 0.30) {

                    cor = cores.azulClaro;

                } else {

                    cor = cores.azul;
                }


                pontos.push({

                    origemX,
                    origemY,

                    x: origemX,
                    y: origemY,

                    fase: Math.random() * Math.PI * 2,

                    velocidade: 0.5 + Math.random() * 0.35,

                    amplitude: 5 + Math.random() * 6,

                    tamanho: 1.2 + Math.random() * 1.2,

                    cor

                });

            }
        }
    }


    /* ------------------------------------------
       MOVIMENTO DOS PONTOS
    ------------------------------------------ */

    function movimentarPontos() {

        pontos.forEach((ponto) => {

            const movimentoX = Math.sin(
                tempo * 0.00012 * ponto.velocidade + ponto.fase
            ) * ponto.amplitude * intensidadeMovimento;

            const movimentoY = Math.cos(
                tempo * 0.00010 * ponto.velocidade + ponto.fase
            ) * ponto.amplitude * intensidadeMovimento;

            const destinoPontoX = ponto.origemX + movimentoX;
            const destinoPontoY = ponto.origemY + movimentoY;

            ponto.x += (destinoPontoX - ponto.x) * 0.045;
            ponto.y += (destinoPontoY - ponto.y) * 0.045;

            const dx = ponto.x - mouse.x;
            const dy = ponto.y - mouse.y;

            const distancia = Math.hypot(dx, dy);

            if (distancia < mouse.raio && distancia > 0) {

                const forca = Math.pow(
                    (mouse.raio - distancia) / mouse.raio,
                    2
                );

                ponto.x +=
                    (dx / distancia) * forca * forcaMouse * 0.08;

                ponto.y +=
                    (dy / distancia) * forca * forcaMouse * 0.08;

            }

        });
    }


    /* ------------------------------------------
       DESENHAR CONEXÕES DA MALHA
    ------------------------------------------ */

    function desenharConexoes() {

        const tamanhoGrade = Math.ceil(
            distanciaConexao / espacamento
        );

        const grade = new Map();

        pontos.forEach((ponto) => {

            const coluna = Math.floor(ponto.x / espacamento);
            const linha = Math.floor(ponto.y / espacamento);

            const chave = `${coluna},${linha}`;

            if (!grade.has(chave)) {
                grade.set(chave, []);
            }

            grade.get(chave).push(ponto);

        });


        pontos.forEach((ponto) => {

            const coluna = Math.floor(ponto.x / espacamento);
            const linha = Math.floor(ponto.y / espacamento);

            for (let y = -tamanhoGrade; y <= tamanhoGrade; y++) {

                for (let x = -tamanhoGrade; x <= tamanhoGrade; x++) {

                    const chave = `${coluna + x},${linha + y}`;

                    const vizinhos = grade.get(chave);

                    if (!vizinhos) continue;

                    vizinhos.forEach((vizinho) => {

                        if (vizinho === ponto) return;

                        const dx = ponto.x - vizinho.x;
                        const dy = ponto.y - vizinho.y;

                        const distancia = Math.hypot(dx, dy);

                        const ordemCorreta =
                            vizinho.origemY > ponto.origemY ||
                            (
                                vizinho.origemY === ponto.origemY &&
                                vizinho.origemX > ponto.origemX
                            );

                        if (
                            distancia < distanciaConexao &&
                            ordemCorreta
                        ) {

                            const intensidade =
                                1 - distancia / distanciaConexao;

                            const pertoDoMouse =
                                Math.hypot(
                                    ponto.x - mouse.x,
                                    ponto.y - mouse.y
                                ) < mouse.raio;

                            const opacidade = pertoDoMouse
                                ? intensidade * 0.48
                                : intensidade * 0.24;

                            const cor = ponto.cor;

                            ctx.beginPath();

                            ctx.moveTo(ponto.x, ponto.y);
                            ctx.lineTo(vizinho.x, vizinho.y);

                            ctx.strokeStyle =
                                `rgba(${cor}, ${opacidade})`;

                            ctx.lineWidth = 0.7;

                            ctx.stroke();

                        }

                    });

                }

            }

        });

    }


    /* ------------------------------------------
       PONTOS LUMINOSOS
    ------------------------------------------ */

    function desenharPontos() {

        pontos.forEach((ponto) => {

            const distanciaMouse = Math.hypot(
                ponto.x - mouse.x,
                ponto.y - mouse.y
            );

            const pertoDoMouse = distanciaMouse < mouse.raio;

            const tamanho = pertoDoMouse
                ? ponto.tamanho * 1.35
                : ponto.tamanho;

            ctx.beginPath();

            ctx.arc(
                ponto.x,
                ponto.y,
                tamanho,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(${ponto.cor}, 0.9)`;

            ctx.shadowBlur = pertoDoMouse ? 16 : 7;

            ctx.shadowColor =
                ponto.cor === cores.branco
                    ? "#FFFFFF"
                    : ponto.cor === cores.amarelo
                        ? "#FFD21C"
                        : ponto.cor === cores.dourado
                            ? "#FFB800"
                            : "#168BFF";

            ctx.fill();

        });

        ctx.shadowBlur = 0;
    }


    /* ------------------------------------------
       BRILHO AO REDOR DO MOUSE
    ------------------------------------------ */

    function desenharBrilhoMouse() {

        if (mouse.x < 0 || mouse.y < 0) return;

        const brilho = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            mouse.raio
        );

        brilho.addColorStop(
            0,
            "rgba(255, 210, 28, 0.12)"
        );

        brilho.addColorStop(
            0.45,
            "rgba(22, 139, 255, 0.07)"
        );

        brilho.addColorStop(
            1,
            "rgba(18, 60, 186, 0)"
        );

        ctx.beginPath();

        ctx.arc(
            mouse.x,
            mouse.y,
            mouse.raio,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = brilho;
        ctx.fill();
    }


    /* ------------------------------------------
       ANIMAÇÃO PRINCIPAL
    ------------------------------------------ */

    function animarMalha(timestamp) {

        if (!animacaoAtiva) return;

        const delta = quadroAnterior
            ? Math.min(timestamp - quadroAnterior, 32)
            : 16;

        quadroAnterior = timestamp;

        tempo += delta * velocidadeGeral;

        ctx.clearRect(0, 0, largura, altura);

        movimentarPontos();

        desenharBrilhoMouse();

        desenharConexoes();

        desenharPontos();

        requestAnimationFrame(animarMalha);
    }


    /* ------------------------------------------
       CONTROLE DA ANIMAÇÃO
    ------------------------------------------ */

    function iniciarAnimacao() {

        if (
            animacaoAtiva ||
            movimentoReduzido.matches
        ) return;

        animacaoAtiva = true;
        quadroAnterior = 0;

        ajustarCanvas();

        requestAnimationFrame(animarMalha);
    }


    function pararAnimacao() {

        animacaoAtiva = false;
    }


    /* ------------------------------------------
       INTERAÇÃO COM O MOUSE
    ------------------------------------------ */

    window.addEventListener("mousemove", (event) => {

        mouse.x = event.clientX;
        mouse.y = event.clientY;

    }, { passive: true });


    document.addEventListener("mouseleave", () => {

        mouse.x = -1000;
        mouse.y = -1000;

    });


    /* ------------------------------------------
       SUPORTE PARA TOQUE
    ------------------------------------------ */

    window.addEventListener("touchmove", (event) => {

        if (event.touches.length > 0) {

            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;

        }

    }, { passive: true });


    window.addEventListener("touchend", () => {

        mouse.x = -1000;
        mouse.y = -1000;

    });


    /* ------------------------------------------
       REDIMENSIONAMENTO
    ------------------------------------------ */

    window.addEventListener("resize", () => {

        if (animacaoAtiva) {
            ajustarCanvas();
        }

    });


    /* ------------------------------------------
       MOVIMENTO REDUZIDO
    ------------------------------------------ */

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