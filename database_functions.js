const connection = require('./database');

function cadastrarJogador(userId) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO jogador (id, pontos) VALUES (?, ?)';
        connection.query(query, [userId, 0], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function mostrarPontos(userId){
    return new Promise((resolve, reject) => {
        const query = 'SELECT pontos FROM jogador WHERE id = ?'
        connection.query(query, [userId], (error, results) => {
            if(error){
                reject(error);
            }else{
                resolve(results)
            }
        })
    })
}

function adicionarPontos(userId, pontos) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE jogador SET pontos = pontos + ? WHERE id = ?';
        connection.query(query, [pontos, userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function removerPontos(userId, pontos) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE jogador SET pontos = GREATEST(0, pontos - ?) WHERE id = ?';
        connection.query(query, [pontos, userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = { cadastrarJogador, adicionarPontos, removerPontos, mostrarPontos };
