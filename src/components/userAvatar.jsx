/* eslint-disable react/prop-types */
import { useEffect } from 'react'
import { getFileSrc, getRoleProps } from '../js/functions'
import { prepareFetch } from '../js/functions'
export default function UserAvatar({ user, onlyAvatar, role, containerClickFn }) {
    if ((!user || !user.name) && !user.avatar.profileImage) return null
    const profileImage = user.avatar.profileImage ? prepareFetch(user.avatar.profileImage) : null
    let styles = {}
    if (user.avatar.shadowFilter) styles = { ...styles, filter: 'drop-Shadow(0 0 5px black)' }

    let avatar = profileImage ? <img src={profileImage} style={styles} />
        : <span className="userLetter">{user.name[0].toUpperCase()}</span>

    const RoleTag = () => {
        const role = getRoleProps(user.role)
        return (
            <span style={{ background: role.color }}
                className="roleTag">{role.role}</span>
        )
    }
    return <div className="userAvatar">
        <div className="avatarContainer"
            onClick={containerClickFn}
            style={{ backgroundColor: user.avatar.bgColor }}>
            {avatar}
        </div>
        {role ? <RoleTag /> : ''}
        {!onlyAvatar ?
            <div className="names">
                <span>{user.name}</span>
                <span>{'@' + user.username}</span>
            </div> : null}
    </div>

}