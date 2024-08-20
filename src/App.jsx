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
import {load_spirit_js, download} from "./load_spirit.js";

const steps= [{seltp:_("选择标签")}, {loaddata:_("录入数据")}, {doprint:_("执行打印")}, {finish:_("完成")}];

export default class App extends React.Component {

	state ={
		step:"seltp", 
		tpdata : {},
		data:[],
		columns:[],
		print_opts:{type:'WIN'}
	}
	
	componentDidMount=async ()=>{
    	await load_spirit_js(0);
		this.forceUpdate()
    }

	setStep=(step)=>{
		this.setState({step});
	}

	onSetData=(data)=>{
		this.setState({data})
	}
	
	onSetSql=(sql, data)=>{
		this.setState({sql, data})
	}

	onChangeTp=(tpdata)=>{
		let data=[]
		for(let i=0; i<10; i++) data.push({});
		this.setState({tpdata, data});
	}
	
	onChangePrintOpts=(print_opts)=>{
		this.setState({print_opts})
	}
		
	render() {
		const {tpdata, step, data, sql, print_opts}=this.state;
		return (
			<Router>
				<div className="App-header">
					<span className="App-Logo">
						<a href="/" target="_main">
							<img src={spirit_power} alt="logo" />
						</a>
					</span>
					<div className="App-Title">{_("标签打印")}</div>
				</div>
				<Page>
					<Stepper steps={steps} current={step}  width="80%"/>
					
					<div style={{height:50}} />
					{!window.SPIRIT &&
            		    <div className="spirit-download">
    	                SpiritWeb打印插件尚未安装! <a href="/download/spirit-web-setup.exe">立刻安装</a> <a href="/doc/install.md">查看说明</a>
	                    </div>}
					
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
							sql={sql}
							setStep={this.setStep} 
							onDataChange={this.onSetData}
							onSetSql={this.onSetSql}
						/>}/>
					<Route path="/print-tools/doprint" render={props =><DoPrint {...props} 
							setStep={this.setStep} 
							tpdata={tpdata}
							data={data}
							sql={sql}
							print_opts={print_opts}
							onChangePrintOpts={this.onChangePrintOpts}
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

