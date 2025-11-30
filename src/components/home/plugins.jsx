import { useState, useContext, useRef } from "react";
import { AppContext, PluginsContext } from "../../js/contexts";
import { prepareFetch } from "../../js/functions";
import infoIcon from "@src/assets/icons/infoWhite.svg"
import trashIcon from "@src/assets/icons/trashIconRed.svg"
import GoBackButton from "../goBackButton";
import WarningIcon from "@src/assets/icons/warning.svg"

export default function Plugins() {
    const [showDetails, setShowDetails] = useState(false)
    const appContextData = useContext(AppContext)
    const pluginContextData=useContext(PluginsContext)
    console.log('appContextData: ', appContextData);
    const inputRef = useRef(false)

    return (
        <div className="plugins">
            <div className="pluginActions">
                <button onClick={() => {
                    inputRef.current.click()
                }}>
                    <input type="file" style={{ display: 'none' }} ref={inputRef} onChange={(e) => {
                        const file = e.currentTarget.files[0]
                        if(!file) return
                        const formData = new FormData()
                        formData.append('plugin',file)
                        fetch(prepareFetch('/api/system/plugins'),{
                            method:'POST',
                            credentials:'include',
                            body:formData
                        }).then((res)=>{
                            console.log('res: ', res.status);
                            if(res.ok)pluginContextData.getPlugins()

                        })
                       e.currentTarget.value=''
                    }} />
                    <span className="image" />
                    <span>Install</span>
                </button>
            </div>
            {!showDetails ?
                Object.values(pluginContextData.plugins).map((plugin, index) => {
                    const showWarning = plugin.missingDataFile || plugin.missingManifest
                    const pluginIcon = showWarning ? WarningIcon : prepareFetch(plugin.icon)
                    const pluginName = showWarning ? "Something's wrong" : plugin.name

                    return (
                        <div className="plugin" key={pluginName + index}>
                            <div className="info">
                                <img src={pluginIcon} alt="" />
                                <span>{pluginName}</span>
                            </div>
                            <div className="actions">
                                <button>
                                    <img src={infoIcon} alt="" onClick={() => {
                                        showWarning ? setShowDetails(plugin) :
                                            setShowDetails(plugin)
                                    }} />
                                </button>
                                <button>
                                    <img src={trashIcon} alt="" />
                                </button>
                            </div>
                        </div>
                    )

                })
                :
                <DetailsComponent />
            }
        </div>
    )

    function DetailsComponent() {
        const showWarning = showDetails.missingDataFile || showDetails.missingManifest
        const icon = showWarning ? WarningIcon : prepareFetch(showDetails.icon)
        const name = !showWarning ? showDetails.name : 'Unknown'
        const publisher = !showWarning ? showDetails.publisher : 'Unknown'
        const version = !showWarning ? showDetails.version : 'Unknown'
        const repository = !showWarning ? showDetails.name : null
        const url = !showWarning ? showDetails.url : null
        let description = !showWarning ? showDetails.description : ''
        if (showDetails.missingManifest) description = 'manifest.json missing. Try to recover it or reinstall the plugin.'
        if (showDetails.missingDataFile) description = '.data file is missing. Restart the server to fix it.'

        return <>
            <GoBackButton onClick={() => { setShowDetails(false) }} />
            <div className="top">
                <img src={icon} alt="" />
                <div className="data">
                    <h2>{name} - {publisher}</h2>
                    <span>Version: {version}</span>
                    <div className="links">
                        <a target="_blank" href={repository}></a>
                        <a target="_blank" href={url}></a>
                    </div>
                </div>
            </div>
            <p className="description">{description}</p>
        </>
    }

}