import Sidebar from './Sidebar';

const Layout = ({children}) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
       {children}
      </main>
    </div>
  );
};

export default Layout;