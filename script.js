var SELECTED_CELL = null;
var PUZZLE = [];
var SELECTED_DIFFICULTY = 'easy';
var BOARD_INFO = [[0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0],
                ];

function selectCell(id) {
    id = id.toString();
    SELECTED_CELL = id;
    $(".cell").removeClass("selectedCell");
    $("#" + SELECTED_CELL).addClass("selectedCell");
}

function getId(r, c) {
    return((r+1).toString() + (c+1).toString());
}

function setDifficulty(diff) {
    $("#difficulties>button").removeClass("selectedDiff");
    $("#" + diff).addClass("selectedDiff");
    SELECTED_DIFFICULTY = diff;
}

function getPos(id) {
    id = id.toString();

    var r = parseInt(id[0])-1;
    var c = parseInt(id[1])-1;
    return ([r, c]);
}

function setBoard(solution) {

    // console.log(solution);
    

    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            // console.log(PUZZLE);
            var given = (PUZZLE[r][c] == 0);
            BOARD_INFO[r][c] = {
                "isGiven": given,
                "truth": solution[r][c],
                "userNum": ""
                
            }
        }
    }

    setGivenClass();
    displayBoard();
}

function setGivenClass() {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            
            var id = getId(r, c);
            if (BOARD_INFO[r][c].isGiven) {
                $("#" + id).addClass("given");
            } else {
                $("#" + id).removeClass("given");
            }
            
        }
    }
}

function displayBoard() {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            var id = "#" + getId(r, c);
            cellInfo = BOARD_INFO[r][c];
            if (cellInfo.isGiven) {
                $(id).text(cellInfo.truth);
            } else {
                $(id).text(cellInfo.userNum);
            }
        }
    }
}

function stringPuzzle() {
    var string = "[";

    for (var r = 0; r < 9; r++) {
        string += "[";
        for (var c = 0; c < 9; c++) {
            string += PUZZLE[r][c];
            if (c != 8) {
                string += ",";
            }
        }
        string += "]";
        if (r != 8) {
            string += ",";
        } else {
            string += "]";
        }
    }
    return(string);
}

function newGame() {

    var URL = 'https://sugoku.herokuapp.com/board?difficulty=' + SELECTED_DIFFICULTY;

    fetch(URL).then(function (response) {
        // The API call was successful!
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then(function (puzzle) {
        PUZZLE = puzzle.board;
        var data = {board: stringPuzzle()};

        $.post('https://sugoku.herokuapp.com/solve', data).done(function (response) {

            setBoard(response.solution); 

        });

    }).catch(function (err) {
        // There was an error
        console.error(err);
        M.toast({html: 'The server is not responding. Please check your connection and try again later.'});

    });


}

function cell(r, c) {
    var id = getId(r, c);
    return("<div class='cell' onclick='selectCell(" + id + 
        ")' id='" + id + "'></div>");
}

function numberSelected(num) {
    if (SELECTED_CELL == null) {
        return;
    }
    [r, c] = getPos(SELECTED_CELL);
    BOARD_INFO[r][c].userNum = num;
    displayBoard();
}

function deleteNum() {
    if (SELECTED_CELL == null) {
        return;
    }
    [r, c] = getPos(SELECTED_CELL);
    BOARD_INFO[r][c].userNum = "";
    displayBoard();
}

$(document).keydown(function(e) {
    if (SELECTED_CELL == null) {
        return;
    }
    [r, c] = getPos(SELECTED_CELL);

    if (e.which == 8) {
        deleteNum();
    } else if (e.which >= 49 && e.which <= 57) {
        numberSelected(e.which - 48);
        
    } else if (e.which == 37 && c > 0) {
        // move selected cell left by one
        selectCell(getId(r, c-1));
    } else if (e.which == 38 && r > 0) {
        // move selected cell up by one
        selectCell(getId(r-1, c));
    } else if (e.which == 39 && c < 8) {
        // move selected cell right by one
        selectCell(getId(r, c+1));
    } else if (e.which == 40 && r < 8) {
        // move selected cell down by one
        selectCell(getId(r+1, c));
    }
    
});

function check() {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (!(BOARD_INFO[r][c].isGiven)) {
                if (BOARD_INFO[r][c].truth != BOARD_INFO[r][c].userNum) {
                    M.toast({html: 'Not quite yet, keep going!', classes: 'red'});
                    return;
                }
            }
        }
    }
    M.toast({html: 'Congratulations, you did it!', classes: 'green'});
}

function numberButton(num) {
    return ("<div class='num-button' onclick='numberSelected(" + 
        num.toString() + ")'>" + num.toString() + "</div>");
}


$(document).ready(function() {

    // Create the cells
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            $("#sudoku-board").append(cell(r, c));
        }
        
    }

    // Create the number buttons
    for (var num = 1; num <= 9; num++) {
        $("#number-buttons").append(numberButton(num));
    }

    $("#number-buttons").append(
        `<div class='num-button' onclick='deleteNum()'>
            <img src="images/backspace.svg"/>
        </div>`)


    newGame();
    
    
});
