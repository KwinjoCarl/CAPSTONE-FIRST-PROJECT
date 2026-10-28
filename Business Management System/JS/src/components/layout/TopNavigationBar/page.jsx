import CurrentDate from './components/CurrentDate';
import LeftSideBarToggle from './components/LeftSideBarToggle';
import ProfileDropdown from './components/ProfileDropdown';
import ThemeModeToggle from './components/ThemeModeToggle';
import { Container } from 'react-bootstrap';
const page = () => {
  return <header className="app-topbar">
      <div>
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2">
              <LeftSideBarToggle />
              <CurrentDate />
            </div>
            <div className="d-flex align-items-center gap-2">
              <ThemeModeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>;
};
export default page;