/* eslint-disable no-case-declarations */
import { prepareFetch, showToast } from './functions';
window.addEventListener("message", (event) => {
    const { fn, data } = event.data;
    const frame = document.querySelector('.mainDiv main > iframe')
    switch (fn) {
        case 'showToast':
            if (data.length != 2) return
            return showToast(data[1], data[0])
        case 'getLang':
            const lang = localStorage.getItem('lang')

            return frame.contentWindow.postMessage({ fn: 'getLang', data: lang }, '*')
        case 'getUserData':
            const userData = localStorage.getItem('userData')
            return frame.contentWindow.postMessage({ fn: 'getUserData', data: userData }, '*')
        case 'prepareFetch':
            return frame.contentWindow.postMessage({ fn: 'prepareFetch', data: prepareFetch(data) }, '*')

        default:
            break;
    }
});