import UserAvatar from "../userAvatar";
import cpanelIcon from "@assets/icons/cpanel.svg"
import logoutIcon from "@assets/icons/logout.svg"
import editIcon from "@assets/icons/editWhite.svg"
import GoBackButton from "../goBackButton";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext, LangContext, HomeContext } from "../../js/contexts";
import { checkPassword, checkName, showToast, prepareFetch } from "../../js/functions";
import toast from 'react-hot-toast';
import ManageUsers from "./manageUsers";
import UpdateUserForm from "../updateUserForm";
import Plugins from "./plugins";
export default function MainPanelHome() {
    const savedUserData = useRef(null)
    savedUserData.current = JSON.parse(localStorage.getItem('userData'))
    const [userData, setUserData] = useState(null)
    const [currentTab, setCurrentTab] = useState(0)
    const tabs = [
        <MainNavigation key={0} />,
        <EditTab key={1} />,
        <ControlPanel key={2} />
    ]
    const appContextData = useContext(AppContext)
    const fadeDuration = 300
    const delay = 50
    const UserDataFunctions = appContextData.user
    const panelRef = useRef(null)
    let lang = useContext(LangContext)
    let langHome = lang.home

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem('userData')))
    }, [])
    if (!userData) return
    return (<>
        <HomeContext.Provider value={{
            currentTab: currentTab, setCurrentTab: setCurrentTab,
            navigateTo: navigateTo
        }}>
            {tabs[currentTab]}
        </HomeContext.Provider>
    </>
    )
    function navigateTo(tab, stopAnimation) {
        const vw = document.documentElement.clientWidth;
        if (!stopAnimation && vw > 800) {
            panelRef.current.style.animationDuration = fadeDuration / 1000 + 's'
            panelRef.current.style.animationName = 'fadeInOut'
            setTimeout(() => {
                setCurrentTab(tab)
            }, fadeDuration + delay);
        }
        else setCurrentTab(tab)
    }
    function logout() {
        fetch(prepareFetch('/api/auth/logout'), {
            credentials: 'include',
        }).then((response => {
            if (!response.ok) return
            document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            UserDataFunctions.setUserData(null)
        }))
    }
    function MainNavigation() {
        if (!userData) return null
        return (
            <div className="mainPanelHome tabSelector" ref={panelRef}>
                <div>
                    <UserAvatar user={userData} />
                </div>
                <div className="buttons">
                    {userData.role == 100 || userData.role==50 ?
                        <button onClick={() => { navigateTo(2) }}>
                            <img src={cpanelIcon} alt="" />
                            {langHome.tabs[0]}</button> : null}
                    <button onClick={() => { navigateTo(1) }}>
                        <img src={editIcon} alt="" />
                        {langHome.tabs[1]}</button>
                    <button onClick={logout}>
                        <img src={logoutIcon} alt="" />
                        {langHome.tabs[2]}
                    </button>
                </div>
            </div>
        )
    }
    function EditTab() {
        const [newData, setNewData] = useState(userData)
        return (
            <div className="mainPanelHome" ref={panelRef}>
                <GoBackButton onClick={()=>{navigateTo(0)}}/>
                <UpdateUserForm userData={newData} />
            </div>
        )
    }
    function ControlPanel() {
        const [currentTab, setCurrentTab] = useState(0)
        const navRef = useRef(null)
        const langCpanel = lang.home.cpanel
        const tabs = [
            { title: langCpanel.tabs.users.title, component: <ManageUsers /> },
            /*{ title: langCpanel.tabs.history.title, component: null },
            { title: langCpanel.tabs.settings.title, component: null },*/
            { title: 'Plugins', component: <Plugins/> }
        ]
        return (
            <div className="controlPanel" ref={panelRef} >
                <GoBackButton content={lang.misc[0]} onClick={returnToHome} />
                <div className="controlPanelDisplayer">
                    <nav ref={navRef}>
                        {tabs.map((element, index) => {
                            return (
                                <button key={index}
                                    style={currentTab == index ? { borderColor: 'var(--mainColor)' } : null}
                                    onClick={() => { setCurrentTab(index) }}
                                >
                                    {element.title}
                                </button>
                            )
                        })}
                    </nav>
                    {tabs[currentTab].component}
                </div>
            </div>
        )
    }
    function returnToHome() {
        setTimeout(() => {
            setUserData(savedUserData.current)
        }, fadeDuration + 50);
        navigateTo(0)
    }
}