import PropTypes, { func } from 'prop-types';
import * as functions from '../../js/functions.jsx'
import * as fileFunctions from '../../js/fileFunctions.js'
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
function FileActions({ directoryTree, clickedFile, frProps,
    setClickedFile, setShowCreateFolder, setWallpaperAsset, handleSearchBar, selectedFiles, setSelectedFiles }) {
    let uploadRef = useRef(null)
    const appContextData = useContext(AppContext)
    const userData = appContextData.user.userData
    const filesContextData = useContext(FilesContext)
    const directories = filesContextData ? filesContextData.directories : []
    const downloadLinkRef = useRef(false)
    const searchInputRef = useRef(false)
    const searchIconRef = useRef(false)

    return (
        <div className="navWrapper">
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
                <img src={searchIcon} alt="searchIcon" ref={searchIconRef} onClick={() => {
                    if (searchIconRef.current.src == crossIcon) {
                        searchInputRef.current.value = ''
                        handleSearchBar('')
                        searchIconRef.current.src = searchIcon
                    }
                    else searchInputRef.current.focus()
                }} />
            </div>
            <span className="fileActions">
                <button className='uploadResource' onClick={() => { uploadRef.current.click() }} ><img src={upload} /></button>
                <button className='createFolder' onClick={() => { setShowCreateFolder(true) }} ><img src={createFolder} alt="" /></button>
                <button className='renameResource' onClick={handleRename}><img src={renameRegular} alt="" /></button>
                <button className='bin' onClick={deleteResource}><img src={trashIcon} alt="" /></button>
                <button className='wallpaper' onClick={handleSetWallpaper}><img src={wallpaperIcon} alt="" /></button>
                <button className='download' onClick={handleDownload}><img src={downloadIcon} alt="" /></button>
                <input type="file" name="" id="" ref={uploadRef} onChange={uploadFile} multiple />
                <a href={null}
                    ref={downloadLinkRef}
                    style={{ display: 'none' }} download></a>
            </span>
        </div>
    )
    async function handleDownload() {
        if (!clickedFile) return
        const directoryData = functions.getDirectoryData(directories, directoryTree)
        let source = directoryTree + clickedFile.name
        source = functions.prepareFetch(functions.preparePath(source, functions.checkPersonal(source, directories)))
        const resource = directoryData.filter(item => new URL(item.uri, functions.getServerUri()).href == source);
        if (resource && resource[0].type != 'file') return functions.showToast('You can not download folders. This feature will be available in the future', 'error')
        const response = await fetch(source);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = clickedFile.name;
        downloadLinkRef.current.click()
    }
    function handleSetWallpaper() {
        if (!clickedFile) return false
        const source = directoryTree + clickedFile.name
        const preparedPath = functions.preparePath(source, functions.checkPersonal(source, directories))
        console.log('preparedPath: ', preparedPath);
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
        if (files) fileFunctions.uploadFiles(directoryTree, files, frProps, personalDirectory)
        uploadRef.current.value = "";
    }
    function deleteResource() {
        const resourcesURLs = []
        const formData = new FormData()
        if (selectedFiles.length >= 1) {
            let string='['
            selectedFiles.forEach((element,index) => {
                const name = element.id
                let resourceUrl = getURL( directoryTree + name)
                string=string+'"'+resourceUrl+'"'
                if(index!=selectedFiles.length-1) string=string+','
                resourcesURLs.push(resourceUrl)

            });
            string=string+']'
            console.log('string: ', string);
            formData.append('resourceUrl',string )
        }
        else if (directoryTree && clickedFile) {
            let resourceUrl = getURL(directoryTree + clickedFile.name)
            formData.append('resourceUrl', resourceUrl)
        }
        fetch(functions.prepareFetch('/api/resources'), {
            credentials: 'include',
            method: 'DELETE',
            body: formData
        }).then((res) => {
            if (res.status == 200) frProps.setForceRender(frProps.forceRender + 1)
        })
        function getURL(path) {
            return functions.preparePath(path, functions.checkPersonal(path, directories))
        }

    }
    function handleRename() {
        if (clickedFile) {
            const clickedElement = document.getElementById(`${clickedFile.name}`)
            console.log('clickedElement: ', clickedElement);
            let span = clickedElement.querySelector('span')
            let originalName = clickedElement.querySelector('input[type="hidden"')
            if (userData && originalName.value == userData.id) return setClickedFile(false)
            clickedElement.setAttribute('disabled', true)
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

            setClickedFile(false)
        }

    }
}
export default FileActions
/*FileActions.propTypes = {
    directoryTree: PropTypes.string,
    clickedFile: PropTypes.instanceOf(Element),
    frProps: PropTypes.object,
};*/