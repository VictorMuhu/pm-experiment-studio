
import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';
import TopNavBar from './TopNavBar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-surface font-body text-on-surface">
      <SideNavBar />
      <TopNavBar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto ml-64 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;