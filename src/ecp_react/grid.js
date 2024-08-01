import React from 'react';

export function Row(props) {
	const {className, style, ...others} = props;
	return  (
		<div style={{display:"flex", ...style}} className={className} {...others} >
			{props.children}
		</div>
	);
}

export function Col(props) {
	const {className, style, width, ...others} = props;
	return  (
		<div style={{...style, width }} className={className} {...others}>
			{props.children}
		</div>
	);
}
const Grid={Row, Col}
export default Grid
