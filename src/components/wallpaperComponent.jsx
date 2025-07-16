import React,{useState,useEffect} from 'react';
import { prepareFetch } from '../js/functions';
const WallpaperComponent = ({ wallpaperData }) => {
  const [asset,setAsset]=useState(null)
  useEffect(()=>{
    async function f(){
      setAsset(await setBackgroundAsset())
    }
    f()
  },[wallpaperData])
  return (
    <div className="backgroundDiv">
      {asset}
    </div>
  );


  function returnWallpaperSource(data) {
    let uri = prepareFetch(data.uri.split('\\'))
    if (data.mimeType.includes('video')) return (<video src={uri} muted loop onCanPlay={(e) => { e.currentTarget.play() }} />)
    else return (<img src={uri} />)
  }
  async function setBackgroundAsset() {
    if (localStorage.getItem('wallpaper')) {
      let data = JSON.parse(localStorage.getItem('wallpaper'))
      await fetch(prepareFetch(data.uri), { cache: 'no-store', credentials: 'include' })
        .then((res) => {
          if (!res.ok) data = null
        })
        .catch((error) => {
          console.error('Error at setBackgroundAsset:', error);
          data = null
        });
      if (!data) {
        localStorage.removeItem('wallpaper')
        return null
      }
      const source = returnWallpaperSource(data)
      return source
    }
  }
};

export default React.memo(WallpaperComponent);
