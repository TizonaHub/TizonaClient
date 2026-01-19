/* eslint-disable react/prop-types */
import { useContext } from "react"
import { LangContext } from "../js/contexts"
import { prepareFetch } from "../js/functions"
import { AppContext } from "../js/contexts"
function AsideButton({ data, currentTabProps, index, plugin = false }) {
    let lang = useContext(LangContext)
    const appContext = useContext(AppContext)

    if (!plugin) return (
        <>
            <button className={currentTabProps.currentTab == index && !appContext.frame
                ? 'selectedFile' : ''} onClick={handleClick}>
                <img src={data.icon} alt="" draggable='false' />
                <span>{lang.tabs[index]}</span>
            </button>
        </>)
    else {
        return (
            <>
                <button className={currentTabProps.currentTab == index && appContext.frame
                    ? 'selectedFile' : ''}
                    onClick={() => {
                        currentTabProps.setCurrentTab(index)
                        const devMode=data.devMode
                        const devUrl=data.devUrl
                        const frontEnd=data.frontEnd
                        let frame=devUrl && devMode ? devUrl : frontEnd

                        appContext.setFrame(prepareFetch(frame))

                    }}>
                    <img src={prepareFetch(data.icon)} alt="" draggable='false' />
                    <span>{data.name}</span>
                </button>
            </>)
    }
    function handleClick() {
        appContext.setFrame(null)
        currentTabProps.setCurrentTab(index)
    }
}
export default AsideButton