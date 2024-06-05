import React, { useEffect, useState } from 'react'
import socket from '../socket';
import MessagesPanel from './MessagesPanel';

export default function Chat() {
    const [theUsers, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const initReactiveProperties = (user) => {
            return { ...user, connected: true, messages: [], hasNewMessages: false };
        };

        /*socket.on("users", (users) => {
            users.forEach((user) => {
                user.self = user.userID === socket.id;
                initReactiveProperties(user);
            });
            // put the current user first, and then sort by username
            const usersToSet = users.sort((a, b) => {
                if (a.self) return -1;
                if (b.self) return 1;
                if (a.username < b.username) return -1;
                return a.username > b.username ? 1 : 0;
            });
            setUsers(usersToSet);
        });

        socket.on("user connected", (user) => {
            initReactiveProperties(user);
            theUsers.push(user);
        });

        socket.on("user disconnected", (id) => {
            for (let i = 0; i < theUsers.length; i++) {
                const user = theUsers[i];
                if (user.userID === id) {
                    user.connected = false;
                    break;
                }
            }
        });

        socket.on("private message", ({ content, from }) => {
            for (let i = 0; i < theUsers.length; i++) {
                const user = theUsers[i];
                if (user.userID === from) {
                    user.messages.push({
                        content,
                        fromSelf: false,
                    });
                    if (user !== selectedUser) {
                        user.hasNewMessages = true;
                    }
                    break;
                }
            }
        });

        socket.on("connect", () => {
            theUsers.forEach((user) => {
                if (user.self) {
                    user.connected = true;
                }
            });
        });

        socket.on("disconnect", () => {
            theUsers.forEach((user) => {
                if (user.self) {
                    user.connected = false;
                }
            });
        });
        */
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
            })).map(initReactiveProperties);
            users.sort((a, b) => {
                if (a.self) return -1;
                if (b.self) return 1;
                return a.username.localeCompare(b.username);
            });
            setUsers(users);
        };

        const handleUserConnected = user => {
            setUsers(prevUsers => [...prevUsers, initReactiveProperties(user)]);
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
            /*socket.off("connect");
            socket.off("disconnect");
            socket.off("users");
            socket.off("user connected");
            socket.off("user disconnected");
            socket.off("private message");*/
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
            setSelectedUser({ ...selectedUser, messages: [...selectedUser.messages, { content, fromSelf: true }] });
            /*selectedUser.messages.push({
                content,
                fromSelf: true,
            });*/
        }
        console.log(theUsers)
    }

    const onSelectUser = (user) => {
        //setSelectedUser({ ...user, hasNewMessages: false });
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
