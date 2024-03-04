const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
const { botToken } = require('./config');
const { obterPerguntaAleatoria } = require('./bot');
const { cadastrarJogador, adicionarPontos, removerPontos, mostrarPontos } = require('./database_functions');
const perguntasJSON = JSON.parse(fs.readFileSync('perguntas.json', 'utf-8'));

const bot = new Telegraf(botToken);

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
        const userId = ctx.from.id;
        adicionarPontos(userId, 5)
            .then(() => {
                console.log('Pontos adicionados com sucesso');
            })
            .catch((error) => {
                console.error('Erro ao adicionar pontos:', error);
            });
    } else {
        resposta = "Resposta incorreta!";
        const userId = ctx.from.id;
        removerPontos(userId, 3)
            .then(() => {
                console.log('Pontos removidos com sucesso');
            })
            .catch((error) => {
                console.error('Erro ao remover pontos:', error);
            });
    }
    const teclado = Markup.inlineKeyboard([Markup.button.callback('Nova Pergunta', 'nova_pergunta')]);
    ctx.replyWithMarkdown(resposta + ' Selecione "Nova Pergunta" para continuar.', teclado);
}

bot.start((ctx) => {
    const userId = ctx.from.id;
    cadastrarJogador(userId)
        .then(() => {
            console.log(`Usuário ${userId} cadastrado com sucesso.`);
        })
        .catch((error) => {
            console.error('Erro ao cadastrar jogador:', error);
        });
    ctx.reply('Lista de comandos:\n - /jogar -> Iniciar o jogo\n - /pontos -> Verificar pontos');
});

bot.command('jogar', (ctx) => {
    if (!aguardandoResposta) {
        enviarPergunta(ctx);
        aguardandoResposta = true;
    } else {
        ctx.reply('Aguarde a resposta antes de iniciar um novo jogo.');
    }
});


bot.command('pontos', (ctx) => {
    const userId = ctx.from.id;

    mostrarPontos(userId)
        .then((results) => {
            let pontos = 0;
            if (results.length > 0) {
                pontos = results[0].pontos;
            }
            ctx.reply(`Seus pontos são: ${pontos}`);
        })
        .catch((error) => {
            console.error('Erro ao mostrar pontos:', error);
            ctx.reply('Ocorreu um erro ao recuperar seus pontos. Por favor, tente novamente mais tarde.');
        });
});

bot.action(/resposta_(\d+)_(\w+)/, (ctx) => {
    if (aguardandoResposta) {
        const resposta = ctx.match[2];
        const perguntaId = parseInt(ctx.match[1]);

        const pergunta = perguntasJSON.find(p => p.id === perguntaId);
        if (!pergunta) {
            return ctx.reply('Pergunta não encontrada.');
        }

        const alternativaCorreta = pergunta.alternativas.find(a => a.correta);
        if (!alternativaCorreta) {
            return ctx.reply('Alternativa correta não encontrada para esta pergunta.');
        }

        const respostaCorreta = resposta === alternativaCorreta.opcao;
        exibirResposta(ctx, pergunta, respostaCorreta);
        aguardandoResposta = false;
    }
});

bot.action('nova_pergunta', (ctx) => {
    if (!aguardandoResposta) {
        enviarPergunta(ctx);
        aguardandoResposta = true;
    } else {
        ctx.reply('Aguarde a resposta antes de enviar uma nova pergunta.');
    }
});

bot.launch();
