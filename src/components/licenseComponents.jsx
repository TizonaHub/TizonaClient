import { useEffect,useState } from "react"
import GoBackButton from "./goBackButton"

export function LicensesComponent({ elem,setLicenseData }) {
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
export function LicenseDetailsComponent({licenseData,settingsContentRef,lang,setLicenseData}) {
    const split = licenseData.content.split('\n')
    if(settingsContentRef) settingsContentRef.current.scrollTop = 0
    return (<>
        <GoBackButton content={lang.misc[1]} onClick={() => { setLicenseData(null) }} />
        <h2 className="title">Title: {licenseData.title}</h2>
        <h3 className="author">Publisher: {licenseData.publisher}</h3>
        <h3 className="license">License: {licenseData.license}</h3>
        <h3 className="license">URL: {licenseData.url && licenseData.url != 'None' ? <a href={licenseData.url} target="_blank" rel="noopener noreferrer">{licenseData.url}</a> : 'Not found'}</h3>
        <h3>**No changes were made.**</h3>
        <h3 className="repository">Repository: <a href={licenseData.repo} target="_blank" rel="noopener noreferrer">{licenseData.repo}</a></h3>

        <div>{split.map((elem, i) => {
            return <p key={i}>{elem}</p>
        })}</div>

    </>)
}
export function IconsLicenses({iconsLicenses,setShowIconsLicenses}) {
    const [text, setText] = useState('')
    useEffect(() => {
        fetch(iconsLicenses)
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