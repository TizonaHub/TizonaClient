/* eslint-disable react/prop-types */
import { useContext } from "react"
import { LangContext } from "../js/contexts"
function AsideButton({ data,currentTabProps,index }) {
    let lang=useContext(LangContext)
    return (
        <>
            <button className={currentTabProps.currentTab==index?'selectedFile':''} onClick={handleClick}>
                <img src={data.icon} alt="" draggable='false'/>
                <span>{lang.tabs[index]}</span>
            </button>
        </>
    )
    function handleClick(){
        currentTabProps.setCurrentTab(index)
    }
}
export default AsideButton