import React from 'react';
import {DivWin, Msg} from './divwin.js';
import Button  from './button.js';

class ConfirmBtn extends React.Component {
	
	onClick=(e)=>{
		const olde=e;
		DivWin.confirm(
			<Msg>
				{this.props.msg?this.props.msg:'确认继续吗?'}
			</Msg>,
			
			()=>{
				this.props.onClick(olde)
			}
		);
	}
	
	render() {
		const {onClick, msg, title, ...ohters}=this.props
		return  (
			<Button onClick={this.onClick} {...ohters}/>
		);
	}
}

export default ConfirmBtn;
