import React from 'react';
import {BrowserRouter as Router, Route  } from 'react-router-dom'; 
import {Page} from 'ecp/page';
import Stepper from 'ecp/stepper'
import 'ecp/gaf/comm.scss'
import './App.css'
import DataInput from './DataInput.js'
import Seltp from './Seltp.js'
import DoPrint from './DoPrint.js'
import Finish from './Finish.js'

const steps= [{seltp:"选择模版"}, {loaddata:"录入数据"}, {doprint:"执行打印"}, {finish:"完成"}];

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
				<div class="App-header">
					批量打印小工具
				</div>
				<Page>
					
					<Stepper steps={steps} current={step}  width="80%"/>
					
					<div style={{height:50}} />
					
					<Route path="/print-tools" exact  render={props =><Seltp {...props} 
							setStep={this.setStep} 
							onChangeTp={this.onChangeTp}
							tpdata={tpdata}
						/>}  />
					<Route path="/print-tools/seltp"  render={props =><Seltp {...props} 
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

