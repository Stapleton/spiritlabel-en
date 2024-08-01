import React from 'react';
import {loadjs} from 'ecp/util'

class Qrcode extends React.Component {
    
    showQrcode=(url)=> {
        this.qrref.innerHTML="";
        new QRCode(this.qrref, {
            text: this.props.url,
            width: this.props.width || 150,
            height: this.props.height || 150,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
		});
	}
    
    componentDidMount=()=>{
 	    loadjs('/gaf/js/barcode/barcode.all.js')
		    .then(()=>{this.showQrcode(this.props.url)});
    }
    
    componentWillReceiveProps(nextProps){
		if (nextProps.url!=this.props.url) {
			this.showQrcode(nextProps.url);
		}
	}
    
    render() {
        const {className, style, url, width, height, ...other }=this.props;
        return (<div ref={e=>this.qrref=e} className={className} style={style} {...other}/>)
    }    
}

export default Qrcode;
