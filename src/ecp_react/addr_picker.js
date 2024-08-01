import React from 'react';
import W from './divwin';
import Toolbar from './toolbar';
import Button from './button';
import InputBtn from './input_btn';
import BaiduMap from './baidu_map';

class Map extends React.Component {
	
	constructor(props) {
		super(props);
		this.state={address:props.address};
	}
	
	sumbit=(e)=>{
		if(!this.state.address.address){
			alert('请输入详细地址!!!');
			return;
		}
		this.props.onChoose(this.state.address);
	}

	changeKey=(val)=>{
		this.map.search(val);
	}
	
	onSelect=(address)=>{
		this.setState({address});
	}
	
	onRef=(map)=>{
		this.map=map;
	}
	
	onAddrChange=(e)=>{
		let {address}=this.state;
		address.address=e.target.value;
		this.setState({address});
	}

	render() {
		let {address} = this.state;
		return (
			<>
				<Toolbar style={{backgroundColor:'#ddd'}}>
					<InputBtn icon='search' placeholder='输入客户地址搜索' onClick={this.changeKey} />
					<input value={address.address} onChange={this.onAddrChange} style={{width:400}}/>
					<Toolbar.Ext>
					<Button type='important' onClick={this.sumbit}>确定</Button>
				</Toolbar.Ext>
				</Toolbar>
				<BaiduMap ref={this.onRef} address={address} height={480} onSelect={this.onSelect} />
			</>
		)
	}
}

/**
 * @param {addr,province,city,lat,lng} props 
 */
export default function(props) {
	var location  = {};
	let addrlabel = '';
	let {className, value, onChange, format, ...others}=props;
	
	format = format || 'ADDR_POINT';
	switch(format) {
		case 'ADDR_LABEL':
			location.address=value;
			addrlabel=value;
			break;
		case 'ADDR_POINT': 
			try {
				location=JSON.parse(value);
				addrlabel=location.address;
			}catch(e){
				location.address=value;
				addrlabel=value;
			}
			break;
	}
	
	let form;		
	let onChoose=(address)=>{
		form.close();
		if (onChange) {
			switch(format) {
				case 'ADDR_LABEL':
					onChange(address.address);
					break;
				case 'ADDR_POINT':
					onChange(JSON.stringify(address));
					break;
			}
		}	
	}
	
	const pickAddr=(props)=>{
		form=W.show(
			<W.Dialog title='选择地址' width={800} height={550}>
				<Map address={location} format={format} onChoose={onChoose} />
			</W.Dialog>
		)
	}
	
	return (
		<div className={className} >
			<input readOnly value={addrlabel} onClick={pickAddr} />
		</div>
	);
}
