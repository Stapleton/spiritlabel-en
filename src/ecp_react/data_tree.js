import React from "react";
import net from './net.js';
import Util from './util.js';

import inpcss from './input.module.scss';
import modal from "./modal.module.css";
import css from "./data_tree.module.css";
import "./glyphicons.css";

class Select extends React.Component {

	state={
		node_st:{}
	}

	/**
	 * 递归生成tree
	 * @param tree
	 * @param level
	 * @returns {Array}
	 */
	generateTree=(tree, level)=>{
		if (!tree) return '';

		let {node_st}=this.state;

		let vdom = [];
		if (tree instanceof Array) {
			vdom.push(<ul>{tree.map((o,i)=>this.generateTree(o, level))}</ul>);
		} else {
			const title = (<span onClick={this.onSelect(tree)} >{tree.name}</span>);
			if (tree.sons) {
				const expand = (<span onClick={this.onSonClicked(tree.id)} className={Util.classNames(css.fold, node_st[tree.id]?css.close:css.open)}></span>);
				const li = <li key={tree.id}>{expand}{title}{node_st[tree.id]?this.generateTree(tree.sons, level+1):''}</li>;
				vdom.push(li);
			}else{
				const li = <li key={tree.id}><span className={`${css.leaf}`}></span>{title}</li>;
				vdom.push(li);
			}
		}
		return vdom;
	}

	onSelect=tree=>()=>{
		this.props.onSelect(tree.id, tree.name);
	}

	onSonClicked=id=>()=>{
		this.setState(({node_st})=>{
			node_st[id]=!(node_st[id])
			return {node_st:{...node_st}}
		})
	}

	render() {
		return this.generateTree(this.props.tree_data, 0);
	}
    
}

export default class DataTree extends React.Component {
   
	static defaultProps = {
		  value:{}
	};

	state={
		  open : false,
		  pos  : null,
		  pull_height : 300,
		  tree_data : this.props.tree_data
	};

	tagOpen=()=>{
		let {readOnly}=this.props;
		if (readOnly) return;
		const pos=Util.getPopPos(this.input_el, this.state.pull_width, this.state.pull_height);
		this.setState((prevState, props) =>({open: !prevState.open, pos}));
	};

  componentDidMount() {
      if ( typeof this.props.getData=='function' || this.props.dataUrl) this.load_tree_data();        
  }
    
  load_tree_data=async ()=>{
  	let {getData}=this.props;
  	let rc= await (typeof getData=='function'? getData : this.data_loader) ();
  	this.setState({tree_data:rc.data});
  }
    
  data_loader=()=>{
     	return net.get(`${this.props.dataUrl}`);
  }
    
  onSelect=(id, name)=>{
  	let {onChange}=this.props;
  	this.setState({open:false}, ()=>{
          onChange({id, name});
      })
  };
    
  setRef=(el)=> {
		this.input_el = el; 
		if (el) this.state.pull_width=this.props.width?this.props.width:el.offsetWidth
  }

	render() {
		let {value, style, className, ...others}=this.props;
		let {tree_data, open}=this.state;
		let cls=Util.classNames(css['data-tree'], className);

		if (typeof value==="string") value={id:value, name:value}

		return (
			<div className={cls} style={style}>
				<input
					className={inpcss.input}		
					ref={this.setRef}
					value={value.name}
					readOnly
					onClick={this.tagOpen}
				/>
				{ open &&
				<div
					style={{position:'fixed', top:0, bottom:0, left:0, right:0, zIndex:10}}
					onClick={this.tagOpen}
				/>
				}
				
				{ open &&
					<div className={modal.modal} style={{width : this.state.pull_width, height : this.state.pull_height, ...this.state.pos}}>
						<Select values={value} tree_data={tree_data} onSelect={this.onSelect} {...others} />
					</div>
				}
			</div>
		)
	}
}
