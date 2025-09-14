/* eslint-disable react/prop-types */
import videoIcon from '@assets/icons/videoIcon.svg'
import audioIcon from '@assets/icons/audioIcon.svg'
import {
    shortenValue, getFileSrc, preparePath, checkPersonal
    , changeResourceLocation, prepareFetch,
    formatNumber,prepareMoveResourcesJSON
} from '../js/functions.jsx';
import { LangContext, AppContext, FilesContext } from '../js/contexts';
import { useRef, useContext } from 'react';
import themes from '../js/themes.json'
function File({ data, setDirectoryTree,
    directoryTree, renameFileModal, frProps, draggingElement, draggingData,
    personal, draggable }) {
    //VARS
    const appContextData = useContext(AppContext)
    const filesContextData = useContext(FilesContext)
    const directories = filesContextData ? filesContextData.directories : []
    const spanElement = useRef(null)
    const buttonElement = useRef(null)
    const setSelectedFiles=filesContextData.setSelectedFiles
    const selectedFiles=filesContextData.selectedFiles
    const clickedFile=selectedFiles && selectedFiles[0]?selectedFiles[0]:false
    let lang = useContext(LangContext)
    const userData = appContextData.user.userData
    let isPrivateDir = userData && userData.id == data.name
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
            <button className={`fileButton ${clickedFile && element.name != null && clickedFile.name == element.name ? 'selectedFile' : null}`}
                onClick={handleFileClick} id={element.name}
                draggable={draggable}
                ref={buttonElement}
                onDrop={handleOnDrop}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                title={!isPrivateDir ? data.name + ' / ' + formatNumber(data.size) : ''}
            >
                {getIcon()}
                <span contentEditable={renameFileModal ? true : false}
                    ref={spanElement}
                    suppressContentEditableWarning={true}
                    onKeyDown={handleRename} onBlur={handleBlur}>
                    {shortenValue(isPrivateDir ? 'Private folder' : data.name)}
                </span>
                <input type="hidden" name="originalName" value={data.name} />
            </button>
        </>
    )

    function handleDragStart(e) {
        draggingData.current = e.currentTarget
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
        const draggedElementData = draggingData.current
        const name = draggedElementData.id
        const selectedFilesParam=(!selectedFiles || selectedFiles.length<1) ?[{id:name}]:selectedFiles
        const selectionJSON=prepareMoveResourcesJSON(selectedFilesParam,directoryTree,directories,directoryTree + data.name.trim() + '/')
        const result = await changeResourceLocation(selectionJSON)
        result ? frProps.setForceRender(frProps.forceRender + 1) : null
        draggingData.current = null
        draggingElement.current = false
    }


    /**
     * Handles file click
     * @param {*} e 
     */
    function handleFileClick(e) {
        let localDirectoryTree = data.dir ? data.dir : directoryTree
        if (!renameFileModal) {
            let isNotEditable = e.target.contentEditable !== 'true';
            const isDirectory = data.type == 'directory'
            const isFile = data.type == 'file'
            const isClicked = e.currentTarget.id == clickedFile.name
            if (isClicked && isDirectory && isNotEditable) {
                setSelectedFiles([])
                setDirectoryTree(localDirectoryTree + data.name + '/')
            }//directory double click
            else if (isClicked && isFile && isNotEditable) { // file double click
                setSelectedFiles([])
                filesContextData.setMediaPlayerResource(localDirectoryTree + data.name)
            }
            else if (isNotEditable) setSelectedFiles([{ ...data }]); //first click
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
            else if (data.mimeType.includes('audio')) return 'audio'
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
    function getIcon() {
        const fileType = getFileType()
        switch (fileType) {
            case 'image':
                return <img src={getFileSrc(data.uri)} alt="" draggable='false' />
            case 'video':
                return <img src={videoIcon} alt="" />
            case 'audio':
                return <img src={audioIcon} alt="" />
            default:
                return <div className={`fileColorDiv ${personal
                    ? 'userFolder' : data.type == 'file'
                        ? 'file' : null}
                          `} >
                </div>
        }

    }
}
export default File