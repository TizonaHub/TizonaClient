/* eslint-disable react/prop-types */
import { useRef, useState, useContext } from "react"
import { showToast, checkName, checkPassword, prepareFetch } from '../../js/functions.jsx'
import { LangContext, AppContext } from "../../js/contexts.js"
import toast from 'react-hot-toast';
const env = import.meta.env

export default function LoginForm() {
    let [login, setLogin] = useState(true)
    let [adminCreated, setAdminCreated] = useState(false)
    let style = {
        color: 'var(--mainColor)', marginLeft: '5px', textDecoration: 'underline',
        cursor: 'pointer'
    }
    let lang = useContext(LangContext)
    let app = useContext(AppContext)
    lang = lang.login
    //if (adminCreated && adminCreated.role >= 100) return <AdminCreatedComponent />
    return login ? <Login /> : <Register />

    function Login() {
        return (
            <form className="loginForm" onSubmit={loginUser}>
                <h2>{lang.loginForm[0]}</h2>
                <h3>{lang.loginForm[1]}</h3>
                <input type="text" />
                <h3>{lang.loginForm[2]}</h3>
                <input type="password" />
                <input type="submit" value={lang.loginForm[3]} />
                <span style={{ marginTop: '30px' }}>{lang.loginForm[4]}
                    <span style={style} onClick={toggleTab}>{lang.loginForm[5]}</span></span>
            </form>)
        function loginUser(e) {
            e.preventDefault()
            const formData = new FormData()
            const form = Array.from(document.querySelectorAll('input'))
            formData.append('username', form[0].value)
            formData.append('password', form[1].value)
            const promiseToast = showToast(lang.toast[7], 'loading')
            fetch(prepareFetch('/api/auth/login'), {
                method: 'POST',
                body: formData
            }).then(async (response) => {
                toast.dismiss(promiseToast)
                if (response.ok) {
                    let json = await response.json()

                    if (json && json.userToken) {
                        LoadUserData(json)
                    }
                }
                else showToast(lang.toast[8], 'error')
            })
        }
    }
    function LoadUserData(json) {
        localStorage.setItem('userData', JSON.stringify(json.userData))
        const cookie = 'userToken=' + JSON.stringify(json.userToken).slice(1, json.userToken.length + 1) + ';path=/;max-age=5184000;'
        if (env.VITE_MODE == 'development') document.cookie = cookie
        app.FRApp.setFRApp(app.FRApp.FRApp + 1)

    }
    function Register() {
        let usernameRef = useRef(null)
        return (
            <form className="registerForm" onSubmit={registerUser}>
                <h2>{lang.loginForm[6]}</h2>
                <h3>{lang.loginForm[7]}</h3>
                <input type="text" onChange={setUsername} name="name" />
                <h3>{lang.loginForm[8]}</h3>
                <input type="text" ref={usernameRef} name="username" onChange={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replaceAll(' ', '_');
                }} />
                <h3>{lang.loginForm[2]}</h3>
                <input type="password" name="password" />
                <h3>{lang.loginForm[9]}</h3>
                <input type="password" name="repeatPassword" />
                <input type="submit" value={lang.loginForm[3]} />
                <span style={{ marginTop: '30px' }}>{lang.loginForm[10]}
                    <span style={style} onClick={toggleTab}>{lang.loginForm[11]}</span></span>
            </form>)
        function setUsername(e) {
            let value = e.currentTarget.value
            usernameRef.current.placeholder = value.length > 0 ? '@' + value : ''
            usernameRef.current.placeholder = usernameRef.current.placeholder.replaceAll(' ', '_')
        }
        function registerUser(e) {
            e.preventDefault()
            let form = e.currentTarget
            let formData = new FormData()
            let inputs = form.querySelectorAll("input[type='text'],input[type='password']")
            let errors = []
            errors = checkPassword(inputs[2].value, inputs[3].value, errors)
            errors = checkName(inputs[0].value, inputs[1].value, errors)
            if (errors.length === 0) {
                let username = inputs[1].value.trim()
                if (username.length == 0) username = inputs[1].placeholder.slice(1)
                const promiseToast = showToast(lang.toast[5], 'loading')
                const name = inputs[0].value.trim()
                const password = inputs[2].value.trim()
                formData.append('name', name)
                formData.append('username', username)
                formData.append('password', password)
                fetch(prepareFetch('/api/users'), {
                    method: 'POST',
                    body: formData
                }).then(async (response) => {
                    toast.dismiss(promiseToast)
                    if (response.ok) {
                        let json = null
                        showToast(lang.toast[6], 'success')
                        try {
                            json = await response.json();
                            if (json && json.userToken) {
                                LoadUserData(json)
                            }
                            if (json && json.userData.role == 100) {
                                setAdminCreated(json.userData)
                            }
                        } catch (error) {
                            console.error('error: ', error.msg);
                        }
                        return
                    }
                    else if (response.status == 500) showToast(lang['serverResponses'], 'error')
                    let code = await response.json()
                    showToast(lang.toast[lang.toast.length - 1], 'error')
                })
            }
            else {
                showToast(lang.toast[errors[0]], 'error')
            }
        }
    }
    function AdminCreatedComponent() {
        let data = adminCreated
        return (<div className="adminCreatedComponent">
            <h2>Welcome {data.name}!</h2>
            <p>You are the first user on this server, so you have super admin privileges!</p>
        </div>)
    }
    function toggleTab() {
        login ? setLogin(false) : setLogin(true)
    }

}

/*MESSSAGE CODES
0:Passwords do not match
1:Password length must be longer than 8 and lower than 25
2:Name must not be empty
3:Name length is too long
4:Password is empty
*/