import React from 'react';
import Table from 'ecp/table';
import {Page, H1, H2, H3} from 'ecp/page';
import Button from 'ecp/button'
import ConfirmButton from 'ecp/confirm_button'
import W from 'ecp/divwin';


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
    	   <div class="upload-area">
	      	<H1>打印结束</H1>
	      	<br/>
	      	<Button type="green" onClick={this.printAnother}>继续打印</Button>
    	   </div>
    	);
    }
    
}

export default Finish
