window.onload = function (event) {
    loadGame();
};
function loadGame() {
    var minesweeper = new Minesweeper();
    //minesweeper.run();
}
class BoardElement {
    constructor(minesweeper, x, y) {
        this._hidden = true;
        this._marked = false;
        this.content = 0;
        this._minesweeper = minesweeper;
        this._x = x;
        this._y = y;
        this._element = document.createElement('div');
        this._element.className = 'board';
        this._number = document.createElement('div');
        this._number.className = 'number';
        this._overlay = document.createElement('div');
        this._overlay.className = 'overlay';
        this._element.appendChild(this._number);
        this._element.appendChild(this._overlay);
        this._number.textContent = ' ';
        this._element.onclick = this._handleClick.bind(this);
        this._element.oncontextmenu = this._handleRightClick.bind(this);
        this._element.onmouseenter = this._handleMouseEnter.bind(this);
        this._element.onmouseleave = this._handleMouseLeave.bind(this);
        this._element.onmousedown = this._handleMouseDown.bind(this);
        this._element.onmouseup = this._handleMouseUp.bind(this);
        this._element.ondblclick = function (event) {
            event.preventDefault();
        };
    }
    reset() {
        this._number.classList.remove('bomb');
        this._number.textContent = ' ';
        this._overlay.style.visibility = 'visible';
        this.content = 0;
        this._hidden = true;
        this._marked = false;
        this._overlay.classList.remove('marked');
    }
    isHidden() {
        return this._hidden;
    }
    isVisible() {
        return !this._hidden;
    }
    isMarked() {
        return this._marked;
    }
    _handleClick(event) {
        if (!this._minesweeper.isRunning)
            this._minesweeper.run(this._x, this._y);
        if (this.isVisible()) {
            if (event.buttons === 2 || (event.button === 1 && event.buttons === 0)) {
                var handleCascade = this.content && this._minesweeper.countMarkedNeighbors(this._x, this._y) === this.content;
                if (handleCascade) {
                    this._minesweeper.visitNeighbors(this._x, this._y, function (boardElement) {
                        boardElement.show();
                    });
                }
            }
            return;
        }
        else if (event.button !== 0 || this._marked)
            return;
        this.show();
    }
    show() {
        if (this.isVisible() || this._marked)
            return;
        this._hidden = false;
        if (this.content === 0) {
            this._minesweeper.visitNeighbors(this._x, this._y, function (boardElement) {
                boardElement.show();
            });
        }
        else if (this.content === Minesweeper.BOMB) {
            this._number.classList.add('bomb');
            this._minesweeper.end();
            return;
        }
        else
            this._number.textContent = this.content.toString();
        this._overlay.style.visibility = 'hidden';
        this._minesweeper.reportBlank();
    }
    _handleRightClick(event) {
        event.preventDefault();
        if (this.isVisible())
            return;
        else if (!this._marked) {
            this._marked = true;
            this._overlay.classList.add('marked');
        }
        else {
            this._marked = false;
            this._overlay.classList.remove('marked');
        }
    }
    _handleMouseEnter(event) {
        //if (this.isHidden() && this._minesweeper.mouseDown)
        //	this._overlay.style.visibility = 'hidden';
    }
    _handleMouseLeave(event) {
        //if (this.isHidden())
        //	this._overlay.style.visibility = 'visible';
    }
    _handleMouseDown(event) {
        //if (this.isHidden() && event.button === 0)
        //	this._minesweeper.mouseDown = true;
    }
    _handleMouseUp(event) {
        if (event.button !== 0)
            return;
    }
    getElement() {
        return this._element;
    }
}
class Minesweeper {
    constructor() {
        this._x = 30;
        this._y = 16;
        this._numBombs = 99;
        this._boardElements = null;
        this._interval = 0;
        this.mouseDown = false;
        this.isRunning = false;
        this._numBlanks = (this._x * this._y) - this._numBombs;
        this._element = document.getElementsByClassName('minesweeper')[0];
        this._clock = document.createElement('div');
        this._clock.textContent = '0';
        document.body.appendChild(this._clock);
        this._element.style.width = (this._x * 25) + 'px';
        this._zeroBombArray();
        this._printBoard();
    }
    run(clickX, clickY) {
        this._numBlanks = (this._x * this._y) - this._numBombs;
        this.isRunning = true;
        this._generateBoard(clickX, clickY);
        let tick = 0;
        let clock = this._clock;
        this._interval = setInterval(function () {
            tick++;
            clock.textContent = tick.toString();
        }, 1000);
    }
    end() {
        this.isRunning = false;
        clearInterval(this._interval);
        for (let y = 0; y < this._y; y++) {
            for (let x = 0; x < this._x; x++) {
                this._boardElements[x][y].reset();
            }
        }
    }
    reportBlank() {
        this._numBlanks--;
        if (this._numBlanks === 0) {
            console.log("you won?!");
            this.end();
        }
    }
    _zeroBombArray() {
        this._boardElements = [];
        for (let x = 0; x < this._x; x++) {
            this._boardElements.push([]);
            for (let y = 0; y < this._y; y++) {
                this._boardElements[x].push(new BoardElement(this, x, y));
            }
        }
    }
    _generateBoard(clickX, clickY) {
        let boardElements = this._boardElements;
        let maxX = this._x;
        let maxY = this._y;
        function visitNeighbor(x, y) {
            if (x < 0 || y < 0 || x >= maxX || y >= maxY)
                return;
            if (boardElements[x][y].content !== Minesweeper.BOMB)
                boardElements[x][y].content++;
        }
        let placedBombs = 0;
        while (placedBombs < this._numBombs) {
            let x = Minesweeper._getRandomLocation(this._x);
            let y = Minesweeper._getRandomLocation(this._y);
            if (boardElements[x][y].content === Minesweeper.BOMB || (x === clickX && y === clickY))
                continue;
            boardElements[x][y].content = Minesweeper.BOMB;
            this.visitNeighbors(x, y, (boardElement) => {
                if (boardElement.content !== Minesweeper.BOMB)
                    boardElement.content++;
            });
            placedBombs++;
        }
    }
    countMarkedNeighbors(x, y) {
        let bombs = this._boardElements;
        let maxX = this._x;
        let maxY = this._y;
        function visitNeighbor(x, y) {
            if (x < 0 || y < 0 || x >= maxX || y >= maxY)
                return 0;
            return bombs[x][y].isMarked() ? 1 : 0;
        }
        return visitNeighbor(x - 1, y - 1) +
            visitNeighbor(x, y - 1) +
            visitNeighbor(x + 1, y - 1) +
            visitNeighbor(x - 1, y) +
            visitNeighbor(x + 1, y) +
            visitNeighbor(x - 1, y + 1) +
            visitNeighbor(x, y + 1) +
            visitNeighbor(x + 1, y + 1);
    }
    visitNeighbors(x, y, func) {
        let bombs = this._boardElements;
        let maxX = this._x;
        let maxY = this._y;
        function visitNeighbor(x, y) {
            if (x < 0 || y < 0 || x >= maxX || y >= maxY)
                return;
            func(bombs[x][y]);
        }
        this.isRunning && visitNeighbor(x - 1, y - 1);
        this.isRunning && visitNeighbor(x, y - 1);
        this.isRunning && visitNeighbor(x + 1, y - 1);
        this.isRunning && visitNeighbor(x - 1, y);
        this.isRunning && visitNeighbor(x + 1, y);
        this.isRunning && visitNeighbor(x - 1, y + 1);
        this.isRunning && visitNeighbor(x, y + 1);
        this.isRunning && visitNeighbor(x + 1, y + 1);
    }
    _printBoard() {
        let appendDiv = document.createElement('div');
        for (let y = 0; y < this._y; y++) {
            let div = document.createElement('div');
            div.className = 'row';
            for (let x = 0; x < this._x; x++) {
                div.appendChild(this._boardElements[x][y].getElement());
            }
            appendDiv.appendChild(div);
        }
        this._element.appendChild(appendDiv);
    }
    static _getRandomLocation(max) {
        return Math.floor(Math.random() * max);
    }
}
Minesweeper.BOMB = -999;
