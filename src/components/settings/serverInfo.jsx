import { useState, useEffect, useContext } from "react"
import StorageChart from "../home/storageChart"
import iconsLicenses from "@assets/icons/LICENSE.txt"
import { LangContext } from "../../js/contexts"
import { prepareFetch } from "../../js/functions"
import licenses from "../../thirdPartyLicenses.json"
import GoBackButton from "../goBackButton"
import { IconsLicenses,LicenseDetailsComponent,LicensesComponent } from "../licenseComponents"
export default function ServerInfo({ settingsContentRef }) {
    let [storageCharts, setStorageCharts] = useState(null)
    const [versions, setVersions] = useState([null, null])
    const [showLicenses, setShowLicenses] = useState(false)
    const [licenseData, setLicenseData] = useState(false)
    const [showIconsLicenses, setShowIconsLicenses] = useState(false)
    let lang = useContext(LangContext)
    useEffect(() => {
        if (showLicenses) return
        fetch(prepareFetch('/api/system/charts')).then(async (response) => {
            if (response.ok) {
                let json = await response.json()
                const json2 = {
                    clientInfo: { version: json ? json['clientVersion'] : null },
                    serverInfo: { version: json ? json['serverVersion'] : null }
                }
                setStorageCharts(json)
                setVersions([json2.clientInfo.version, json2.serverInfo.version])
            }
        })
    }, [showLicenses])
    if (showIconsLicenses) return <IconsLicenses iconsLicenses={iconsLicenses}setShowIconsLicenses={setShowIconsLicenses}/>
    if (licenseData) return <div className="depDetailsContainer"><LicenseDetailsComponent 
    licenseData={licenseData}
    settingsContentRef={settingsContentRef}
    lang={lang}
    setLicenseData={setLicenseData}
    /></div>
    if (showLicenses) return (<div>
        <GoBackButton icon={'cross'} content={lang.misc[1]} onClick={() => { setShowLicenses(false) }} />
        <div className="licenses">
            <button className="licenseComponent iconsButton" onClick={() => { setShowIconsLicenses(true) }}>
                <span style={{ fontSize: '20px' }}>FONT & ICONS</span>
            </button>
            {licenses.map((elem, index) => {
                return <LicensesComponent key={index} elem={elem} setLicenseData={setLicenseData}/>
            })}
        </div>
    </div>)

    //MAIN COMPONENT
    return (
        <>
            <div className="infoContainer">
                <h3>{lang.settings.information[0]}</h3>
                <StorageChart storageCharts={storageCharts} />
                <h3>{lang.settings.information[4]}</h3>
                <p><span>{lang.settings.information[5]}</span> {versions[0]}</p>
                <p><span>{lang.settings.information[6]} </span>{versions[1]}</p>
                <button className="aboutButton" onClick={() => { setShowLicenses(true) }}>About</button>
            </div>
        </>)
}