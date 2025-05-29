/* eslint-disable react/prop-types */
import videoIcon from '@assets/icons/videoIcon.svg'
import {
    shortenValue, getFileSrc, preparePath, checkPersonal
    , changeResourceLocation, prepareFetch
} from '../js/functions.jsx';
import { LangContext, AppContext, FilesContext } from '../js/contexts';
import { useRef, useContext } from 'react';
import themes from '../js/themes.json'
function File({ data, clickedFile, setClickedFile, setDirectoryTree,
    directoryTree, renameFileModal, frProps, draggingElement, draggingData,
    personal, draggable }) {
    //VARS
    const appContextData = useContext(AppContext)
    const filesContextData = useContext(FilesContext)
    const directories = filesContextData ? filesContextData.directories : []
    const spanElement = useRef(null)
    const buttonElement = useRef(null)
    let lang = useContext(LangContext)
    const userData = appContextData.user.userData
    const name = data && data.name.trim().length > 0 ? data.name : userData && userData.name ? userData.name : null
    let element = {
        imgSrc: null,
        name: name,
        children: null,
        color: '#7d7d7d'
    };
    let theme = localStorage.getItem('theme')
    if (data.children) element.children = JSON.stringify(data.children)
    return (
        <>
            <button className={`fileButton ${clickedFile && element.name != null && clickedFile.id == element.name ? 'selectedFile' : null}`}
                onClick={handleFileClick} id={element.name}
                draggable={draggable}
                ref={buttonElement}
                onDrop={handleOnDrop}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {getFileType() == 'image' ? <img src={getFileSrc(data.uri)} alt="" draggable='false' /> :
                    getFileType() == 'video' ? <img src={videoIcon} alt="" /> :
                        <div className={`fileColorDiv ${personal
                            ? 'userFolder' : data.type == 'file'
                                ? 'file' : null}
                          `} >
                        </div>}
                <span contentEditable={renameFileModal ? true : false}
                    ref={spanElement}
                    suppressContentEditableWarning={true}
                    onKeyDown={handleRename} onBlur={handleBlur}>
                    {shortenValue(userData && userData.id == data.name ? 'Private folder' : data.name)}
                </span>
                <input type="hidden" name="originalName" value={data.name} />
            </button>
        </>
    )

    function handleDragStart(e){
        draggingData.current=e.currentTarget
    }
    function handleRename(e) {
        if (e.key == 'Enter') e.currentTarget.blur()
    }
    async function handleBlur(e) {
        let formData = new FormData()
        let newName = e.currentTarget.textContent.trim()
        e.currentTarget.setAttribute('contentEditable', false)
        if (data.name.trim() != newName) {
            if (!confirm(lang.alertMessages[0])) return resetSpanValue()
            let source = directoryTree + data.name
            source = preparePath(source, checkPersonal(source, directories))
            formData.append('source', source)
            formData.append('newName', newName)
            fetch(prepareFetch('/api/resources/rename'), { //chageResourceName
                method: 'PATCH',
                body: formData
            }).then((res) => {
                if (!res.ok) {
                    alert(lang.alertMessages[1])
                    resetSpanValue()
                }
                frProps.setForceRender(frProps.forceRender + 1)
            })
        }
        else resetSpanValue()
    }
    function resetSpanValue() {
        buttonElement.current.removeAttribute('disabled')
        spanElement.current.textContent = shortenValue(data.name)
    }
    async function handleOnDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = ''
        //vars
        const draggedElementData=draggingData.current
        //const name = e.dataTransfer.getData('text/plain'); //dragged element
        const name=draggedElementData.id
        let source = directoryTree + `${name}`
        let newLocation = directoryTree + data.name.trim() + '/' + name
        const result = await changeResourceLocation(source, newLocation, data, directories)
        result ? frProps.setForceRender(frProps.forceRender + 1) : null
        draggingData.current=null
        draggingElement.current = false
    }


    /**
     * Handles file click
     * @param {*} e 
     */
    function handleFileClick(e) {
        if (!renameFileModal) {
            let isNotEditable = e.target.contentEditable !== 'true';
            if (e.currentTarget == clickedFile && data.type == 'directory' && isNotEditable) {
                setClickedFile(null)
                setDirectoryTree(directoryTree + data.name + '/')
            }//directory double click
            else if (e.currentTarget == clickedFile && data.type == 'file' && isNotEditable) { // file double click
                filesContextData.setMediaPlayerResource(directoryTree + data.name)
            }
            else if (isNotEditable) setClickedFile(e.currentTarget) //first click
        }
    }
    /**
     * Gets file type
     * @returns 
     */
    function getFileType() {
        if (data.mimeType) {
            if (data.mimeType.includes('image')) return 'image'
            else if (data.mimeType.includes('video')) return 'video'
            else return
        }
        else return false
    }
    function handleDragOver(e) {
        if (!theme) theme = 'red'
        if (data.type == 'directory') e.currentTarget.style.borderColor = themes[theme].mainColor
    }
    function handleDragLeave(e) {
        if (data.type == 'directory') e.currentTarget.style.borderColor = ''
    }
}
export default File