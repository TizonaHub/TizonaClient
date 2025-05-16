/* eslint-disable react/prop-types */
import { useContext } from "react"
import { LangContext } from "../../js/contexts"
export default function StorageChart({ storageCharts }) {
    let lang = useContext(LangContext)
    let json = storageCharts ? {
        total: formatNumber(storageCharts.total),
        free: formatNumber(storageCharts.free),
        used: formatNumber(storageCharts.used),
        serverSize: formatNumber(storageCharts.serverSize)
    } : { total: null, free: null, used: null }
    storageCharts && setPercentages()
    return (
        <div className="storageChartWrapper">
            <div className="storageChartContainer">
                <span>{json.used} / {json.total}</span>
                <div className="storageChart" />
            </div>
            <div className="info">
                <div /><span>{lang.settings.information[1]}: {json.free}</span>
                <div /><span>{lang.settings.information[2]}: {json.used}</span>
                <div /><span>{lang.settings.information[3]}: {json.serverSize}</span>
            </div>
        </div>
    )
    function formatNumber(num) {
        let calc = Math.floor(num / (1024 ** 3))
        let formattedNumber = null
        if (calc > 0) formattedNumber = calc.toLocaleString() + ' GiB'
        else {
            calc = Math.floor(num / (1024 ** 2))
            formattedNumber = calc.toLocaleString() + ' MiB'
        }
        return formattedNumber
    }
    function setPercentages() {
        let used = storageCharts.used * 100 / storageCharts.total
        let serverSize = storageCharts.serverSize * 100 / storageCharts.total

        used = used > 1 ? Math.round(used) : 1
        serverSize = serverSize > 1 ? serverSize : 1
        let gradient = `conic-gradient(
          var(--radialChartTwo)   0%, var(--radialChartTwo) ${serverSize}%,
          var(--radialChartThree) ${serverSize}%, var(--radialChartThree) ${used}%,
          var(--radialChartOne)   ${used}%, var(--radialChartOne)100%   
          )`
        document.documentElement.style.setProperty('--storageConicGradient', gradient)
    }
}