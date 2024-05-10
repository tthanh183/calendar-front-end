import React, { useState } from 'react';
import './App.css';
import CustomCalendar from './components/Calendar';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLoginSuccess = (id) => {
    setIsLoggedIn(true);
    setUserId(id); // Lưu id của người dùng sau khi đăng nhập
  };

  return (
    <div style={{ height: '500px' }}>
      {isLoggedIn ? (
        <div>
          <CustomCalendar userId={userId} /> {/* Truyền userId vào component Calendar */}
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
