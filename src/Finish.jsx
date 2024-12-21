import React from 'react';
import {H1, Button} from 'ecp';

class Finish extends React.Component {

    /* 状态 */
    state={
    }
    
    componentDidMount=()=>{
    	this.props.setStep("finish")
    }
    
    printAnother=()=>{
    	this.props.onDataChange([],[]);
    	this.props.history.push("/print-tools");
    }
    
    render() { 
    	return (
    	   <div className="center">
	      	<H1>打印结束</H1>
	      	<br/>
	      	<Button type="green" onClick={this.printAnother}>继续打印</Button>
    	   </div>
    	);
    }
    
}

export default Finish
