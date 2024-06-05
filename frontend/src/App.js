import { useEffect, useState } from 'react';
import './App.css';
import Chat from './chat-components/Chat';
import socket from './util/socket';

function App() {
  const [userName, setUsername] = useState('');
  const [userNameSubmitted, setUserNameSubmitted] = useState(false);

  const sendUserName = (event) => {
    event.preventDefault();
    if (!(userName.length > 2)) {
      return;
    }
    console.log('Username: ', userName);
    setUserNameSubmitted(true);
    socket.auth = { username: userName };
    socket.connect();
  }

  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");
    // Initiate connection if a sessionID is already available
    if (sessionID) {
      setUserNameSubmitted(true);
      socket.auth = { sessionID };
      socket.connect();
    }


    socket.on("session", ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    const handleError = (err) => {
      if (err.message === "invalid username") {
        setUserNameSubmitted(false);
      }
    };

    socket.on('connect_error', handleError);

    return () => {
      socket.off("connect_error");
    }
  }, []);

  return (
    <>
      {userNameSubmitted ? <Chat />
        :
        (
          <form onSubmit={sendUserName} className="username-form" style={{ alignItems: 'center', marginInline: 'auto', marginTop: '300px' }}>
            <input type='text' placeholder='Enter your Username...' onChange={(e) => setUsername(e.target.value)} className="username-input" />
            <button type='submit' className="submit-button">SEND</button>
          </form>
        )
      }
    </>
  );
}

export default App;
