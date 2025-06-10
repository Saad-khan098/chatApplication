// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import Login from '@renderer/components/Login/Login';
import Landing from '@renderer/components/LandingPage/Landing';
import ProtectedRoute from './ProtectedRoute';
import Home from '@renderer/components/Home/Home';
import Message from '@renderer/components/Message/Message';
import { MessageProvider } from '@renderer/utils/Message/MessageContext';
import { GroupMessageProvider } from '@renderer/utils/Message/GroupMessageContext';
import Groups from '@renderer/components/Groups/Groups';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={
        <ProtectedRoute>
          <GroupMessageProvider>
            <MessageProvider>
              <Home />
            </MessageProvider>
          </GroupMessageProvider>
        </ProtectedRoute>
      }>
        <Route path="message/:id" element={<Message />} />
        <Route path="groups" element={<Groups />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
