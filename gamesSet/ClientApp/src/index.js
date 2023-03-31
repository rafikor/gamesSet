import React from "react";
import { render } from 'https://cdn.skypack.dev/react-dom'

import "./custom.css"

const styleButton = {
	background: "lightblue",
	border: "2px solid darkblue",
	fontSize: "30px",
	fontWeight: "800",
	cursor: "pointer",
	outline: "none",
};

const style = {
	border: "4px solid darkblue",
	borderRadius: "10px",
	width: "250px",
	height: "250px",
	margin: "0 auto",
	display: "grid",
	gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
};


const Square = ({ value, onClick }) => (
	<button style={styleButton} onClick={onClick}>
		{value}
	</button>
);


const Game = ({ onClick}) => (
	<div style={style}>
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