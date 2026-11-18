import { useState } from "react";

function Logon({ onSetEmail, onSetToken}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoggingOn(true);
    try {
      const response = await fetch("/api/users/logon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.status === 200 && data.email && data.csrfToken) {
        onSetEmail(data.email);
        onSetToken(data.csrfToken);
      } else {
        setAuthError(`Authentication failed: ${data?.message}`);
      }
    } catch (error) {
      setAuthError(`Error: ${error.name} | ${error.message}`);
    } finally {
      setIsLoggingOn(false);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit} className='login-form'>
        <label htmlFor='email'>email</label>
        <input
          id="email"
          labelText="email"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        ></input>
        <label htmlFor='password'>password</label>
        <input
          id="password"
          labelText="password"
          value={password}
          required
          onChang={(event) => setPassword(event.target.value)}
        ></input>
        <button disabled={isLoggingOn}>{isLoggingOn?"Logging in...":"Log On"}</button>
      </form>
    </div>
  );
}

export default Logon;
