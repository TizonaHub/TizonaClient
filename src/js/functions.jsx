import { toast } from 'react-hot-toast'
/**
 * checks if route is inside personal folder
 */
export function checkPersonal(path, data) {
  path = path.split('/')
  if (path.length >= 3) {
    const folder = data.filter(directory => directory.name == path[1]);
    if (folder[0].personal) return true
    else return false
  }
  return false
}
export function detectSelection(selectedArea, mode = 'intersect', margin = 0) {
  const areaRect = {
    left: selectedArea.getBoundingClientRect().left - margin,
    right: selectedArea.getBoundingClientRect().right + margin,
    top: selectedArea.getBoundingClientRect().top - margin,
    bottom: selectedArea.getBoundingClientRect().bottom + margin,
  };
  const filesDisplayer = document.getElementById('filesDisplayer');

  const selected = [];
  //user clicked file
  /*if (areaRect.left == areaRect.right && areaRect.top == areaRect.bottom){
    areaRect.left=areaRect.left-20
    areaRect.right=areaRect.right+20
    areaRect.top=areaRect.top-20
    areaRect.bottom=areaRect.bottom+20
  }*/
  Array.from(filesDisplayer.children).forEach((element) => {

    const elementRect = {
      left: element.getBoundingClientRect().left,
      right: element.getBoundingClientRect().right,
      top: element.getBoundingClientRect().top,
      bottom: element.getBoundingClientRect().bottom,
    };
    let inside = false;

    if (mode === 'contain') {
      inside =
        elementRect.left >= areaRect.left &&
        elementRect.right <= areaRect.right &&
        elementRect.top >= areaRect.top &&
        elementRect.bottom <= areaRect.bottom;
    } else if (mode === 'intersect') {
      inside = !(
        elementRect.left > areaRect.right ||
        elementRect.right < areaRect.left ||
        elementRect.top > areaRect.bottom ||
        elementRect.bottom < areaRect.top
      );
    }

    if (inside) selected.push(element);
  });
  return selected;
}
export function setSelectionStyles(selectedResources, setSelectedFiles, setClickedFile) {
  if (!selectedResources) return
  const filesDisplayer = document.getElementById('filesDisplayer');
  Array.from(filesDisplayer.children).forEach((res) => {
    const filter = selectedResources.filter((elem) => elem.id == res.id)
    if (filter.length > 0) {
      if (setClickedFile) setClickedFile()
      res.classList.add('selectedFile')
    }
    else res.classList.remove('selectedFile')
  })
  if (setSelectedFiles) setSelectedFiles(selectedResources)

}
/**
 *  Detects if the user is using area selector or only clicking
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
export function isClick(width, height) {
  if (width < '10px' && height < '10px') return true
  return false
}
export async function changeResourceLocation(json) {
  if (json.length < 1) return
  let formData = new FormData()
  formData.append('instructions', JSON.stringify(json))
  const result = await fetch(prepareFetch('/api/resources/move'), {
    credentials: 'include',
    method: 'PATCH',
    body: formData
  }).then((res) => {
    return res.ok
  }).catch((err) => {
    console.error(err.message);
    return false
  })
  return result
}
export function getDirectoryData(json, path) {
  if (path) {
    const split = path.split('/')
    const index = split.length - 1
    const currentResourcePath = split.slice(1, index)
    let children = null
    if (currentResourcePath.length == 0) return (json) // root
    else if (currentResourcePath.length == 1) { //first level
      children = json.filter((resource) => resource.name == currentResourcePath[0])[0].children
      //if(!children) return false
      return (children)
    }
    else {
      currentResourcePath.forEach((res) => {
        if (!children) { //first element on loop
          children = json.filter((resource) => resource.name == currentResourcePath[0])[0].children
        }
        else {
          children = children.filter((resource) => resource.name == res)[0].children
        }
      })
      return (children)

    }
  }
}
//Removes 'root' or the first element from path, 
export function preparePath(path, privateDir) {
  path = path.replace('root/', '')
  path = path.split('/')
  if (!privateDir) path.unshift('publicDirectories')
  path.unshift('directories')
  path.unshift('')
  return path.join('/')
}
export function shortenValue(data) {
  if (!data) return
  return data.length > 30 ? data.slice(0, 30) + '...' : data
}
export function reduceOpacity(value) {
  if (!value) document.documentElement.style.setProperty('--darkColor', 'rgba(24, 24, 24,1)')
  else document.documentElement.style.setProperty('--darkColor', 'rgba(24, 24, 24,0.95)')
}
export function arrayToString(selectedFiles, directoryTree, directories) {

  let string = '['
  selectedFiles.forEach((element, index) => {
    const name = element.id ? element.id : element.name ? element.name : null
    let resourceUrl = getURL(directoryTree + name, directories)
    string = string + '"' + resourceUrl + '"'
    if (index != selectedFiles.length - 1) string = string + ','

  });
  return string + ']'
}
/**
 * all arrayToString must be updated
 */
export function arrayToString2(array) {

  let string = '['
  array.forEach((element, index) => {
    string = string + '"' + element + '"'
    if (index != array.length - 1) string = string + ','
  });
  return string + ']'
}
export function prepareMoveResourcesJSON(selectedFiles, directoryTree, directories, destiny) {
  const array = []
  selectedFiles.forEach((element) => {
    const name = element.id || element.name
    const source = getURL(directoryTree + name, directories)
    if (source + '/' == getURL(destiny, directories)) return //same resource
    if (getURL(directoryTree, directories) == getURL(destiny, directories)) return // same current dir
    const destinyURL = getURL(destiny + name, directories)
    const json = { from: source, to: destinyURL }
    array.push(json)
  });
  return array
}

export function getURL(path, directories) {
  return preparePath(path, checkPersonal(path, directories))
}
export function selectionToArray(selection) {
  let string = '['
  selection.forEach((element, index) => {
    const name = element.id
    let resourceUrl = getURL(selection + name)
    string = string + '"' + resourceUrl + '"'
    if (index != selection.length - 1) string = string + ','

  });
  string = string + ']'
  console.log('string: ', string);
  return string
}
/**
 *  Gets file URL in server. This allows to download the file, get image and whatever you want
 * @returns createURL
 */
export function getFileSrc(uri) {
  uri = prepareFetch(uri)
  return uri
}
export function getCookie(cookieName) {
  let cookies = document.cookie.split(';')
  let foundCookie = false
  cookies.map((element) => {
    element = element.split('=')
    if (element[0] == cookieName) foundCookie = element
  });
  return foundCookie[1]
}
export function showToast(msg, type, styles) {
  if (!styles) styles = {
    backgroundColor: 'black', color: 'white', fontSize: '20px',
    borderRadius: '100px', gap: '10px'
  }
  switch (type) {
    case 'error':
      return toast.error(msg, { id: 'clipboard', style: styles })

    case 'success':
      return toast.success(msg, { id: 'clipboard', style: styles })

    case 'loading':
      return toast.loading(msg, { id: 'clipboard', style: styles })

    default:
      toast(msg, styles);
      break;
  }
}
export function checkPassword(password, repeatPass, errors) {
  if (password != repeatPass) errors.push(0)
  else if (password.trim().length == 0) errors.push(4)
  else if (password.trim().length < 8 || password.trim().length > 24) errors.push(1)
  return errors
}
export function checkName(name, username, errors) {
  if (name.trim().length < 1) errors.push(2)
  else if (name.trim().length > 35) errors.push(3)
  return errors
}
export function getRoleProps(role) {
  const roleHighlights = { 100: '#930d0d', 50: 'green', 0: '#107595' }
  let json = null
  switch (role) {
    case 100: json = { color: roleHighlights[100], role: 'Super Admin' }
      break;
    case 50: json = { color: roleHighlights[50], role: 'Admin' }
      break;
    case 0: json = { color: roleHighlights[0], role: 'User' }
      break;
  }
  return json
}
export async function getLangData(lang) {
  if (!lang) lang = 'en'
  try {
    const module = await import(`@src/lang/${lang}.json`);
    return module[lang]
  } catch (error) {
    console.error("Unable to load language file");
    return null
  }
}
export function getServerUri() {
  const uri = window.location.href
  let split = uri.split('/')
  split = split.slice(0, 3)
  if (split[2].includes(':')) {
    let elem = split[2]
    elem = elem.split(':')
    elem[1] = ''
    elem = elem.join(' ')
    split[2] = elem
  }
  split[1] = '//'
  return split = split.join('')
}

function formatBinary(num) {
  let calc = Math.floor(num / (1024 ** 3))
  let formattedNumber = null
  if (calc > 0) formattedNumber = calc.toLocaleString() + ' GiB'
  else {
    calc = Math.floor(num / (1024 ** 2))
    formattedNumber = calc.toLocaleString() + ' MiB'
  }
  return formattedNumber
}

function formatDecimal(num) {
  if (isNaN(num)) return ''
  let calc = Math.floor(num / (1000 ** 3))
  if (calc > 0) return calc.toLocaleString() + ' GB'
  calc = Math.floor(num / (1000 ** 2))
  if (calc > 0) return calc.toLocaleString() + ' MB'
  calc = Math.floor(num / (1000))
  return calc.toLocaleString() + ' KB'
}
export function formatNumber(num, decimal = true) {
  return decimal ? formatDecimal(num) : formatBinary(num)

}
export function prepareFetch(endpoint) {
  const baseUrl = getServerUri()
  const url = new URL(endpoint, baseUrl).href
  return url
}