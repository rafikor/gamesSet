import React from "react";
import { render } from 'https://cdn.skypack.dev/react-dom'

import "./custom.css"

const styleSquare = {
	background: "lightblue",
	border: "2px solid darkblue",
	fontSize: "30px",
	fontWeight: "800",
	cursor: "pointer",
	outline: "none",
};

const Square = ({ value, onClick }) => (
	<button style={styleSquare} onClick={onClick}>
		{value}
	</button>
);

const Game = ({ onClick}) => (
	<div>
		<Square value="1" onClick={() => onClick("dummy value")} />
		<Square value="2" onClick={() => onClick("dummy value")} />
		<Square value="3" onClick={() => onClick("dummy value")} />
		<Square value="4" onClick={() => onClick("dummy value")} />
		<Square value="5" onClick={() => onClick("dummy value")} />
		<Square value="6" onClick={() => onClick("dummy value")} />
		<Square value="7" onClick={() => onClick("dummy value")} />
		<Square value="8" onClick={() => onClick("dummy value")} />
		<Square value="9" onClick={() => onClick("dummy value")} />
	</div>

);

const voidFunc = () => { };

render(<Game onClick={voidFunc} />, document.getElementById('app'))