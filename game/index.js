var gameCount = 0;

var gridSize = {
    rows: 6,
    columns: 7
};

module.exports = function(io) {
    var games = {};
    var waiting = [];
    // socket.id:game id
    var playerGame = {};

    io.on('connection', function(socket) {
        socket.emit('message', 'Waiting for an opponent...');
        waiting.push(socket);
        createGame();

        var done = 'Your opponent has disconnected';

        socket.on('disconnect', function() {
            var removed = false;

            for (var i = 0; i < waiting.length; i++) {
                if (waiting[i].id == socket.id) {
                    waiting.splice(i, 1);
                    break;
                    removed = true;
                }
            }

            if (!removed) {
                var currentGame = games[playerGame[socket.id]];

                if (currentGame) {

                    if (currentGame.playerOne.id != socket.id) {
                        currentGame.playerOne.emit('end', done);
                    } else {
                        currentGame.playerTwo.emit('end', done);
                    }

                    delete games[playerGame[socket.id]];    
                }   
            }
            
        });

        socket.on('move', function(player, row, col) {
            var currentGame = games[playerGame[socket.id]];

            currentGame.board[row][col] = player;

            var winner = checkForWin(currentGame.board, player, parseInt(row), parseInt(col));

            if (winner) {
                currentGame.playerOne.emit('winner', player, currentGame.board);
                currentGame.playerTwo.emit('winner', player, currentGame.board);
            } else {

                if (currentGame.currentPlayer == 1) {
                    ++currentGame.currentPlayer;
                } else {
                    --currentGame.currentPlayer;
                }

                currentGame.playerOne.emit('board', currentGame.currentPlayer, currentGame.board);
                currentGame.playerTwo.emit('board', currentGame.currentPlayer, currentGame.board);  
            }

            
        });

    });

    function createGame() {
        if (waiting.length > 1) {
            var playerOne = waiting.shift(),
                playerTwo = waiting.shift();

            var currentGameCount = ++gameCount;
            games[currentGameCount] = {
                playerOne: playerOne,
                playerTwo: playerTwo,
                currentPlayer: 1,
                board: getBoard()
            };

            playerGame[playerOne.id] = currentGameCount;
            playerGame[playerTwo.id] = currentGameCount;

            playerOne.emit('player', 1);
            playerTwo.emit('player', 2);

            playerOne.emit('board', 1, games[currentGameCount].board);
            playerTwo.emit('board', 1, games[currentGameCount].board);
        }
    }


    function getBoard() {
        var board = [];

        for (var i = 0; i < gridSize.rows; i++) {
            var row = [];

            for (var j = 0; j < gridSize.columns; j++) {
                row.push(0);
            }

            board.push(row);
        }
        return board;
    }

    function checkForWin(board, player, row, col) {

        var directions = [
            [-1,-1,1,1],
            [-1,1,1,-1],
            [-1,0,1,0],
            [0, -1, 0, 1]
        ];

        for (var q = 0; q < directions.length; q++) {
            var direction = directions[q];
            var count = 1;

            for (var z = 0; z < 2; z++) {

                var currentRow = row;
                var currentCol = col;
                
                if (z == 0) {
                    var y = direction[0];
                    var x = direction[1];
                } else {
                    var y = direction[2];
                    var x = direction[3];
                }

                while (true) {
                    currentRow += y;
                    currentCol += x;

                    if (currentRow < 0 || currentRow > gridSize.rows - 1 || currentCol < 0 || currentCol > gridSize.columns - 1) {
                        break;
                    }

                    
                    if (board[currentRow][currentCol] == player) {
                        count++;    
                    } else {
                        break;
                    }
                        
                }
            }

            if (count > 3) {
                return true;
            }

        }

    }

    return false;

}