import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      selectedMove: {
        select: null,
        target: null,
      },
      hint: null,
    };
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const thisMove = this.state.xIsNext ? "X" : "O";
    const positions = [
      ["upper", "middle", "lower"],
      ["left", "middle", "right"],
    ];
    if (calculateWinner(squares)) {
      return;
    }
    // This should be where our new logic or chorus-lapilli comes in
    if (this.state.stepNumber <= 5) {
      if (squares[i] != null) return;
      squares[i] = thisMove;
      this.setState({
        history: history.concat([
          {
            squares: squares,
          },
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    } else {
      if (this.state.selectedMove.select === null) {
        // selecting which to move
        if (squares[i] !== thisMove) return;
        this.setState({
          selectedMove: {
            select: i,
            target: null,
          },
          hint:
            "selected " +
            thisMove +
            " at " +
            positions[0][Math.floor(i / 3)] +
            " " +
            positions[1][i % 3],
        });
      } else {
        // selecting where to move
        if (squares[i] !== null) return;
        let j = i;
        i = this.state.selectedMove.select;
        if (moveValid(i, j)) {
          squares[j] = thisMove;
          squares[i] = null;
        } else {
          this.setState({
            selectedMove: {
              select: null,
              target: null,
            },
            hint:
              "Cannot move " +
              thisMove +
              " from " +
              positions[0][Math.floor(i / 3)] +
              " " +
              positions[1][i % 3] +
              " to " +
              positions[0][Math.floor(j / 3)] +
              " " +
              positions[1][j % 3] +
              ". Has reset selected " +
              thisMove,
          });
          return;
        }
        if (
          calculateWinner(squares) === null &&
          squares[4] === thisMove &&
          j !== 4
        ) {
          this.setState({
            hint:
              thisMove +
              " has a piece in middle middle but did not win, so invalid move.",
            selectedMove: {
              select: null,
              target: null,
            },
          });
          return;
        }
        this.setState({
          history: history.concat([
            {
              squares: squares,
            },
          ]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
          selectedMove: {
            select: null,
            target: null,
          },
          hint:
            "moved " +
            thisMove +
            " at " +
            positions[0][Math.floor(i / 3)] +
            " " +
            positions[1][i % 3] +
            " to " +
            positions[0][Math.floor(j / 3)] +
            " " +
            positions[1][j % 3],
        });
      }
    }
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const hint = this.state.hint;
    const moves = history.map((step, move) => {
      // map((element, index) => { ... })
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{hint}</div>
          <ol>{moves}</ol>
        </div>
        <div className="game-rules" style={{ position: "fixed", bottom: 0 }}>
          <p>
            Chorus lapilli is like{" "}
            <a href="https://en.wikipedia.org/wiki/Tic-tac-toe">tic-tac-toe</a>{" "}
            in that players take turn placing pieces on a 3×3 board and the goal
            is to get three pieces in a row. However, it differs from
            tic-tac-toe in two ways:
          </p>
          <ul>
            <li>
              After your first three moves, instead of adding further pieces you
              must instead move one of your existing pieces to an empty square
              that is adjacent vertically, horizontally, or diagonally.
              Therefore, after your third move you always occupy three squares.
            </li>
            <li>
              If you have three pieces on the board and one of your pieces is in
              the center square, you must either win or vacate the center square
              in your next move.
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function moveValid(i, j) {
  if (!(i >= 0 && i <= 8 && j >= 0 && j <= 8)) return false;
  return (
    Math.abs(Math.floor(i / 3) - Math.floor(j / 3)) <= 1 &&
    Math.abs((i % 3) - (j % 3)) <= 1
  );
}
// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
