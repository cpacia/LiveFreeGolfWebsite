import { useState } from 'react';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const handleLogin = async (e) => {
	  e.preventDefault();

	  try {
	    const res = await fetch('http://localhost:8080/login', {
	      method: 'POST',
	      headers: {
		'Content-Type': 'application/json',
	      },
	      credentials: 'include', // IMPORTANT: so cookies get saved
	      body: JSON.stringify({
		username,
		password,
	      }),
	    });

	    if (res.ok) {
	      window.location.href = '/admin';
		  window.location.reload();
	    } else {
	      setInvalid(true);
	    }
	  } catch (err) {
	    console.error('Login error:', err);
	    setInvalid(true);
	  }
	};


  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Admin Login</h2>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          Show password
        </label>

        {invalid && <div className="error">Invalid username or password</div>}

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

