import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { refreshAccessToken } from './apis/userApis';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './redux/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(refreshAccessToken());
  }, [dispatch]);
  return (
    <>
      <ToastContainer position='top-right' autoClose={2000} />
      <AppRoutes />
    </>
  )
}

export default App
