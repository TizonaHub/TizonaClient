/* eslint-disable react/prop-types */
import { useRef, useState, useContext, useEffect } from "react"
import UserAvatar from "./userAvatar"
import { LangContext, AppContext } from "../js/contexts"
import { checkName, checkPassword, showToast, prepareFetch } from '../js/functions'
import toast from "react-hot-toast"
/**
 * 
 * @param userData
 * @param updateSelf , if true, the user updates its own data  
 * @returns 
 */
export default function UpdateUserForm({userData,getUsersFN}) {
    const [newData, setNewData] = useState(JSON.parse(JSON.stringify(userData)))
    const hiddenInput = useRef(null)
    const selectRef = useRef(null)
    let lang = useContext(LangContext)
    const appContextData = useContext(AppContext)

    const langUpdate = lang.updateForm
    lang = lang.login
    useEffect(() => {
        setNewData(JSON.parse(JSON.stringify(userData)));
        hiddenInput.current.value = ''
    }, [userData]);
    return (
        <form className="editPanel" onSubmit={handleSubmit}>
            <UserAvatar user={newData} onlyAvatar={true} containerClickFn={() => { hiddenInput.current.click() }} />
            <div className="row">
                <input type="color" value={newData.avatar.bgColor} name="bgColor" onChange={(e) => { changeData(e, 'bgColor') }} />
            </div>
            <div className="row" style={{ flexDirection: 'row' }}>
                <label htmlFor='SF'>{langUpdate[0]}: </label>
                <input type="checkbox" id="SF" name="shadowFilter" checked={newData.avatar.shadowFilter}
                    onChange={(e) => { changeData(e, 'shadowFilter') }} />
            </div>
            <div className="row">
                <label htmlFor='name'>{langUpdate[1]}: </label>
                <input type="text" name="name" id="name" value={newData.name} onChange={(e) => { changeData(e, 'name') }} />
            </div>
            <div className="row">
                <label htmlFor='username'>{langUpdate[2]}: </label>
                <input type="text" name="username" id="username" value={newData.username}
                    onChange={(e) => { changeData(e, 'username') }} placeholder={'@' + newData.name} />
            </div>
            <div className="row">
                <label htmlFor='role' >{langUpdate[3]}: </label>
                <select name="" id="" defaultValue={userData.role} ref={selectRef}>
                    <option value="0">{langUpdate[4]}</option>
                    <option value="50">{langUpdate[5]}</option>
                </select>
            </div>
            <div className="row">
                <label htmlFor='password'>{langUpdate[6]}: </label>
                <input type="password" name="password" id="password" />
            </div>
            <div className="row">
                <label htmlFor='confirmPassword'>{langUpdate[7]}: </label>
                <input type="password" name="repeatPassword" id="confirmPassword" />
            </div>
            <input type="file" name="profileImage" accept="image/*"
                ref={hiddenInput} style={{ display: 'none' }} onChange={setUserImage} />
            <input type="submit" value="Update" />

        </form>
    )
    function changeData(e, property) {
        const avatarProperties = ['bgColor', 'profileImage', 'shadowFilter']
        let json = { ...newData }
        if (avatarProperties.indexOf(property) >= 0) {
            json.avatar[property] = e.currentTarget.value
            if (property == 'shadowFilter') json.avatar[property] = e.currentTarget.checked
        }
        else json[property] = e.currentTarget.value
        setNewData(json)
    }
    function setUserImage(e) {
        const src = URL.createObjectURL(e.target.files[0]);
        const json = { ...newData }
        json.avatar.profileImage = src
        setNewData(json)
    }
    function handleSubmit(e) {
        e.preventDefault()
        const form = e.currentTarget
        const children = Object.entries(form.querySelectorAll('input[name]'))
        let errors = []
        if (children[4][1].value) errors = checkPassword(children[4][1].value, children[5][1].value, errors)
        errors = checkName(children[2][1].value, children[3][1].value, errors)
        if (errors.length <= 0) {
            let username = children[3][1].value.trim()
            if (username.length == 0) children[3][1].value = children[3][1].placeholder.slice(1)
            const formData = new FormData()
            const select = selectRef.current
            if (select) {
                formData.append('role', select.value)
            }
            const avatarProperties = ['bgColor', 'shadowFilter', 'profileImage']
            let avatarJson = {}
            let appendFiles = null
            children.forEach(element => {
                element = element[1]
                let value = element.value
                let name = element.name
                let files = element.files
                if (files && files.length > 0) return appendFiles = element.files[0]
                if (element.type == 'checkbox') value = element.checked
                if (avatarProperties.indexOf(name) < 0 && value.length > 0) formData.append(element.name, value)
                else if (avatarProperties.indexOf(name) >= 0) {
                    avatarJson[name] = value;
                }

            });
            let promiseToast = null
            const timeout = setTimeout(() => {
                promiseToast = showToast(lang.toast[9], 'loading')
            }, 150);
            formData.append('avatar', JSON.stringify(avatarJson))
            formData.append('updateUser', true)
            formData.append('file', appendFiles);
            const id = userData.id
            formData.append('userId', id)
            fetch(prepareFetch('/api/users'), { //updateUser
                credentials: 'include',
                body: formData,
                method: 'PUT'
            }).then(async (response) => {
                clearTimeout(timeout)
                toast.dismiss(promiseToast)
                if (response.ok) {
                    const user = appContextData.user
                    fetch(prepareFetch('/api/auth/me'), {
                        credentials: 'include',
                    }).then(async (response) => {
                        if (!response.ok) {
                            localStorage.removeItem('userData') //not necessary
                            document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            return console.error(response.status, ': Invalid or missing token');
                        }
                        if (await response.clone().json()) {
                            let data = await response.json()
                            showToast(lang.toast[10], 'success')
                            const currentUser = appContextData.user.userData
                            console.log('id',id);
                            console.log('currentUser.id: ', currentUser.id);
                            if (id == currentUser.id) {
                                localStorage.setItem('userData', JSON.stringify(data))
                                user.setUserData({...data})
                                if (getUsersFN)getUsersFN()
                            }
                            else if(getUsersFN)getUsersFN()
                        }
                    })
                }
                else if (response.status == 500) showToast(lang['serverResponses'], 'error')
                else showToast(lang.toast[13], 'error')
            })
        }
        else showToast(lang.toast[13], 'error')
    }
}