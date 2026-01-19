import UserAvatar from "../userAvatar";
import cpanelIcon from "@assets/icons/cpanel.svg"
import logoutIcon from "@assets/icons/logout.svg"
import editIcon from "@assets/icons/editWhite.svg"
import GoBackButton from "../goBackButton";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { AppContext, LangContext, HomeContext } from "../../js/contexts";
import {prepareFetch } from "../../js/functions";
import ManageUsers from "./manageUsers";
import UpdateUserForm from "../updateUserForm";
import Plugins from "./plugins";

const MainPanelHome = memo(function MainPanelHome() {
    const savedUserData = useRef(null)
    savedUserData.current = JSON.parse(localStorage.getItem('userData'))
    const [userData, setUserData] = useState(null)
    const [currentTab, setCurrentTab] = useState(0)
    const appContextData = useContext(AppContext)
    const fadeDuration = 300
    const delay = 50
    const UserDataFunctions = appContextData.user
    const panelRef = useRef(null)
    let lang = useContext(LangContext)
    let langHome = lang.home
    const tabs = useRef([
        <MainNavigation key={0} />,
        <EditTab key={1} />,
        <ControlPanel key={2} />
    ])

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem('userData')))
    }, [appContextData.user.userData])
    useEffect(() => {
    }, [userData])
    if (!userData) return
    return (<>
        <HomeContext.Provider value={{
            currentTab, setCurrentTab,
            navigateTo, userData, setUserData
        }}>
            {tabs.current[currentTab]}
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
            UserDataFunctions.setUserData(false)
        }))
    }
    function MainNavigation() {
        const contextData = useContext(HomeContext)
        const userData = contextData.userData
        if (!userData) return null
        return (
            <div className="mainPanelHome tabSelector" ref={panelRef}>
                <div>
                    <UserAvatar user={userData} />
                </div>
                <div className="buttons">
                    {userData.role == 100 || userData.role == 50 ?
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
        const contextData = useContext(HomeContext)
        const userData = contextData.userData
        return (
            <div className="mainPanelHome" ref={panelRef}>
                <GoBackButton onClick={() => { navigateTo(0) }} />
                <UpdateUserForm userData={userData} />
            </div>
        )
    }
    function ControlPanel() {
        const [currentTab, setCurrentTab] = useState(0)
        const navRef = useRef(null)
        const langCpanel = lang.home.cpanel
        const tabs = [
            { title: langCpanel.tabs.users.title, component: <ManageUsers /> },
            { title: 'Plugins', component: <Plugins /> }
        ]
        useEffect(() => {
        })
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
})

export default MainPanelHome