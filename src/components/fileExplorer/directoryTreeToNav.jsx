/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef } from 'react'
import { FilesContext, AppContext } from '../../js/contexts'
import themes from '../../js/themes.json'
import { changeResourceLocation, checkPersonal, prepareMoveResourcesJSON, preparePath } from '../../js/functions'
function DirectoryTreeToNav({ directoryTree, setDirectoryTree, frProps, draggingData,selectedFiles }) {
  let directoryTreeLocal = directoryTree.split('/').slice(0, -1)
  const appContextData = useContext(AppContext)
  const userData = appContextData.user.userData
  let navRef = useRef(null)
  let theme = localStorage.getItem('theme')
  const filesContextData = useContext(FilesContext)
  const directories = filesContextData ? filesContextData.directories : []
  useEffect(() => {
    navRef.current.scrollLeft = 3000
  })
  return (
    <div className='directoryNav' ref={navRef}>
      {directoryTreeLocal.map((elem, index) => {
        if (index == 0) return <ElementNode elem={elem} key={index} index={index} />
        else return (<>
          <span>{'>'}</span>
          <ElementNode elem={elem} key={index} index={index} />
        </>)
      })}
    </div>
  )
  function ElementNode({ elem, index }) {
    userData && userData.id == elem ? elem = 'privateFolder' : null
    return (
      <button onClick={selectDirectoryTree}
        onDragOver={(e) => {
          e.preventDefault()
          if (!theme) theme = 'red'
          e.currentTarget.style.borderColor = themes[theme].mainColor
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = ''
        }}
        onDrop={handleDrop}
      >
        {elem}
      </button>
    )
    async function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.borderColor = ''
      const draggedElementData = draggingData.current
      const name = draggedElementData.id
      let source = directoryTree + `${name}`
      let tree = directoryTree.split('/').slice(0, index + 1).join('/')+'/'
      if(!selectedFiles || selectedFiles.length<1) selectedFiles=[{id:name}]
  
      const json=prepareMoveResourcesJSON(selectedFiles,directoryTree,directories,tree)
      tree = preparePath(source, checkPersonal(source, directories))
      await changeResourceLocation(json)
      frProps.setForceRender(frProps.forceRender + 1)
    }
    function selectDirectoryTree() {
      let tree = directoryTree.split('/').slice(0, index + 1).join('/')
      tree = tree + '/'
      setDirectoryTree(tree)
    }
  }
}
export default (DirectoryTreeToNav)