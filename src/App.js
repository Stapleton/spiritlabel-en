import React from 'react';
import {BrowserRouter as Router, Route  } from 'react-router-dom'; 
import {Page, Stepper} from 'ecp';
import './App.css'
import DataInput from './DataInput.jsx'
import Seltp from './Seltp.jsx'
import DoPrint from './DoPrint.jsx'
import Finish from './Finish.jsx'
import spirit_power from './spirit.svg';
import {setLanguage, _} from "./locale.js";

const steps= [{seltp:_("选择标签")}, {loaddata:_("录入数据")}, {doprint:_("执行打印")}, {finish:_("完成")}];

export default class App extends React.Component {

	state ={
		step:"seltp", 
		tpdata : {},
		data:[],
		columns:[]
	}

	setStep=(step)=>{
		this.setState({step});
	}

	onSetData=(data)=>{
		this.setState({data})
	}

	onChangeTp=(tpdata)=>{
		let data=[]
		for(let i=0; i<10; i++) data.push({});
		this.setState({tpdata, data});
	}
		
	render() {
		const {tpdata, step, data}=this.state;
		return (
			<Router>
				<div className="App-header">
					<span>
						<a href="/" target="_main">
							<img src={spirit_power} alt="logo" />
						</a>
					</span>
					<div className="App-Title">{_("批量打印小工具")}</div>
					
				</div>
				<Page>
					
					<Stepper steps={steps} current={step}  width="80%"/>
					
					<div style={{height:50}} />
					
					<Route path="/print-tools" exact  render={props =><Seltp {...props} 
							setStep={this.setStep} 
							onChangeTp={this.onChangeTp}
							tpdata={tpdata}
							
						/>}  />
						
					<Route path="/print-tools/seltp"  exact render={props =><Seltp {...props} 
							setStep={this.setStep} 
							onChangeTp={this.onChangeTp}
							tpdata={tpdata}
						/>} />	
						
					<Route path="/print-tools/seltp/:id"  render={props =><Seltp {...props} 
							setStep={this.setStep} 
							onChangeTp={this.onChangeTp}
							tpdata={tpdata}
						/>} />
					<Route path="/print-tools/loaddata" render={props =><DataInput {...props} 
							data={data} 
							tpdata={tpdata}
							setStep={this.setStep} 
							onDataChange={this.onSetData}
						/>}/>
					<Route path="/print-tools/doprint" render={props =><DoPrint {...props} 
							setStep={this.setStep} 
							tpdata={tpdata}
							data={data} 
						/>} />
					<Route path="/print-tools/finish"  render={props =><Finish {...props} 
							setStep={this.setStep} 
							onDataChange={this.onSetData}
						/>} />
				</Page>
			</Router>
	  )
	}	    
}

