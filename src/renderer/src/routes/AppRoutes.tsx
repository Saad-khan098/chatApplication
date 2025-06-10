// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import Login from '@renderer/components/Login/Login';
import Landing from '@renderer/components/LandingPage/Landing';
import ProtectedRoute from './ProtectedRoute';
import Home from '@renderer/components/Home/Home';
import Message from '@renderer/components/Message/Message';
import { MessageProvider } from '@renderer/utils/Message/MessageContext';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={
        <ProtectedRoute>
          <MessageProvider>
            <Home />
          </MessageProvider>
        </ProtectedRoute>
      }>
        <Route path="message/:id" element={<Message />} />

        {/* <Route index element={<Dashboard />} /> 
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
