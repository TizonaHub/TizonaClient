
import SvgComponent from "./svgComponent";
import backIcon from "@assets/icons/angle-left-solid.svg"
import crossIcon from "@assets/icons/crossIcon.svg"
import { useContext } from "react";
import { LangContext } from "../js/contexts";
export default function GoBackButton({ onClick, icon, content, color, styles }) {
    const lang=useContext(LangContext)
    !color ? color = document.documentElement.style.getPropertyValue('--mainColor') : null
    let src = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill={color} d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>
    let text = lang.misc[0]
    const icons = {
        back: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" >
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>,
        cross: <img src={crossIcon} alt="" className="crossIcon" />
    }
    if (icon) src = icons[icon]
    if (content) text = content
    return <button className="goBackButton" onClick={onClick} type="button" style={styles}>
        {src}
        <span>{text}</span>
    </button>
}