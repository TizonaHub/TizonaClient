import { useState, useContext } from "react";
import { AppContext } from "../../js/contexts";
import { prepareFetch } from "../../js/functions";
import infoIcon from "@src/assets/icons/infoWhite.svg"
import trashIcon from "@src/assets/icons/trashIconRed.svg"
import GoBackButton from "../goBackButton";
export default function Plugins() {
    const [showDetails, setShowDetails] = useState(false)
    const appContextData = useContext(AppContext)
    return (
        <div className="plugins">
            {!showDetails ?
                Object.values(appContextData.plugins).map((plugin, index) => {
                    console.log('plugin: ', plugin);
                    return (
                        <div className="plugin" key={plugin.name + index}>
                            <div className="info">
                                <img src={prepareFetch(plugin.icon)} alt="" />
                                <span>{plugin.name}</span>
                            </div>
                            <div className="actions">
                                <button>
                                    <img src={infoIcon} alt="" onClick={() => { setShowDetails(plugin) }} />
                                </button>
                                <button>
                                    <img src={trashIcon} alt="" />
                                </button>
                            </div>
                        </div>
                    )

                })
                :
                <>
                <GoBackButton onClick={()=>{setShowDetails(false)}}/>
                    <div className="top">
                        <img src={prepareFetch(showDetails.icon)} alt="" />
                        <div className="data">
                            <h2>{showDetails.name} - {showDetails.publisher}</h2>
                            <span>Version: {showDetails.version}</span>
                            <div className="links">
                                <a target="_blank" href={showDetails.repository}></a>
                                <a target="_blank" href={showDetails.url}></a>
                            </div>
                        </div>
                    </div>
                    <p className="description">{showDetails.description}</p>
                </>
            }
        </div>
    )

}