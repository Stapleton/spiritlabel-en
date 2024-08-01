import React from 'react';
import PropTypes from 'prop-types';

class Uploader extends React.Component {
	
	static propTypes = {
		onSelect   : PropTypes.func,   /* 选择到后文件回调, 如果有此，url无效 */
		url        : PropTypes.string, /* 上传地址 */
		onComplete : PropTypes.func,   /* 上传完成后回调, 回调参数为服务器返回数据*/ 
		filename   : PropTypes.string, /* 上传到服务器的名称 */
		multiple   : PropTypes.bool,   /* 容许多选 */
  }
	
	static defaultProps = {
		filename  : 'Filedata',
		multiple  : false,
  }
		
	state={
		inDrag:false,
	}
	
	onClick=(e)=>{
		this.fileSelector.click();
	}
	
	onDrop=(e)=>{
		e.preventDefault();
		e.stopPropagation();
		this.doUpload(e.dataTransfer.files);
	}
	
	uploadComplete=(evt)=>{
		try {
			var rc = JSON.parse(evt.target.responseText);
			this.props.onComplete && this.props.onComplete(rc);
		}catch(e){
			console.log(e);
		}
	}
	
	doUpload=(files)=>{
		if (this.props.onSelect) {
			this.props.onSelect(files);
			return;
		}
		
		var fd=new FormData();
		fd.append(this.props.filename, files[0]);
		var xhr=new XMLHttpRequest();
		/*xhr.upload.addEventListener("progress", this.uploadProgress.bind(this), false);
		xhr.addEventListener("loadstart", this.uploadStart.bind(this), false);
		xhr.addEventListener("load",      this.uploadComplete.bind(this), false);
		xhr.addEventListener("error",     this.uploadFailed.bind(this),  false);
		xhr.addEventListener("abort",     this.uploadCanceled.bind(this), false);
		xhr.addEventListener("loadend",   this.uploadEnd.bind(this), false);*/
		xhr.addEventListener("load",      this.uploadComplete);
		xhr.open("POST", this.props.url);
		xhr.send(fd);
	}
	
	componentDidMount() {
		this.fileSelector = document.createElement("input");
		this.fileSelector.type = "file";
		this.fileSelector.multiple = this.props.multiple;
		this.fileSelector.style.display="none";
		document.body.appendChild(this.fileSelector);
		this.fileSelector.onchange =()=>{this.doUpload(this.fileSelector.files)};
	}
	
	componentWillUnmount() {
		document.body.removeChild(this.fileSelector);
  }
	
	render() {
		const {children}=this.props;
		return  (
			<div 
				className={this.state.inDrag?'dragover':''}
				onClick={this.onClick} 
				onDragOver={(e)=>this.setState({inDrag:true})} 
				onDragEnd={(e)=>this.setState({inDrag:false})} 
				onDrop={this.onDrop}
				>
				{children}
			</div>
		);
	}
}

export default Uploader
