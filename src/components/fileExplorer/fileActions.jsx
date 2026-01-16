import * as functions from '../../js/functions.jsx'
import * as fileFNs from '../../js/fileFunctions.js'
import { useRef, useContext } from 'react'
import createFolder from '@assets/icons/createFolder.svg'
import upload from '@assets/icons/upload.svg'
import renameRegular from '@assets/icons/rename-regular.svg'
import trashIcon from '@assets/icons/trash-can-regular.svg'
import downloadIcon from '@assets/icons/downloadIcon.svg'
import wallpaperIcon from '@assets/icons/wallpaper.svg'
import searchIcon from '@assets/icons/magnifyingGlass.svg'
import crossIcon from '@assets/icons/crossIcon.svg'
import { AppContext, FilesContext } from '../../js/contexts.js';
function FileActions({ directoryTree, frProps,
    setShowCreateFolder, setWallpaperAsset, handleSearchBar, contextMenu }) {
    let uploadRef = useRef(null)
    const appContextData = useContext(AppContext)
    const userData = appContextData.user.userData
    const filesContextData = useContext(FilesContext)
    const directories = filesContextData ? filesContextData.directories : []
    const downloadLinkRef = useRef(false)
    const searchInputRef = useRef(false)
    const searchIconRef = useRef(false)
    const setSelectedFiles = filesContextData.setSelectedFiles
    const selectedFiles = filesContextData.selectedFiles
    const clickedFile = selectedFiles && selectedFiles[0] ? selectedFiles[0] : false
    const navWrapperRef = useRef(false)

    return (
        <div className="navWrapper" ref={navWrapperRef}>
            {handleSearchBar ?

                <div className="inputWrapper">
                    <input type="text" onChange={(e) => {
                        const text = e.target.value
                        if (text.trim() != '') searchIconRef.current.src = crossIcon
                        else searchIconRef.current.src = searchIcon
                        handleSearchBar(text)
                    }} onKeyDown={(e) => {
                        if (e.key.toLowerCase() == 'escape') e.currentTarget.blur()
                    }}
                        ref={searchInputRef} />
                    <img draggable={false} src={searchIcon} alt="searchIcon" ref={searchIconRef} onClick={() => {
                        if (searchIconRef.current.src == crossIcon) {
                            searchInputRef.current.value = ''
                            handleSearchBar('')
                            searchIconRef.current.src = searchIcon
                        }
                        else searchInputRef.current.focus()
                    }} />
                </div>
                : ''}
            <span className="fileActions" onClick={(e) => {
                if (!contextMenu) return
                if (e.target == navWrapperRef.current) return
                else contextMenu.style.visibility = 'hidden'
                console.log(e.target);
            }}>
                <button className='uploadResource' onClick={() => { uploadRef.current.click() }} ><img draggable={false} src={upload} /></button>
                <button className='createFolder' onClick={() => { setShowCreateFolder(true) }} ><img draggable={false} src={createFolder} alt="" /></button>
                <button className='renameResource' onClick={handleRename}><img draggable={false} src={renameRegular} alt="" /></button>
                <button className='bin' onClick={deleteResource}><img draggable={false} src={trashIcon} alt="" /></button>
                <button className='wallpaper' onClick={handleSetWallpaper}><img draggable={false} src={wallpaperIcon} alt="" /></button>
                <button className='download' onClick={handleDownload}><img draggable={false} src={downloadIcon} alt="" /></button>
                <input type="file" name="" id="" ref={uploadRef} onChange={uploadFile} multiple />
                <a href={null}
                    ref={downloadLinkRef}
                    style={{ display: 'none' }} download></a>
            </span>
        </div>
    )
    async function handleDownload() {
        const needsZip = Array.isArray(await fileFNs.prepareDownload(selectedFiles))
        if (!clickedFile) return
        if (!needsZip) {
            const uri = await fileFNs.prepareDownload(selectedFiles)
            window.open(functions.prepareFetch('/api/resources/download?path=' + uri), '_self')
        }
        else {
            const resourcesArray = functions.arrayToString2(await fileFNs.prepareDownload(selectedFiles))
            const uri = functions.prepareFetch("/api/resources/zip?resources=" + resourcesArray)
            window.open(uri, '_self')

        }

    }
    function handleSetWallpaper() {
        if (!clickedFile) return false
        const source = directoryTree + clickedFile.id
        const preparedPath = functions.preparePath(source, functions.checkPersonal(source, directories))
        fetch(functions.prepareFetch('/api/resources/info?resourcePath=' + preparedPath), {
            method: 'GET',
            credentials: 'include'
        }).then(async (response) => {
            if (response.ok) {
                const json = await response.json()
                console.log('json: ', json);
                if (json && json.mimeType.startsWith('image') || json.mimeType.startsWith('video')) {
                    const wallpaperString = JSON.stringify({ uri: preparedPath, mimeType: json.mimeType })
                    localStorage.setItem('wallpaper', wallpaperString)
                    const frProps = appContextData.FRApp
                    setWallpaperAsset(wallpaperString)
                    frProps.setFRApp(frProps.FRApp + 1)
                }
            }
        })
    }
    function uploadFile(e) {
        let files = e.currentTarget.files;
        const personalDirectory = functions.checkPersonal(directoryTree, filesContextData.directories)
        if (files) fileFNs.uploadFiles(directoryTree, files, frProps, personalDirectory)
        uploadRef.current.value = "";
    }
    function deleteResource() {
        const formData = new FormData()
        if (selectedFiles && selectedFiles.length >= 1) {
            formData.append('resourceUrl', functions.arrayToString(selectedFiles, directoryTree, directories))
        }

        fetch(functions.prepareFetch('/api/resources'), {
            credentials: 'include',
            method: 'DELETE',
            body: formData
        }).then((res) => {
            if (res.status == 200) frProps.setForceRender(frProps.forceRender + 1)
        })

    }
    function handleRename() {
        if (clickedFile) {
            let span = clickedFile.querySelector('span')
            let originalName = clickedFile.querySelector('input[type="hidden"]')
            if (userData && originalName.value == userData.id) return setSelectedFiles([])
            clickedFile.setAttribute('disabled', true)
            span.setAttribute('contentEditable', true);
            span.textContent = originalName.value
            let content = span.textContent
            span.focus()
            const range = document.createRange();
            // Sets range
            range.setStart(span.firstChild, 0);
            if (content.includes('.')) range.setEnd(span.firstChild, content.indexOf('.'));
            else range.setEnd(span.firstChild, content.length);
            //Sets selection  
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            setSelectedFiles([])
        }

    }
}
export default FileActions
/*FileActions.propTypes = {
    directoryTree: PropTypes.string,
    clickedFile: PropTypes.instanceOf(Element),
    frProps: PropTypes.object,
};*/