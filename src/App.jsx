import { useEffect, useRef, useState } from 'react'
import '@src/css/animations.css'
import '@src/css/homeStyles.css'
import * as functions from './js/functions.jsx'
import sF from './js/sortFunctions'
import themes from './js/themes.json'
import { Toaster } from 'react-hot-toast';
import * as fileFunctions from './js/fileFunctions.js'
import mime from 'mime'
//Contexts
import { LangContext, AppContext, FilesContext, PluginsContext } from './js/contexts.js'
//Assets
import hideAside from '@assets/icons/hideAside.svg'
import folderSolid from '@assets/icons/folder-solid.svg'
import gear from '@assets/icons/gear.svg'
import home from '@assets/icons/home.svg'
import expandAside from '@assets/icons/expandAside.svg'
import backButton from "../src/assets/icons/angle-left-solid.svg"
//COMPONENTS
import ThemeSettings from './components/settings/theme.jsx'
import ServerInfo from './components/settings/serverInfo.jsx'
import AsideButton from './components/asideButton'
import File from './components/file'
import DirectoryTreeToNav from './components/fileExplorer/directoryTreeToNav'
import FileActions from './components/fileExplorer/fileActions'
import RenameModal from './components/fileExplorer/renameModal'
import CreateFolderModal from './components/fileExplorer/createFolderModal'
import Preferences from './components/settings/preferences.jsx'
import Loader from './components/loader.jsx'
import LoginForm from './components/home/loginForm.jsx'
import MainPanelHome from './components/home/mainPanel.jsx'
import GoBackButton from './components/goBackButton.jsx'
import WallpaperComponent from './components/wallpaperComponent.jsx'
functions.getLangData('en')
function App() {
  const [FRApp, setFRApp] = useState(0) //force render for app component
  const [currentTab, setCurrentTab] = useState(1)
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('lang'))
  const [clientConfig, setClientConfig] = useState(JSON.parse(localStorage.getItem('config')))
  const [currentSettingTab, setCSTab] = useState(0)
  const [userData, setUserData] = useState(null)
  const [wallpaperAsset, setWallpaperAsset] = useState('')
  const [langData, setLangData] = useState(null)
  const [plugins, setPlugins] = useState([{}])
  const [frame, setFrame] = useState(null)
  const frameRef = useRef(null)
  let asideRef = useRef(null)
  functions.getServerUri()
  let tabs = [
    { name: 'home', icon: home, component: <Home /> },
    { name: 'files', icon: folderSolid, component: <FilesTab /> },
    { name: 'settings', icon: gear, component: <Settings /> },
  ]
useEffect(() => {
  console.log("actualiza FRApp");
}, [FRApp]);

useEffect(() => {
  console.log("actualiza currentTab");
}, [currentTab]);

useEffect(() => {
  console.log("actualiza currentLanguage");
}, [currentLanguage]);

useEffect(() => {
  console.log("actualiza clientConfig");
}, [clientConfig]);

useEffect(() => {
  console.log("actualiza currentSettingTab");
}, [currentSettingTab]);

useEffect(() => {
  console.log("actualiza userData");
}, [userData]);

useEffect(() => {
  console.log("actualiza wallpaperAsset");
}, [wallpaperAsset]);

useEffect(() => {
  console.log("actualiza langData");
}, [langData]);

useEffect(() => {
  console.log("actualiza plugins");
}, [plugins]);

useEffect(() => {
  console.log("actualiza frame");
}, [frame]);
useEffect(() => {
  console.log("actualiza tabs");
}, [tabs]);

  useEffect(() => { //LOADS CONFIG
    if (clientConfig) {
      let config = clientConfig
      functions.reduceOpacity(config.reduceOpacity)
    }
    else {
      let defaultConfig = { reduceOpacity: true }
      localStorage.setItem('config', JSON.stringify(defaultConfig))
    }
    fetch(functions.prepareFetch('/api/auth/me'), { //verifyToken
      credentials: 'include',
    }).then(async (response) => {
      if (!response.ok) {
        document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return console.error(response.status, ': Invalid or missing token');
      }
      if (await response.clone().json()) {
        let data = await response.json()
        localStorage.setItem('userData', JSON.stringify(data))
        if (JSON.stringify(data) != JSON.stringify(userData)) setUserData(data)
      }
    })
    applyLang();
    applyTheme();
    getPlugins()
    async function applyTheme() {
      let theme = localStorage.getItem('theme')
      if (theme) {
        document.documentElement.style.setProperty('--mainColor', themes[theme].mainColor)
        document.documentElement.style.setProperty('--secondColor', themes[theme].secondColor)
        document.documentElement.style.setProperty('--thirdColor', themes[theme].thirdColor)
        document.documentElement.style.setProperty('--gradientOne', themes[theme].gradientColors[0])
        document.documentElement.style.setProperty('--gradientTwo', themes[theme].gradientColors[1])
        document.documentElement.style.setProperty('--filesSelector', themes[theme].filesSelector)
      }
    }
    async function applyLang() {
      const data = await functions.getLangData(currentLanguage)
      setLangData(data)
    }
  }, [FRApp, clientConfig, currentLanguage])
  if (!langData) return
  return (
    <LangContext.Provider value={langData}>
      <AppContext.Provider value={{
        FRApp: { FRApp, setFRApp },
        user: { userData, setUserData },
        setFrame: setFrame,
        frame: frame
      }}>
        <PluginsContext.Provider value={{getPlugins:getPlugins,plugins:plugins}}>
          <WallpaperComponent wallpaperData={wallpaperAsset} />
          <aside ref={asideRef}>
            <img src={hideAside} onClick={toggleAside} className='containIcon'
              style={{
                height: '30px', width: '30px', cursor: 'pointer'
              }} />
            {tabs.map((btn, index) => {
              return <AsideButton key={btn.name} data={btn} currentTabProps={{ currentTab, setCurrentTab }} index={index} />
            })}
            {Object.values(plugins).map((btn, index) => {
              return <AsideButton key={btn.name + index} data={btn}
                currentTabProps={{ currentTab, setCurrentTab }}
                index={index}
                plugin={true}
              />
            })}
          </aside>
          <Toaster />
          {!frame ?
            tabs[currentTab].component :
            <div className="mainDiv">
              <main>
                <iframe src={frame}></iframe>
              </main>
            </div>
          }
        </PluginsContext.Provider>
      </AppContext.Provider>
    </LangContext.Provider>

  )
  
    async function getPlugins() {
      fetch(functions.prepareFetch('/api/system/plugins'), {
        method: 'GET'
      }).then(async (res) => {
        if (res.ok) {
          const json = await res.json()
          setPlugins(json.pluginsArray)
        }
      })
    }
  function toggleAside(e) {
    let style = getComputedStyle(asideRef.current)
    if (parseInt(style.width.slice(0, style.width.length - 2)) > 100) {
      e.currentTarget.src = expandAside
      e.currentTarget.style.alignSelf = 'center'
      asideRef.current.classList.add('containAside')
    }
    else {
      e.currentTarget.src = hideAside
      e.currentTarget.style.alignSelf = ''
      asideRef.current.classList.remove('containAside')
    }
  }
  function FilesTab() {
    const [forceRender, setForceRender] = useState(0)
    const [directories, setDirectories] = useState([])
    const [currentDirectoryData, setCurrentDirectoryData] = useState([])
    const [currentDirectoryDataCopy, setCurrentDirectoryDataCopy] = useState([]) //keeps current directory data. It never changes
    const [selectedFiles, setSelectedFiles] = useState([]) //stores resources form selection
    const [directoryTree, setDirectoryTree] = useState('root/')
    const [showRename, setShowRename] = useState(null)
    const [showCreateFolder, setShowCreateFolder] = useState(null)
    const draggingData = useRef(null)
    const [mediaPlayerResource, setMediaPlayerResource] = useState(null)
    const dragOverFiles = useRef(null)
    const draggingElement = useRef(false) // Represents an html/react element inside file displayer. Used to know if you are dragging an element or a file from your pc
    const mediaPlayerRef = useRef(false)
    const filesSelector = useRef(null) // squared div used to select several files and directories
    const filesSelectorPosition = useRef(false) // The position of mouse when selecting several files and directories
    const filesMainRef = useRef(false)
    const contextMenuRef = useRef(false)
    sF.sortByType(directories)
    sF.sortPrivate(directories)
    useEffect(() => {
      setCurrentDirectoryData(functions.getDirectoryData(directories, directoryTree))
      setCurrentDirectoryDataCopy(functions.getDirectoryData(directories, directoryTree))
    }, [directoryTree])
    useEffect(() => {
      setSelectedFiles(null)
      const query = `?directory=/directories/publicDirectories&recursive=true&privateDir=true`
      fetch(functions.prepareFetch('/api/resources/directories' + query), { //getDirectories
        credentials: 'include',
        method: 'GET',
      })
        .then(async (response) => {
          let json = await response.json()
          setDirectories(json)
          setCurrentDirectoryData(functions.getDirectoryData(json, directoryTree))
          setCurrentDirectoryDataCopy(functions.getDirectoryData(json, directoryTree))

        })
    }, [forceRender])

    useEffect(() => {
      const filesDisplayer = document.getElementById('filesDisplayer');
      Array.from(filesDisplayer.children).forEach((res) => res.classList.remove('selectedFile')) //clears styles
      if (!selectedFiles) return
      selectedFiles.forEach((res) => res.classList.add('selectedFile'))

    }, [selectedFiles])

    const providerJson = {
      forceRenderProps: { forceRender: forceRender, setForceRender: setForceRender },
      directories: directories,
      setMediaPlayerResource: setMediaPlayerResource,
      selectedFiles: selectedFiles,
      setSelectedFiles: setSelectedFiles
    }
    //Used in createfoldermodal. Maybe it is not necessary
    const personalDirectory = functions.checkPersonal(directoryTree, directories)

    return (
      <FilesContext.Provider value={providerJson}>
        <div className='mainDiv'
          onContextMenu={handleContextMenu}>
          <div className="contextMenu" ref={contextMenuRef}>
            <FileActions directoryTree={directoryTree}
              frProps={{ forceRender: forceRender, setForceRender: setForceRender }}
              inPersonalDirectory={personalDirectory}
              setWallpaperAsset={setWallpaperAsset}
              setShowRename={setShowRename}
              setShowCreateFolder={setShowCreateFolder}
              selectedFiles={selectedFiles}
              contextMenu={contextMenuRef.current}
            />
          </div>
          {showCreateFolder ? <CreateFolderModal setShowCreateFolder={setShowCreateFolder}
            directoryTree={directoryTree} personalDirectory={personalDirectory} /> : null}
          <main className='filesMain' id='filesMain'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={filesMainRef}
          >
            {mediaPlayerResource ? <MediaPlayerComponent /> : null}
            {showRename ? <RenameModal data={showRename} setShowRename={setShowRename} directories={directories} directoryTree={directoryTree}></RenameModal> : null}
            <div className="upperContainer"
              onMouseUp={(e) => {
                handleMouseUp(e, 'uppercontainer')
              }}
              onClick={(e) => {
                const children = e.currentTarget.children
                if (Array.from(children).includes(e.target)) {
                  setSelectedFiles([])
                }
              }}>
              <nav>
                <button onClick={handleBackClick}>
                  <img src={backButton} alt="" />
                </button>
                <div className="pathNavMobile">
                  <button onClick={handleBackClick}>
                    <img src={backButton} alt="" />
                  </button>
                  <DirectoryTreeToNav directoryTree={directoryTree}
                    setDirectoryTree={setDirectoryTree}
                    frProps={{ forceRender, setForceRender }}
                    selectedFiles={selectedFiles}
                  />
                </div>
                <DirectoryTreeToNav directoryTree={directoryTree}
                  setDirectoryTree={setDirectoryTree}
                  draggingData={draggingData}
                  frProps={{ forceRender, setForceRender }}
                  selectedFiles={selectedFiles} />
                <FileActions directoryTree={directoryTree}
                  frProps={{ forceRender: forceRender, setForceRender: setForceRender }}
                  inPersonalDirectory={personalDirectory}
                  setWallpaperAsset={setWallpaperAsset}
                  setShowRename={setShowRename}
                  setShowCreateFolder={setShowCreateFolder}
                  handleSearchBar={handleSearchBar}
                  selectedFiles={selectedFiles}
                />
              </nav>
              <hr />
            </div>
            <div className="displayerContainer"
              id="displayerContainer"
              onDragStart={(e) => {
                draggingElement.current = true
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", e.target.id);
              }}
              onDragOver={
                (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverFiles.current.style.display == '' && !draggingElement.current) dragOverFiles.current.style.display = 'flex'
                }}
              onDrop={handleOnDrop}
              onMouseUp={handleMouseUp}
            >
              <div className='dragOverFiles' ref={dragOverFiles}>
                <div className="dragZone"
                  onDragLeave={() => {
                    dragOverFiles.current.style = ''
                  }}></div>
                <h2>Drag file here</h2>
              </div>
              <div className="filesSelector" ref={filesSelector}></div>
              <div className='filesDisplayer' id='filesDisplayer'
              >
                {currentDirectoryData.map((element, index) => {
                  return (
                    <File data={element} key={element.name + index}
                      personal={element.personal}
                      directoryTree={directoryTree} setDirectoryTree={setDirectoryTree}
                      frProps={{ forceRender: forceRender, setForceRender: setForceRender }}
                      draggingElement={draggingElement}
                      draggable={true}
                      draggingData={draggingData}
                      inPersonalDirectory={personalDirectory}
                      selectedFiles={selectedFiles}
                    />
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      </FilesContext.Provider>
    )

    function handleContextMenu(e) {
      e.preventDefault()
      const contextMenu = contextMenuRef.current
      if (e.target == e.currentTarget) return contextMenu.style.visibility = 'hidden'
      const mainDiv = document.querySelector('.mainDiv')
      if (filesDisplayerClicked(e, true)) {
        const mainDivRect = mainDiv.getBoundingClientRect()
        const rectContextMenu = contextMenu.getBoundingClientRect()
        const calcY = e.clientY - mainDiv.getBoundingClientRect().top
        let calcX = e.clientX - mainDiv.getBoundingClientRect().left
        let leftStyle = calcX
        if (calcX > mainDivRect.right * 0.6) {
          calcX = calcX - rectContextMenu.width
          leftStyle = calcX - 20
        }
        else {
          leftStyle = calcX + 20
        }
        contextMenu.style.visibility = 'visible'
        contextMenu.style.left = leftStyle + 'px'
        contextMenu.style.top = calcY * 0.85 + 'px'
      }
    }
    /**
     * Checks if user clicked below <hr> tag
     * @param {*} e 
     * @returns 
     */
    function filesDisplayerClicked(e, includefiles = false) {
      const hrElement = document.querySelector('.filesMain hr')
      const condition1 = e.target.classList.contains('filesMain') || e.target.classList.contains('filesDisplayer') || e.target.classList.contains('displayerContainer')
      const condition2 = hrElement.getBoundingClientRect().top < e.clientY
      if (condition1 && condition2) return true
      else if (includefiles && condition2) return true
      return false
    }
    function handleMouseDown(e) {
      const hrElement = document.querySelector('.filesMain hr')
      const filesMainElem = filesMainRef.current
      contextMenuRef.current.style.visibility = 'hidden'
      if (filesDisplayerClicked(e)) {
        filesSelectorPosition.current = [e.clientY, e.clientX]
        const calcY = e.clientY - hrElement.getBoundingClientRect().top
        const calcX = e.clientX - filesMainElem.getBoundingClientRect().left
        filesSelector.current.style.top = calcY + 'px'
        filesSelector.current.style.left = calcX + 'px'
      }
    }
    function handleMouseLeave(e) {
      filesSelectorPosition.current = false
      filesSelector.current.style = ''
    }
    function handleMouseMove(e) {
      if (filesSelectorPosition.current) {
        const initialPos = filesSelectorPosition.current;
        const width = e.clientX - initialPos[1];
        const height = e.clientY - initialPos[0];
        const scaleX = width < 0 ? -1 : 1;
        const scaleY = height < 0 ? -1 : 1;
        filesSelector.current.style.transform = `scale(${scaleX}, ${scaleY})`;
        filesSelector.current.style.width = Math.abs(width) + "px";
        filesSelector.current.style.height = Math.abs(height) + "px";
      }
    }
    function handleMouseUp(e, origin = false) {
      const width = filesSelector.current.style.width
      const height = filesSelector.current.style.height
      const selectedResources = functions.detectSelection(filesSelector.current)
      const condition1 = e.target.id == 'displayerContainer'
        || e.target.id == 'filesDisplayer'
        || e.target.id == 'filesMain'
      if (functions.isClick(width, height) && origin == 'uppercontainer') {
        filesSelectorPosition.current = false
        filesSelector.current.style = ''
        return
      }

      if (!functions.isClick(width, height)) {
        setSelectedFiles(selectedResources);
      }
      else if (condition1 && functions.isClick(width, height)) {
        setSelectedFiles([])
      }

      filesSelectorPosition.current = false
      filesSelector.current.style = ''
    }

    function handleSearchBar(text) {
      const filteredDatas = []
      if (text.trim() == '') return setCurrentDirectoryData(currentDirectoryDataCopy)
      directories.forEach(resource => {
        filterData(resource, 'root/')
        setCurrentDirectoryData(filteredDatas)
      });
      function filterData(resource, dir) {
        const name = resource.name
        const filteredResource = name.toLowerCase().includes(text.toLowerCase())
        resource.dir = dir
        if (filteredResource) filteredDatas.push(resource)
        if (resource.type == 'directory') {
          resource.children.forEach(child => {
            filterData(child, dir + name + '/')
          });
        }
      }
    }
    function handleOnDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      draggingElement.current = false
      const droppedFiles = e.dataTransfer.files;
      console.log('e.dataTransfer: ', e.dataTransfer);
      console.log('droppedFiles: ', droppedFiles);
      dragOverFiles.current.style = ''
      const personalDirectory = functions.checkPersonal(directoryTree, directories)
      //fileFunctions.uploadFiles(directoryTree, droppedFiles,
      //  { setForceRender, forceRender }, personalDirectory)

    }
    function MediaPlayerComponent() {
      if (!mediaPlayerResource) return
      const checkPersonal = functions.checkPersonal(mediaPlayerResource, directories)
      const resourcePath = functions.preparePath(mediaPlayerResource, checkPersonal, true)
      const resource = functions.getFileSrc(resourcePath)
      const mimeType = mime.getType(resource)
      if (!mimeType) return
      if (mimeType && !mimeType.includes('image') && !mimeType.includes('video') && !mimeType.includes('audio')) return
      let media = ''
      if (mimeType.includes('image')) media = <img src={resource} />
      else if (mimeType.includes('video')) media = <video src={resource} controls autoPlay />
      else if (mimeType.includes('audio')) media = <audio controls><source src={resource} type="audio/mpeg" /></audio>
      return <div className="mediaPlayer" ref={mediaPlayerRef}>
        <GoBackButton icon={'cross'} content={langData.misc[1]} onClick={() => {
          mediaPlayerRef.current.style.animation = 'fadeInOutNS 0.1s ease-out forwards'
          setTimeout(() => {
            setMediaPlayerResource(null)
          }, 200)
        }} />
        <div className="mediaContainer">
          {media}
        </div>
      </div>
    }
    function handleBackClick() {
      let directoryTreeLocal = directoryTree

      if (directoryTree != 'root/') {
        directoryTreeLocal = directoryTreeLocal.split('/').slice(0, -2).join('/') + '/'
        if (directoryTreeLocal == 'root') directoryTreeLocal = 'root/'
        setDirectoryTree(directoryTreeLocal)
      }
    }
  }
  function Settings() {
    const settingsContentRef = useRef(null)
    return (<div className='mainDiv'>
      <main className='settingsMain'>
        <h2>{langData.settings.title}</h2>
        <hr className="thinDivider" />
        <div className='settingsDisplayer'>
          <div className="settingsNavigation">
            <div className={`tabSelector${currentSettingTab == 0 ? ' selected' : ''}`} onClick={() => { setCSTab(0) }}>
              <div className='svg' /> <span>{langData.settings.tabs[0]}</span>
            </div>
            <div className={`tabSelector${currentSettingTab == 1 ? ' selected' : ''}`} onClick={() => { setCSTab(1) }}>
              <div className='svg' /> <span>{langData.settings.tabs[1]}</span>
            </div>
            <div className={`tabSelector${currentSettingTab == 2 ? ' selected' : ''}`} onClick={() => { setCSTab(2) }}>
              <div className='svg' /> <span>{langData.settings.tabs[2]}</span>
            </div>
          </div>
          <hr className="verticalDivider" />
          <div className='settingsContent' ref={settingsContentRef}>
            {getSettingsContent()}
          </div>
        </div>
      </main>
    </div>)
    function getSettingsContent() {
      switch (currentSettingTab) {
        case 0:
          return <Preferences setCurrentLanguage={setCurrentLanguage} />
        case 1:
          return <ThemeSettings setTheme={setTheme}
            setWallpaperAsset={setWallpaperAsset}
            setClientConfig={setClientConfig}
            clientConfig={clientConfig}
            frProps={{ FRApp, setFRApp }}
          />
        case 2:
          return <ServerInfo settingsContentRef={settingsContentRef} />
        default:
          break;
      }
    }
  }
  function Home() {
    console.log(userData);
    return (<div className='mainDiv'>
      <main className='homeMain'>
        {!userData ? <LoginForm /> : <MainPanelHome />}
      </main>
    </div>)
  }
  function setTheme(e) {
    localStorage.setItem('theme', e.currentTarget.value)
    setFRApp(FRApp + 1)
  }

  function LoaderContainer() {
    return (<div style={{
      width: '100%', height: '100%',
      background: '#ffffff12', backdropFilter: 'blur(10px)',
      position: 'absolute'
    }}><Loader /></div>)
  }

}

export default App
