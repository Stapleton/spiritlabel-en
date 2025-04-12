import React, { Component } from 'react';
import {_} from "./locale.js";

const pageSize=50;

class ImageGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total : 0,
      labels: [],
      page: 0,
      loading: false,
      allLoaded: false,
    };
    this.galleryRef = React.createRef();
  }

  componentDidMount() {
    this.loadImages();
    this.galleryRef.current.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.lazyLoadImages);
  }

  componentWillUnmount() {
    this.galleryRef.current.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.lazyLoadImages);
  }
  
  componentDidUpdate=async (prevProps)=> {
    if (prevProps.type !== this.props.type || prevProps.search !== this.props.search) {
        this.setState({
            labels:[], 
            page:0, 
            loading:false, 
            allLoaded:false
          }, 
          ()=>this.loadImages()
        )
    }
  }

  fetchImages = async (pageNum) => {
    const {type, search}=this.props;
    const dataUrl=`/api/get-tp-list?${type==="shares"?"all=1":""}&key=${search}`
    const response = await fetch(`${dataUrl}&_start=${pageSize*pageNum}&_count=${pageSize}`);
    return response.json();
  };

  loadImages = async () => {
    if (this.state.loading || this.state.allLoaded) return;
    this.setState({ loading: true });
    const data = await this.fetchImages(this.state.page);
    if (data.rc==="NOLOGIN") {
        this.props.login(this.loadImages)
        this.setState({ loading: false});
        return;
    }
    if (!data.data || data.data.length === 0) {
      this.setState({ allLoaded: true, loading:false });
    } else {
      this.setState(prevState => ({
        total: data.cn,
        labels: [...prevState.labels, ...data.data],
        page: prevState.page + 1,
        loading: false,
      }), () => {
        this.lazyLoadImages();  // Ensure lazy loading after new images are added
      });
    }
  };

  handleScroll = () => {
    const gallery = this.galleryRef.current;
    const { scrollTop, clientHeight, scrollHeight } = gallery;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      this.loadImages();
    }
    this.lazyLoadImages();
  };

  lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  };

  render() {
    const {labels}=this.state;
    return (
      <div
        ref={this.galleryRef}
        style={{
          width: '100%',
          height: 'calc(100vh - 300px)',
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          justifyContent: 'center',
          gap: '3px',
          background: '#fff',
          //padding:5, 
          //border:"1px solid #dadada"
        }}
      >
        {labels.length>0? 
           this.state.labels.map((label, index) => (
                 <div
                    key={index}
                    style={{
                      width: '150px',
                      height: '150px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f0f0f0',
                      borderRadius: '3px',
                      padding: 4,
                    }}
                    onClick={e=>this.props.onSelTp(label.id)}
                  >
                    <img
                      data-src={`/utils/thumb?id=${label.id}`}
                      alt=""
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border:"1px solid #888", background: '#fff', }}
                    />
                  </div>
           ))
           : <div 
                style={{
                    fontSize: '40px',
                    color: '#ccc',
                    margin: '0 auto',
                    lineHeight: '100px'}}>
                    {_("无标签")}
             </div>
       }
       </div>
    );
  }
}

export default ImageGallery;
