import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Util from './util';

class OrgTree extends React.Component {

	static defaultProps = {
		rootname : '组织机构', /*根节点名称*/
		orgid    : '1' ,    /*根机构id*/
		showOrg  : true,
		showWG	 : false,
		showTeam : true,
		showPerson: true,
		showRole : false,
	}
  
	static propTypes = {
		rootname : PropTypes.string.isRequired,
		orgid    : PropTypes.string.isRequired,
		showOrg  : PropTypes.bool,
		showWG	 : PropTypes.bool,
		showTeam : PropTypes.bool,
		showPerson: PropTypes.bool,
		showRole : PropTypes.bool,
	}

	constructor(props) {
		super(props);
		
		this.state={
			rootname : this.props.rootname, /*根节点名称*/
			orgid    : this.props.orgid,    /*根机构id*/
			showOrg  : this.props.showOrg?'Y':'N',
			showWG	 : this.props.showGroup?'Y':'N',
			showTeam : this.props.showTeam?'Y':'N',
			showPerson : this.props.showPerson?'Y':'N',
			showRole : this.props.showRole?'Y':'N',
		}
		
		this.state.orgname=this.props.orgname?this.props.orgname:(this.state.orgid==1)?'全体部门':this.state.rootname;
	}

	showTree=()=>{
	
		if (!window.GAF.ui.aTree) {
			/* 如果GAF.ui.aTree尚未加载，等待10ms */
			setTimeout(this.showTree, 10);
			return;
		}
	
		let treeid='tr'+Math.floor((1 + Math.random()) * 0x10000);
		let tree= new window.GAF.ui.aTree(treeid,{
			skin:'default'
		});
	
		tree.config.level=1;
		tree.config.folderLinks=true;
		tree.config.useLine=false;
		tree.icon.root='/img/org/toporg.gif';
		tree.icon.orgroot='/img/org/orgroot.gif';
		tree.icon.folder='/img/org/org.gif';
		tree.icon.folderOpen='/img/org/org.gif';
		tree.icon.term='/img/org/team.gif';
		tree.icon.grouproot='/img/org/grouproot.gif';
		tree.icon.group='/img/org/group.gif';
		//yqj add
		tree.icon.mycreate='/img/org/mycreate.gif';
		tree.icon.myshare='/img/org/myshare.gif';
		tree.icon.myjoin='/img/org/myjoin.gif';
	
		tree.icon.person='/img/org/person.gif';
		tree.icon.role='/img/org/role.gif';
		tree.config.getSelection=true;
		
		tree.root = new Node("-", this.state.rootname,true);
	
		if (this.state.showOrg=='Y') tree.root.addChild(new Node("O:"+this.state.orgid, this.state.orgname,true));
		if (this.state.showWG=='Y') tree.root.addChild(new Node("G:0",'工作组列表',true, '','','','/img/org/grouproot.gif','/img/org/grouproot.gif'));
		
		this.el.innerHTML=tree.toString();
		
		tree.loadroot('/org/org/getorgchild/Workgroup/'+this.state.showWG+'/Bgroup/'+this.state.showTeam+'/Role/'+this.state.showRole+'/right/N/Person/'+this.state.showPerson+'/Root/'+this.state.orgid+'?');
	
		tree.onSelect = (n)=>{
			if (this.props.showPerson && n.NID.substr(0,1)=='P' || !this.props.showPerson)
				this.props.onSelect(n.NID, n.name);
		}
		this.tree=tree;
	}

	componentDidMount = () => {
		let old_find=Array.prototype.find;
		Util.loadjs('/gaf/js/gaf.js')
			.then(Util.loadjs('/gaf/js/ui/atree.js'))
			.then(()=>{Array.prototype.find=old_find; this.showTree()});
	}

	componentWillUnmount() {
    
	}

	render() {
		const {className, style}=this.props;
		return  <div ref={(el)=>{this.el = el}} className={className} style={style} />;
	}	
}

export default OrgTree;

