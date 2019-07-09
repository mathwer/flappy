function novoElemento (tagName, className){
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira(reversa = false){ //Criando a barreira
    this.elemento = novoElemento ('div', 'barreira')    //Criando um elemento que pode ser referenciado pelo DOM 

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');

    this.elemento.appendChild(reversa? corpo : borda) //Se não for reversa, primeiro coloca corpo e depois borda, se for, primeiro borda e depois corpo 
    this.elemento.appendChild(reversa? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`  //Seta a altura do corpo. Pode fazer isso ficar aleatório para que venha em tamanhos variados.

}

// const b = new Barreira(true)
// b.setAltura(200)             Testando as crianção de barreiras 
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true); //Quando usa o this nesse caso, essa função passa a ser visível fora da função, pois é uma função construtora.
    this.inferior = new Barreira(false); //Isso ajuda mais na frente quando for utilizar esses elementos para calcular colisão 

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () =>  { 
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior //Calculando a altura inferior com base no resultado achado na superior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) //Pegando a primeira parte da string, por exemplo 100px viram 100 em inteiro
    this.setX = x => this.elemento.style.left = `${x}px` //Alterando a função atual
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto){    //Construir várias barreiras 
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 // Será a velocidade da barreira
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento) //Deslocando a barreira ao longo do eixo X 

            //Vendo se o elemento saiu da tela do jogo
            if (par.getX() < -par.getLargura()){ //Quando some completamente do jogo
                par.setX(par.getX() + espaco * this.pares.length) //Manda pro final da tela, ficando como o último par. 
                par.sortearAbertura() //Sortear uma nova abertura, para não ficar tudo sempre na mesma posição.
            }

            const meio = largura / 2 
            const cruzouOMeio = par.getX() + deslocamento >= meio //Acabou de cruzar o meio
                && par.getX() < meio

            if(cruzouOMeio) notificarPonto()
        })
    }
}   

function Passaro(alturaDoJogo){
    let voando = false    
    this.elemento = novoElemento ('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = () => voando = true; //Caso o usuário aperte qualquer tecla, o pássaro irá voar 
    window.onkeyup = () => voando = false; 

    this.animar = () =>{
        const novoY = this.getY() + (voando ? 8 : -5) // Ele sobe mais rápido do que desce
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight

        if (novoY <= 0){ //Pode fazer como colisão também, não só com limites 
            this.setY(0) // Impede o objeto de passar do chão 
        } else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima) //Impede de passar do topo
        }
        else{
            this.setY(novoY)
        }

    }

    this.setY(alturaDoJogo/2) //Altura inical 
}
//  //Testando -> funcionou... eu acho
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => {areaDoJogo.appendChild(par.elemento)})
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}


function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if (!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(){ 
    let pontos = 0 

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos)) //Notificando pontos da barreira
    
    const passaro = new Passaro(altura);

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo, utilizando uma API serão feitas coisas diferentes
        const temporizador = setInterval(()=> {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }   
}

new FlappyBird().start()
