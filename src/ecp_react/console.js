import React from 'react';
import Util from 'ecp/util';
import Toolbar from 'ecp/toolbar';
import Button from 'ecp/button';
import './console.css'

const BLOCK_CNT=10;
const BLOCK_SIZE=500;

class Console extends React.Component	{
	
	static defaultProps = {
		level  :   1,
		buffer :   2000
  }
	
	tmp_buffer = [];
	timer=null;
	
	state = {
		level: this.props.level,
		msgs: [this.tmp_buffer]
	} 
	
	attach=(con_id, level)=> {
		GA.Req('/ecp/console/attach?con_id='+con_id+'&con_key='+this.props.consoleKey+'&level='+level, this.props.onAttach);
	}
	
	onMessage=(evt)=>{ 
		var rc=JSON.parse(evt.data);
		if (rc.type=='CTRL') {
			this.setState({con_id:rc.con_id});
			this.attach(rc.con_id, this.state.level);
		} else {
			this.appendMsg(rc.data);
		}
	}
	
	
	onClose=(evt)=>{
		var d=parent.Main.getServerTime();
		//this.showMsg('#ERROR# '+d.format('yyyy-MM-dd hh:mm:ss')+ "调试控制台已经关闭");
	}
		
	connect=()=>{
		var wsUri = "ws://"+window.location.host+"/_console";
		var websocket;
		
		this.websocket = websocket = new WebSocket(wsUri); 
		websocket.onclose   = this.onClose; 
		websocket.onmessage = this.onMessage;
		websocket.onerror   = this.onError; 
	}
	
	disconnect=()=> {
		this.websocket.onclose=null;
		this.websocket.close();
	}
	
	changeLevel=(level)=>{
		this.attach(this.state.con_id, level);
		this.setState({level});
	}
	
	clear=()=>{
		this.tmp_buffer=[];
		this.setState({msgs:[this.tmp_buffer]});
	}	
	
	appendMsg=(msg)=>{
		this.tmp_buffer.push(msg);
		if (!this.timer) {
			this.timer=setTimeout(this.showMsg, 300);
		}
	}
	
	showMsg=()=>{
		this.timer=null;
		this.setState((preState)=>{
			const cnt=this.tmp_buffer.length;
			if ( cnt>BLOCK_SIZE) {
				this.tmp_buffer=[];
				preState.msgs.push(this.tmp_buffer);
				if (preState.msgs.length > BLOCK_CNT) preState.msgs.shift();
			}
			return preState;
		});
	}
	
	componentDidMount() {	
		this.connect();
	}
	
	componentDidUpdate() {
	  this.conref.scrollTop = this.conref.scrollHeight;
	}
		
  render() {
		
		const showMsg=(txt,line)=>{
			let type='INFO';
			try {
				var e=txt.match(/#(\w+)#/g)[0];
				type=e.substring(1, e.length-1);
			}catch(e){};
			
			return (
				<div key={line}>
					<pre className={Util.classNames(type, {'odd':(line%2)==0})}>{txt}</pre>
				</div> 
			);
		}
		
		const outmsg=[];
		let line=0;
		for(let i=0; i<this.state.msgs.length; i++) {
			const blk=this.state.msgs[i];
			for(let j=0; j<blk.length; j++) {
				outmsg.push(showMsg(blk[j], line++));
			}
		}
		
		const {con_id, msgs, level} = this.state;
  	return (
  		<div className='ecp_console'>
				<Toolbar>
					{ con_id && <span>控制台ID: {con_id}</span> }
					<Toolbar.Group>
						<span>调试级别:</span>
						<select className='console-level' value={level} onChange={this.changeLevel}>
							<option value={0}>调试</option>
							<option value={1}>信息</option>
							<option value={2}>警告</option>
							<option value={3}>错误</option>
							<option value={4}>严重错误</option>
						</select>
					</Toolbar.Group>
					<Toolbar.Ext>
						<Button onClick={this.clear}>清除</Button>
					</Toolbar.Ext>
				</Toolbar>
				
				<div className='ecp_console_msg' ref={ref=>this.conref=ref} >
					{outmsg}
				</div>
  		</div>
  	)
  }
}

export default Console;
