import React, { useEffect, useState } from 'react'
import socket from '../util/socket';
import MessagesPanel from './MessagesPanel';

export default function Chat() {
    const [theUsers, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // Initialize some properties of User
        const initProperties = (user) => {
            return { ...user, connected: true, messages: [], hasNewMessages: false };
        };

        const handleConnect = () => {
            setUsers(prevUsers =>
                prevUsers.map(user => ({
                    ...user,
                    connected: user.self ? true : user.connected,
                }))
            );
        };

        const handleDisconnect = () => {
            setUsers(prevUsers =>
                prevUsers.map(user => ({
                    ...user,
                    connected: user.self ? false : user.connected,
                }))
            );
        };

        const handleUsers = users => {
            users = users.map(user => ({
                ...user,
                self: user.userID === socket.id,
            })).map(initProperties);
            users.sort((a, b) => {
                if (a.self) return -1;
                if (b.self) return 1;
                return a.username.localeCompare(b.username);
            });
            setUsers(users);
        };

        const handleUserConnected = user => {
            setUsers(prevUsers => [...prevUsers, initProperties(user)]);
        };

        const handleUserDisconnected = id => {
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.userID === id ? { ...user, connected: false } : user
                )
            );
        };

        const handlePrivateMessage = ({ content, from }) => {
            setUsers(prevUsers =>
                prevUsers.map(user => {
                    if (user.userID === from) {
                        return {
                            ...user,
                            messages: [...user.messages, { content, fromSelf: false }],
                            hasNewMessages: user !== selectedUser,
                        };
                    }
                    return user;
                })
            );
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('users', handleUsers);
        socket.on('user connected', handleUserConnected);
        socket.on('user disconnected', handleUserDisconnected);
        socket.on('private message', handlePrivateMessage);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('users', handleUsers);
            socket.off('user connected', handleUserConnected);
            socket.off('user disconnected', handleUserDisconnected);
            socket.off('private message', handlePrivateMessage);
        }
    }, [selectedUser, theUsers]);

    const onMessage = (content) => {
        if (selectedUser) {
            socket.emit("private message", {
                content,
                to: selectedUser.userID,
            });
            setUsers(previousUsers =>
                previousUsers.map((user) =>
                    user.userID === selectedUser.userID
                        ? {
                            ...user,
                            messages: [
                                ...user.messages,
                                { content, fromSelf: true },
                            ],
                        }
                        : user
                )
            );
            setSelectedUser(
                {
                    ...selectedUser,
                    messages: [...selectedUser.messages, { content, fromSelf: true }]
                }
            );
        }
        console.log(theUsers)
    }

    // Handle selection of the users in left panel
    const onSelectUser = (user) => {
        setSelectedUser(user);
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.userID === user.userID ? { ...u, hasNewMessages: false } : u
            )
        );
    }

    return (
        <div>
            <div className='left-panel'>
                {theUsers.map((user) => (
                    <div key={user.userID} onClick={() => onSelectUser(user)} className={`user ${(selectedUser && selectedUser.userID === user.userID) ? 'selected' : ''}`}>
                        <div className='description'>
                            <div className='name'>{user.username} {user.self && ' (yourself)'}</div>
                            <div className='status'>
                                <i className={`icon ${user.connected ? 'connected' : ''}`} />
                                {user.connected ? 'Online' : 'Offline'}
                            </div>
                            <div>{user.hasNewMessages && <div className='new-messages'>!</div>}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='right-panel'>
                {selectedUser && (<MessagesPanel user={selectedUser} onMessage={onMessage} />)}
            </div>
        </div>
    )
}
