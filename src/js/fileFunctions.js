
import { prepareFetch, preparePath } from './functions';
export function uploadFiles(directoryTree, droppedFiles,
  frProps, personalDirectory) {
  let formData = new FormData()
  let tree = preparePath(directoryTree,personalDirectory)
  formData.append('directory', tree)
  for (let i = 0; i < droppedFiles.length; i++) {
    formData.append('files[]', droppedFiles[i]);
  }
  fetch(prepareFetch('/api/resources/upload'), {
    credentials:'include',
    method: 'POST',
    body: formData
  }).then((res) => {
    if (res.ok) frProps.setForceRender(frProps.forceRender + 1)
  })
}