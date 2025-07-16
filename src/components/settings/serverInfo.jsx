import { useState, useEffect, useContext } from "react"
import packageJson from '../../../package.json'
import StorageChart from "../home/storageChart"
import iconsLicenses from "@assets/icons/LICENSE.txt"
import { LangContext } from "../../js/contexts"
import { prepareFetch } from "../../js/functions"
import licenses from "../../thirdPartyLicenses.json"
import GoBackButton from "../goBackButton"
export default function ServerInfo({ settingsContentRef }) {
    let [storageCharts, setStorageCharts] = useState(null)
    const [versions, setVersions] = useState([null, null])
    const [showLicenses, setShowLicenses] = useState(false)
    const [licenseData, setLicenseData] = useState(false)
    const [showIconsLicenses, setShowIconsLicenses] = useState(false)
    let lang = useContext(LangContext)
    useEffect(() => {
        if (showLicenses) return
        getInfo()
        fetch(prepareFetch('/api/system/charts')).then(async (response) => {
            if (response.ok) {
                let json = await response.json()
                setStorageCharts(json)
            }
        })
    }, [showLicenses])
    if (showIconsLicenses) return <IconsLicenses />
    if (licenseData) return <div className="depDetailsContainer"><LicenseDetailsComponent /></div>
    if (showLicenses) return (<div>
        <GoBackButton icon={'cross'} content={lang.misc[1]} onClick={() => { setShowLicenses(false) }} />
        <div className="licenses">
            <button className="licenseComponent iconsButton" onClick={() => { setShowIconsLicenses(true) }}>
                <span style={{ fontSize: '20px' }}>FONT & ICONS</span>
            </button>
            {licenses.map((elem, index) => {
                return <LicensesComponent key={index} elem={elem} />
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
    async function getInfo() {
        const serverjson = await fetch(prepareFetch('/api/system/info')).then(async (response) => {
            if (response.ok) return await response.json()

        })
        const json = { clientInfo: { version: packageJson.version }, serverInfo: serverjson }
        setVersions([json.clientInfo.version, json.serverInfo.version])
    }
    function LicensesComponent({ elem }) {
        return <button className="licenseComponent" onClick={() => {
            setLicenseData({
                title: elem.dependency, license: elem.license,
                repo: elem.repository, content: elem.licenseContent,
                publisher: elem.publisher, url: elem.url
            })
        }}>
            <span>{elem.dependency}</span>
            <span>{elem.license}</span>
        </button>
    }
    function LicenseDetailsComponent() {
        const split = licenseData.content.split('\n')
        settingsContentRef.current.scrollTop = 0
        return (<>
            <GoBackButton content={lang.misc[1]} onClick={() => { setLicenseData(null) }} />
            <h2 className="title">Title: {licenseData.title}</h2>
            <h3 className="author">Publisher: {licenseData.publisher}</h3>
            <h3 className="license">License: {licenseData.license}</h3>
            <h3 className="license">URL: {licenseData.url && licenseData.url!='None' ? <a href={licenseData.url} target="_blank" rel="noopener noreferrer">{licenseData.url}</a> : 'Not found'}</h3>
            <h3>**No changes were made.**</h3>
            <h3 className="repository">Repository: <a href={licenseData.repo} target="_blank" rel="noopener noreferrer">{licenseData.repo}</a></h3>

            <div>{split.map((elem, i) => {
                return <p key={i}>{elem}</p>
            })}</div>

        </>)
    }
    function IconsLicenses() {
        const [text, setText] = useState('')
        useEffect(() => {
            fetch(iconsLicenses) // Usa la URL obtenida para hacer un fetch
                .then((response) => response.text())
                .then((text) => setText(text))
                .catch((error) => console.error("Error loading the file:", error));
        }, []);
        return <div>
            <GoBackButton onClick={() => { setShowIconsLicenses(false) }} styles={{ marginBottom: '25px' }} />
            {
                printText()
            }
        </div>
        function printText() {
            const split = text.split(/\r?\n/)
            return split.map((elem, index) => {
                return <p key={index}>{elem}</p>
            })
        }
    }
}