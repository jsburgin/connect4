$(function() {
	var socket = io();
	var playerId = null;

	var currentPlayer = null;
	var playing = false;

	socket.on('player', function(id) {
		playerid = id;
		console.log('You are player ' + playerid);
	});

	socket.on('message', function(message) {
		console.log(message);
	});

	socket.on('end', function(message) {
		$('body').html('');
		$('body').append('<p>Your opponent has disconnected</p>');
	});

	socket.on('board', function(player, board) {
		console.log(board);
		currentPlayer = player;

		$('body').html('');
		drawBoard(board, player == playerid);

		if (currentPlayer == playerid) {
			playing = true;
		}

	});

	$(document).on('click', '.empty.click', function(event) {
		if (playing) {
			playing = false;
			
			var playedCol = event.currentTarget.getAttribute('col');
			var playedRow = event.currentTarget.getAttribute('row');
			socket.emit('move', playerid, playedRow, playedCol);
		}
		
	});

	socket.on('winner', function(player, board) {
		if (true) {
			$('body').html('');
			drawBoard(board, false);

			if (player == playerid) {
				$('body').append("<p class='turn-card'>Congratulations, you've won!");
			} else {
				$('body').append("<p class='turn-card'>You lose.</p>");
			}
		}
	});

});

function drawBoard(board, yourPlay) {
	for (var i = 0; i < board.length; i++) {
		var row = board[i];
		var rowString = '';
		var clickClass = '';

		for (var j = 0; j < row.length; j++) {
			var currentNode = row[j];
			if (yourPlay) {
				clickClass = 'click';
			}

			if (currentNode == 0) {
				
				if (i != 9 && board[i + 1][j] == 0) {
					clickClass = '';
				}

				rowString += '<div class="node empty ' + clickClass +'" col="' + j + '" row="' + i + '"></div>';

			} else if (currentNode == 1) {
				rowString += '<div class="node red" col="' + j + '"></div>';
			} else {
				rowString += '<div class="node blue" col="' + j + '"></div>';
			}
		}

		$('body').append('<p>' + rowString + '</p>');


	}

	if (yourPlay) {
		$('body').append('<p class="turn-card">Your turn Player ' + playerid + '!</p>');
	}

}