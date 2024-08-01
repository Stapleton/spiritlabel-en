import React from 'react';
import {loadjs} from './util';

var BMap;

class BaiduMap extends React.Component {
	map = null;
	localSearch=null;
	marker = null;
	gc = null;
	
	constructor(props) {
		super(props);
		this.state={address:props.address};
	}

	componentDidMount() {
		window._map_init=()=>{
			this.initMap();
		}
		loadjs('http://api.map.baidu.com/api?v=2.0&ak=oScUES65uEq0Au6qImYRF9EH&callback=_map_init');
	}
	
	search=(addr)=>{
		this.localSearch.search(addr);
	}
			
 	addMarker=(point)=>{
 		let self = this;
		try {
			this.setLocation(point);
			if(this.marker==null){
			 	this.marker = new BMap.Marker(point);
			 	this.map.addOverlay(this.marker);
				this.marker.enableDragging();    
				let self = this;   
				this.marker.addEventListener("dragend",  function(e) {self.setLocation(e.point)});
				console.log('--------------');
			}else{
				this.marker.setPosition(point);
			}
			return;
		}catch (e) {
		}
	}

	setLocation=(e)=>{
		let {onSelect}=this.props;
		let address = {};
		let self = this;
		this.gc.getLocation(e, function(rs){
			if (!rs) return;
			address.address = rs.address;
			address.province = rs.addressComponents.province;
			address.city = rs.addressComponents.city;
			address.lat =rs.point.lat;
			address.lng =rs.point.lng;
			if (onSelect) onSelect(address);
		});
	}

	addLocation=(e)=>{
		//if (this.marker!=null) this.map.removeOverlay(this.marker);
		this.addMarker(e.point);
	}
	
	initMap=()=>{
		let {address, format}=this.props; 
		BMap=window.BMap
		this.map = new BMap.Map(this.mapdiv);    // 创建Map实例
		
		// 添加地图类型控件
		this.map.addControl(new BMap.MapTypeControl({ mapTypes:[ window.BMAP_NORMAL_MAP, window.BMAP_HYBRID_MAP ]}));	  
	        
		this.map.setCurrentCity(this.state.address.city); // 设置地图显示的城市 此项是必须设置的
		this.map.enableScrollWheelZoom(true); 
		
		this.gc= new BMap.Geocoder()
		this.localSearch = new BMap.LocalSearch(this.map, {
			renderOptions:{map:this.map}
		});
				
		if (address.lng) {
			this.addMarker({lng:address.lng, lat:address.lat});
			this.map.centerAndZoom(new BMap.Point(address.lng, address.lat), 16);
		}else{
			this.localSearch.search(address.address);
			this.map.centerAndZoom(new BMap.Point(104.07 , 30.67), 12);  // 初始化地图,设置中心点坐标和地图级别
		}
		
		this.map.addEventListener("click", this.addLocation);
	}

	render() {
		let height=this.props.height || 550;
		return (
			<div ref={e=>this.mapdiv=e}  style={{width:'100%', height, overflow:'auto'}}/>
		);
	}
}

export default BaiduMap;
