import { useContext, useEffect, useRef, useState } from 'react'
import UserAvatar from '../userAvatar'
import UpdateUserForm from '../updateUserForm'
import editIcon from '../../../src/assets/icons/editWhite.svg'
import trashIconRed from '../../../src/assets/icons/trashIconRed.svg'
import GoBackButton from '../goBackButton'
import { getRoleProps, prepareFetch, showToast } from '../../js/functions'
import { LangContext } from '../../js/contexts'
export default function ManageUsers() {
    const [users, setUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [scrollTop, setScrollTop] = useState(0)
    const usersDisplayerRef = useRef(null)
    const detailsViewRef = useRef(null)
    const vw = useViewportWidth()
    const lang = useContext(LangContext)
    const langUsers = lang.home.cpanel.tabs.users

    function useViewportWidth() {
        const [vw, setVw] = useState(window.innerWidth);

        useEffect(() => {
            const handleResize = () => setVw(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        return vw;
    }
    useEffect(() => {
        if (usersDisplayerRef.current) {
            usersDisplayerRef.current.scrollTop = scrollTop;
        }
        if (selectedUser == null) detailsViewRef.current.classList.remove('open')
        else {
            detailsViewRef.current.classList.add('open')
        }
    }, [scrollTop, selectedUser]);
    useEffect(() => {
        getUsers()
    }, [])
    return (
        <div className='cpanelTabContainer '>
            <div className='usersMain ' style={vw < 800 && selectedUser ? { display: 'none' } : null}>
                <div className="usersDisplayer" ref={usersDisplayerRef}>
                    {users ? Object.entries(users).map((user) => {
                        return <UserWrapper user={user[1]} key={user[1].id} />
                    }) : null}
                </div>
            </div>
            {selectedUser && vw > 800 ?
                <>
                    <span className='separator' />
                </> : null}
            <div className='detailsView' ref={detailsViewRef}>
                {selectedUser ?
                    <>
                        <DetailsView />
                    </> : null}
            </div>
        </div>
    )
    function DetailsView() {
        const [showEditForm, setShowEditForm] = useState(false)
        return (
            <div className='main'>
                {showEditForm ?
                    <>
                        <GoBackButton content={lang.misc[0]} onClick={() => { setShowEditForm(false) }} />
                        <UpdateUserForm userData={selectedUser} getUsersFN={getUsers} />
                    </>
                    : <>
                        <GoBackButton content={lang.misc[0]} onClick={() => { setSelectedUser(null) }} />
                        <UserAvatar user={selectedUser} role={true} />
                        <div className='actions'>
                            <button onClick={() => { setShowEditForm(true) }}>
                                <img src={editIcon} alt="" />
                            </button>
                            <button onClick={deleteUser}>
                                <img src={trashIconRed} />
                            </button>
                        </div></>
                }
            </div>
        )
    }
    function deleteUser() {
        const id = selectedUser.id
        fetch(prepareFetch('/api/users/' + id),
            {
                method: 'DELETE',
                credentials: 'include'
            }
        ).then((response) => {
            getUsers()
            if (response.ok) return showToast(langUsers.toasts[0], 'success')
            else if (response.status == 500) showToast(lang['serverResponses'], 'error')
            showToast(langUsers.toasts[1], 'error')
        })
    }
    function UserWrapper({ user }) {
        const roleProps = getRoleProps(user.role)

        return (<div className='userAvatarWrapper' onClick={handleClick} >
            <UserAvatar user={user} />
            <div className="roleBall" style={{ backgroundColor: roleProps.color }}>

            </div>
        </div>
        )
        function handleClick() {
            if (usersDisplayerRef.current) {
                setScrollTop(usersDisplayerRef.current.scrollTop);
            }
            if (selectedUser == user) setSelectedUser(null)
            else setSelectedUser(user);

        }
    }
    async function getUsers() {
        fetch(prepareFetch('/api/users')).then(async (response) => {
            if (response.ok) {
                const json = await response.json()
                setUsers(json)
            }
            else if (response.status == 500) showToast(lang['serverResponses'], 'error')
        })
        setSelectedUser(null)
        if (detailsViewRef.current) detailsViewRef.current.classList.remove('open')
    }
}