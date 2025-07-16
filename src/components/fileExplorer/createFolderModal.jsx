import { useRef,useContext } from "react"
import { LangContext,FilesContext,AppContext } from "../../js/contexts"
import { prepareFetch, preparePath } from "../../js/functions"
import folderSolid from '@assets/icons/folder-solid.svg'
export default function CreateFolderModal({ setShowCreateFolder,directoryTree,personalDirectory }) {
    let lang=useContext(LangContext)
    const filesContextData=useContext(FilesContext)
    const userData=useContext(AppContext).user.userData
    const FRProps=filesContextData.forceRenderProps
    let inputRef=useRef(null)
    function handleSubmit(e) {
        e.preventDefault()
        let input=inputRef.current
        if(input.value.trim().length==0) return
        let formData=new FormData()
        let path=null        
        if(personalDirectory)path=preparePath(directoryTree+input.value.trim(),true)
        else path=preparePath(directoryTree+input.value.trim())
        formData.append('path',path)
        fetch(prepareFetch('/api/resources/directories'),{
            credentials:'include',
            method:'POST',
            body:formData,
        }).then((response)=>{
            if(response.ok){
                setShowCreateFolder(false)
                FRProps.setForceRender(FRProps.forceRender+1)
            }
            else alert (lang.alertMessages[2])
        })
    }
    return <div className='createFolderModal'>
        <form className='container' onSubmit={handleSubmit}>
            <img src={folderSolid} alt="" />
            <input type="text" name="folderName" id="" ref={inputRef} />
            <div>
                <input type="button" value={lang.buttons.cancel.toUpperCase()} onClick={()=>{setShowCreateFolder(false)}}/>
                <input type="submit" value={lang.buttons.create.toUpperCase()} />
            </div>
        </form>
    </div>
}