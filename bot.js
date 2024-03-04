const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

const perguntasJSON = JSON.parse(fs.readFileSync('perguntas.json', 'utf-8'));

function obterPerguntaAleatoria() {
    const indice = Math.floor(Math.random() * perguntasJSON.length);
    return perguntasJSON[indice];
}

let aguardandoResposta = false;

function enviarPergunta(ctx) {
    const pergunta = obterPerguntaAleatoria();
    const teclado = Markup.inlineKeyboard(
        pergunta.alternativas.map(a => [Markup.button.callback(a.texto, `resposta_${pergunta.id}_${a.opcao}`)])
    );
    ctx.replyWithMarkdown(`Pergunta: *${pergunta.pergunta}*`, teclado);
}

function exibirResposta(ctx, pergunta, respostaCorreta) {
    let resposta = "";
    
    if (respostaCorreta) {
        resposta = "Resposta correta!";
    } else {
        resposta = "Resposta incorreta!";
    }
    const teclado = Markup.inlineKeyboard([Markup.button.callback('Nova Pergunta', 'nova_pergunta')]);
    ctx.replyWithMarkdown(resposta + ' Selecione "Nova Pergunta" para continuar.', teclado);
}

module.exports = { enviarPergunta, exibirResposta, obterPerguntaAleatoria, perguntasJSON };

