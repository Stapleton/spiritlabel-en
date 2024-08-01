import React from 'react';
import PropTypes from 'prop-types';
import Service from './service.js';

const isEmptyChildren = (children) =>
  React.Children.count(children) === 0

class AuthBlock extends  React.Component {
	
	static defaultProps = {
		minLevel : -1,
		state    : 'authed',
	}	
		
	static contextTypes = {
		authState : PropTypes.number.isRequired,
		customer  : PropTypes.object.isRequired,
	}
	
	state={
		match: this.computeMatch(this.props, this.context)
	}
		
	computeMatch(props, context) {
		if (Array.isArray(props.state)) 
			return (
				props.state.some(e=>context.authState==Service.STATE[e]) && 
				( typeof props.level=='undefined' || props.level==context.customer.level ) && 
				props.minLevel<=context.customer.level &&
			  ( typeof props.check!='function' || props.check(context) ) 
			)
		else return (
				context.authState==Service.STATE[props.state] && 
				( typeof props.level=='undefined' || props.level==context.customer.level ) && 
				props.minLevel<=context.customer.level &&
				( typeof props.check!=='function' || props.check(context) ) 
			)
	}
	
	componentWillReceiveProps(nextProps, nextContext) {
		this.setState({
		      match: this.computeMatch(nextProps, nextContext)
		})
	}
	
	render() {
		const { match } = this.state
		const {state, component, render, children }=this.props;
		const props={...this.context, service:Service };
		
		if (component)
			return match ? React.createElement(component, props) : null
		
		if (render)
			return match ? render(props) : null
				
		if (children && !isEmptyChildren(children))
			return match ? React.Children.only(children) : null
		
		return null;
	}	
}

class Auth extends React.Component {
	state={
		authState : 0
	}
	
	static childContextTypes = {
		authState : PropTypes.number.isRequired,
		customer  : PropTypes.object.isRequired,
	}

	getChildContext() {
    		return {
			authState : this.state.authState,
			customer  : Service.customer,
		    }
	}
	
	componentWillMount() {
		Service.connect((authState)=>{
			if (this.props.post_auth && authState==Service.STATE.authed) {
				this.props.post_auth(Service, Service.customer)
					.then(()=>this.setState({authState}));
			}else{
				this.setState({authState});
			}
		});
	}

	render() {
		return React.Children.only(this.props.children);
	}
}

export { Auth as default, Auth, AuthBlock };
