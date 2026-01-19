
import toast from 'react-hot-toast';
import { arrayToString2, prepareFetch, preparePath, showToast } from './functions';
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
export async function prepareDownload(resources) {
  const uris = [];
  let fileType=false
  Array.from(resources).forEach((res) => {
    const uri = getAttribute(res,'uri');
    fileType=getAttribute(res,'type')
    uris.push(uri);
  });

  const stringifiedArray = arrayToString2(uris);
  const formData = new FormData();
  formData.append("resources", stringifiedArray);
  if (uris.length == 0) return false
  if (uris.length > 1 || fileType=='directory') {
    return uris
  }
  else {
    return uris[0]
  }
}

export function getAttribute(elem,attr){
  switch (attr) {
    case 'uri':
      return elem.querySelector('input[name="uri"]').value;
      
    case 'type':
      return elem.querySelector('input[name="type"]').value;
      
  }
}