import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        body: formData
      });
      const userId = await response.text(); // Lấy id của người dùng

      if (response.ok) {
        onLoginSuccess(userId); // Gọi hàm xử lý khi đăng nhập thành công và truyền id của người dùng
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
