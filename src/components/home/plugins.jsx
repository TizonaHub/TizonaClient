import { useState, useContext, useRef } from "react";
import { PluginsContext } from "../../js/contexts";
import { deletePlugin, prepareFetch, showToast } from "../../js/functions";
import infoIcon from "@src/assets/icons/infoWhite.svg"
import trashIcon from "@src/assets/icons/trashIconRed.svg"
import GoBackButton from "../goBackButton";
import WarningIcon from "@src/assets/icons/warning.svg"
import ReloadIcon from "@src/assets/icons/reload.svg"
import toast from "react-hot-toast"

export default function Plugins() {
    const [showDetails, setShowDetails] = useState(false)
    const pluginContextData = useContext(PluginsContext)
    const inputRef = useRef(false)

    return (
        <div className="plugins">
            <div className="pluginActions">
                <button onClick={() => {
                    inputRef.current.click()
                }}>
                    <input type="file" style={{ display: 'none' }} ref={inputRef} onChange={(e) => {
                        const file = e.currentTarget.files[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('plugin', file)
                        fetch(prepareFetch('/api/system/plugins'), {
                            method: 'POST',
                            credentials: 'include',
                            body: formData
                        }).then((res) => {
                            if (res.ok) pluginContextData.getPlugins()

                        })
                        e.currentTarget.value = ''
                    }} />
                    <span className="image" />
                    <span>Install</span>
                </button>
                <button onClick={() => { updatePlugin() }}>
                    <img src={ReloadIcon} alt="" />
                    <span>Update Everything</span>
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
                                <button onClick={() => { updatePlugin(plugin) }}>
                                    <img src={ReloadIcon} alt="" />
                                </button>
                                <button onClick={async () => {
                                    if (!plugin.id) return
                                    await deletePlugin(plugin.id)
                                    pluginContextData.getPlugins()
                                }
                                }
                                >
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
    function updatePlugin(pluginParam = undefined) {

        const updateToast = showToast('Updating plugins...', 'loading')
        const missingScripts = []
        if (!pluginParam) {
            Object.values(pluginContextData.plugins).map((plugin) => {
                fetchUpdate(plugin)
            })
        }
        else fetchUpdate(pluginParam)

        setTimeout(() => {
            toast.dismiss(updateToast)
            if (missingScripts.length > 0) {
                let list = missingScripts.join('\n')
                showToast('Missing update script for:\n' + list, 'error',
                    {
                        backgroundColor: 'black', color: 'white', fontSize: '20px',
                        borderRadius: '5px', gap: '10px'
                    }
                )
            }
            else showToast('Plugin updated', 'success')
        }, 500);
        return
        function fetchUpdate(plugin) {
            const id = plugin.id
            fetch(prepareFetch('/api/system/plugins?pluginID=' + id), {
                method: 'PATCH',
                credentials: 'include'
            }).then((res) => {
                if (res.status == 404) missingScripts.push(plugin.name)
                if (!res.ok) ''
            })
        }
    }

}