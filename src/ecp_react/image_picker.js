import React from 'react';
import Button from './button.js';
import W from './divwin.js';
import Uploader from './uploader.js';
import net from './net.js';

const ImagePicker=(props)=>{
    const fileselect=(files)=>{
        let imageReader = new FileReader();
        imageReader.onload = (e) => {
            var pattern = /^(data:\s*image\/(\w+);base64,)/;
            if(pattern.test(e.target.result)){
                var str = e.target.result.replace(pattern,"");
                net.post(props.saveUrl, str).then(rc=>{
                    props.onChange(rc.data);
                }).catch(msg=>{
                    W.alert(msg);
                });
            }else{
                W.alert("请选择图片!");
                return false;
            }
        };
        imageReader.readAsDataURL(files[0]);
    }
    
    const showBigImg=(img)=>{
        W.show(
            <W.Dialog width={800} height={600} >
                <img src={props.pathUrl + props.value.url} />
            </W.Dialog>
        );
    }
    
    return <div className={props.className} style={{width:100}}>
				{ props.value &&
						<img src={props.pathUrl + props.value.url} style={props.style} onClick={e=>showBigImg(props.value)}/>
				}
					<Uploader onSelect={fileselect} >
					<Button>选择</Button>
					</Uploader>
			</div>
}

export default ImagePicker;
