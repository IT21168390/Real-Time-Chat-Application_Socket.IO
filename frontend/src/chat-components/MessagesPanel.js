import React, { useEffect, useState } from 'react'

function MessagesPanel({ user, onMessage }) {
    const [input, setInput] = useState('');

    useEffect(() => {
        console.log('messages: ', user.messages);
    }, [user.messages])

    const displaySender = (index) => {
        return (
            index === 0 || user.messages[index - 1].fromSelf !== user.messages[index].fromSelf
        );
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (input.trim()) {
            onMessage(input);
            setInput('');
        }
    }

    return (
        <div>
            <i className={`icon ${user.connected ? 'connected' : ''}`} /> {user.username}

            <ul className='messages'>
                {user.messages && user.messages.map((message, index) => (
                    <li key={index} className='message' style={{ color: 'black', backgroundColor: `${message.fromSelf ? '#ffe5b5' : '#f6fc7c'}`, paddingLeft: '10px', paddingTop: '5px' }}>
                        {displaySender(index) && (
                            <div className='sender'>{message.fromSelf ? 'Yourself:' : user.username+':'}</div>
                        )}
                        {message.content}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className='form'>
                <textarea className='input'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Enter the message...' />

                <button type='submit' disabled={!input.trim()} className='send-button'>Send Message</button>
            </form>
        </div>
    )
}

export default MessagesPanel;