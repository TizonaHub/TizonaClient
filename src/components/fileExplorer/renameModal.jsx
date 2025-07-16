/* eslint-disable react/prop-types */
import File from "../file"
function RenameModal({ data, setShowRename, directories, directoryTree }) {
    let clickedResource = directories.filter(elem => data.clickedFile.name === elem.name)[0]
    return (
        <div className="renameFileModal">
            <button onClick={() => { setShowRename(null) }}>salir</button>
            <File data={clickedResource}
                directoryTree={directoryTree} renameFileModal={true}></File>
        </div>)
}
export default RenameModal