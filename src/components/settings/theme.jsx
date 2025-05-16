/* eslint-disable react/prop-types */
import { useState } from "react";
import Switch from "react-switch";
import { LangContext } from "../../js/contexts"
import { useContext } from "react";
import trashIcon from "@src/assets/icons/trashIconRed.svg"
function ThemeSettings({ setTheme, setClientConfig, clientConfig,frProps,setWallpaperAsset }) {
    let lang = useContext(LangContext)
    let switchesJson = {
        reduceOpacity: false
    }
    let [switchesStates, setSwitchesStates] = useState(clientConfig ? clientConfig : switchesJson)

    return (
        <>
            <div className="themeContainer">
                <h3>{lang.settings.theme[0]}</h3>
                <div className="themeSelector">
                    <button className='red' value='red' onClick={setTheme} />
                    <button className='gold' value='gold' onClick={setTheme} />
                    <button className='blue' value='blue' onClick={setTheme} />
                </div>
            </div>
            <div className="themeContainer">
                <h3>{lang.settings.theme[1]}</h3>
                <div>
                    <span>{lang.settings.theme[2]}</span>
                    <Switch onChange={handleChange} checkedIcon={false} uncheckedIcon={false} checked={switchesStates.reduceOpacity} id='reduceOpacity' />
                </div>
                <div>
                    <span>{lang.settings.theme[3]}</span>
                    <button onClick={()=>{
                        localStorage.removeItem('wallpaper')
                        setWallpaperAsset('')
                        frProps.setFRApp(frProps.FRApp+1)
                    }}><img src={trashIcon} alt="" /></button></div>
            </div>
        </>
    )
    function handleChange(nextChecked, e, id) {
        let switches = { ...switchesStates }
        switches[id] = nextChecked
        setSwitchesStates(switches)
        localStorage.setItem('config', JSON.stringify(switches))
        setTimeout(() => { setClientConfig(switches) }, 200); //allows switch animation
    }
}
export default ThemeSettings
