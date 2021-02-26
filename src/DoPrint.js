import React from 'react';
import Table from 'ecp/table';
import {Page, H1, H2, H3} from 'ecp/page';
import Button from 'ecp/button'
import ConfirmButton from 'ecp/confirm_button'
import W from 'ecp/divwin';

class DoPrint extends React.Component {

    /* 状态 */
    state={
    }
    
    componentDidMount=()=>{
    	this.props.setStep("doprint")
    }
    
    nextStep=()=>{
    	this.props.history.push("/print-tools/finish");
    }
    
    render() { 
    	return (
    	   <>
    	   	<div class="upload-area">
	      		<Button type="green" onClick={this.print}>打印</Button>
	    	</div>
	   </>
    	);
    }
    
}

export default DoPrint
