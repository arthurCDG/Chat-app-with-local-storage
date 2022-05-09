import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState({});

  // Ensure that there always is a user item in local storage
  useEffect(() => {
    const allUsers = localStorage.getItem("users") || users;

    if (!allUsers.length) {
      localStorage.setItem("users", []);
    } else {
      setUsers(JSON.parse(allUsers));
    }
  }, []);

  // Ensure that there always is a conversation item in local storage
  useEffect(() => {
    const allConversations =
      localStorage.getItem("conversations") || conversations;

    if (!allConversations.length) localStorage.setItem("conversations", []);

    if (allConversations.length) setConversations(JSON.parse(allConversations));
  }, []);

  // Function to logout
  const logOut = () => setIsLoggedIn(false);

  const sendMessage = () => {
    const msg = document.getElementById("message-box").value;

    // Add message to current conversation
    activeConversation.messages.push({
      sender: currentUser.username,
      recipient: activeConversation.users.filter(
        (user) => user !== currentUser.username
      )[0],
      content: msg,
    });

    // Retrieve all conversations except the current active one
    const allConversationsExcludingThisOne = conversations.filter(
      (conv) =>
        !(
          conv.users.includes(activeConversation.users[0]) &&
          conv.users.includes(activeConversation.users[1])
        )
    );

    // Add the modified conversation
    setConversations([...allConversationsExcludingThisOne, activeConversation]);

    // Change the conversations array in local storage
    localStorage.setItem(
      "conversations",
      JSON.stringify([...allConversationsExcludingThisOne, activeConversation])
    );

    // Empty the input for UX
    document.getElementById("message-box").value = "";
  };

  const changeActiveConversation = (otherPersonName) => {
    // First check if there already exists a conversation between the two users
    const conv = conversations.filter(
      (conversation) =>
        conversation.users?.includes(otherPersonName) &&
        conversation.users?.includes(currentUser.username)
    );

    // If it is the case, set it as the active conversation
    if (conv.length) {
      setActiveConversation(conv[0]);
      // Else, create the conversation, push it to local storage and set it as the active conversation
    } else {
      const newConv = {
        users: [currentUser.username, otherPersonName],
        messages: [],
      };

      localStorage.setItem(
        "conversations",
        JSON.stringify([...conversations, newConv])
      );

      setActiveConversation(newConv);
      setConversations((prevConv) => [...prevConv, newConv]);
    }
  };

  const handleFormClick = (event) => {
    event.preventDefault();

    // Retrieve all users except the one signing in (to prevent doubles)
    const allUsersExceptThisOne = users.filter((u) => u.username !== username);

    const user = { username, password };

    // Add it to local storage with all other users
    localStorage.setItem(
      "users",
      JSON.stringify([...allUsersExceptThisOne, user])
    );

    setUsers([...allUsersExceptThisOne, user]);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <h1>Luccal storage chat app (Jean-Blaguin)</h1>

      {!isLoggedIn && (
        <form className="login-form">
          <input
            type="text"
            name="username"
            id="username-input"
            placeholder="username"
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            name="password"
            id="password-input"
            placeholder="password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="btn" onClick={(event) => handleFormClick(event)}>
            Enter
          </button>
        </form>
      )}

      {isLoggedIn && (
        <div>
          <header>
            <h2>Welcome {currentUser.username}!</h2>
            <button onClick={logOut} className="btn" id="log-out">
              Log out
            </button>
          </header>
          <div className="app-frame">
            <div className="left-menu">
              <div className="top-left-menu">
                <h3>Your contacts</h3>
              </div>
              <div className="all-other-users">
                {users?.length <= 1 && (
                  <p>You don't have any contact for the moment</p>
                )}

                {users?.length > 1 &&
                  users
                    .filter((user) => user.username !== currentUser.username)
                    .map((user, index) => {
                      return (
                        <div
                          key={index}
                          onClick={() =>
                            changeActiveConversation(user.username)
                          }
                          className="user-frame"
                          style={{
                            backgroundColor:
                              activeConversation?.users?.includes(user.username)
                                ? "rgb(207, 207, 243)"
                                : "white",
                          }}
                        >
                          <h4>{user.username}</h4>
                        </div>
                      );
                    })}
              </div>
            </div>
            <div className="right-chat">
              <div className="top-right-chat">
                {activeConversation?.users && (
                  <h3>
                    This is your discussion with{" "}
                    {
                      activeConversation.users.filter(
                        (u) => u !== currentUser.username
                      )[0]
                    }
                  </h3>
                )}
              </div>
              <div className="chat-box">
                {!activeConversation?.messages && (
                  <p>Start the conversation!</p>
                )}

                {activeConversation.messages &&
                  activeConversation.messages.map((message, index) => {
                    return message.sender === currentUser.username ? (
                      <div key={index} className="right-msg-div">
                        <div className="right-msg">{message.content}</div>
                      </div>
                    ) : (
                      <div key={index} className="left-msg-div">
                        <div className="left-msg">{message.content}</div>
                      </div>
                    );
                  })}
              </div>
              <div className="message-box-and-btn">
                <input
                  type="text"
                  id="message-box"
                  placeholder="Your message"
                />
                <button onClick={sendMessage} id="send-btn" className="btn">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
