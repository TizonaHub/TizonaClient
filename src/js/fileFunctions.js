
import toast from 'react-hot-toast';
import { prepareFetch, preparePath, showToast } from './functions';
export function uploadFiles(directoryTree, droppedFiles,
  frProps, personalDirectory) {
  let formData = new FormData()
  let tree = preparePath(directoryTree, personalDirectory)
  formData.append('directory', tree)
  for (let i = 0; i < droppedFiles.length; i++) {
    formData.append('files[]', droppedFiles[i]);
  }
  let promiseToast = undefined
  const timeout = setTimeout(() => {
    promiseToast = showToast('Uploading resource', 'loading')
  }, 50)
  fetch(prepareFetch('/api/resources/upload'), {
    credentials: 'include',
    method: 'POST',
    body: formData
  }).then((res) => {
    clearTimeout(timeout)
    if (res.ok) {
      if (promiseToast) toast.dismiss(promiseToast)
      frProps.setForceRender(frProps.forceRender + 1)
    }
    else {
      showToast('Could not upload resource', 'error')
    }
  })
}