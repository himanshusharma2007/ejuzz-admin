import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./screens/Login";
import Layout from "./component/layout/Layout";
import { fetchUser } from "./redux/slices/userSlice";
import { useDispatch } from "react-redux";
import Dashboard from "./page/Dashboard";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        >
          {/* Add your CRM pages here */}
          <Route index element={<div>Dashboard</div>} />
          <Route path="/profile" element={<div>Profile</div>} />
          {/* Add more routes for other CRM pages */}
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
